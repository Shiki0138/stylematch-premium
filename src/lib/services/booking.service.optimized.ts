import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc,
  updateDoc,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firestore';
import { cache } from 'react';

export interface OptimizedBooking {
  id: string;
  userId: string;
  stylistId: string;
  scheduledAt: Date;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  service: {
    id: string;
    name: string;
    price: number;
  };
  // ユーザーと美容師の情報を含む
  user?: {
    name: string;
    email: string;
    phoneNumber?: string;
  };
  stylist?: {
    name: string;
    salonName: string;
    profileImage?: string;
  };
}

export class OptimizedBookingService {
  // キャッシュキー
  private static CACHE_KEYS = {
    STYLIST_BOOKINGS: 'stylist_bookings',
    USER_BOOKINGS: 'user_bookings',
    AVAILABLE_SLOTS: 'available_slots'
  };

  /**
   * 美容師の予約一覧を取得（最適化版）
   * - 関連データを1回のクエリで取得
   * - ページネーション対応
   * - キャッシュ機能
   */
  static getStylistBookingsOptimized = cache(async (
    stylistId: string,
    startDate: Date,
    endDate: Date,
    lastDoc?: DocumentSnapshot,
    pageSize: number = 20
  ): Promise<{ bookings: OptimizedBooking[], lastDoc: DocumentSnapshot | null }> => {
    try {
      // クエリ構築
      let q = query(
        collection(db, 'bookings'),
        where('stylistId', '==', stylistId),
        where('scheduledAt', '>=', Timestamp.fromDate(startDate)),
        where('scheduledAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('scheduledAt', 'asc'),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { bookings: [], lastDoc: null };
      }

      // 予約データを取得
      const bookings: OptimizedBooking[] = [];
      const userIds = new Set<string>();
      const serviceIds = new Set<string>();

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        userIds.add(data.userId);
        serviceIds.add(data.serviceId);
      });

      // ユーザー情報を一括取得
      const userPromises = Array.from(userIds).map(userId => 
        getDoc(doc(db, 'users', userId))
      );
      const userDocs = await Promise.all(userPromises);
      const userMap = new Map();
      userDocs.forEach(doc => {
        if (doc.exists()) {
          userMap.set(doc.id, doc.data());
        }
      });

      // サービス情報を一括取得（必要に応じて）
      const servicePromises = Array.from(serviceIds).map(serviceId =>
        getDoc(doc(db, 'services', serviceId))
      );
      const serviceDocs = await Promise.all(servicePromises);
      const serviceMap = new Map();
      serviceDocs.forEach(doc => {
        if (doc.exists()) {
          serviceMap.set(doc.id, doc.data());
        }
      });

      // 予約データを構築
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const userData = userMap.get(data.userId);
        const serviceData = serviceMap.get(data.serviceId);

        bookings.push({
          id: doc.id,
          userId: data.userId,
          stylistId: data.stylistId,
          scheduledAt: data.scheduledAt.toDate(),
          duration: data.duration,
          status: data.status,
          service: {
            id: data.serviceId,
            name: serviceData?.name || 'Unknown Service',
            price: serviceData?.price || 0
          },
          user: userData ? {
            name: userData.name,
            email: userData.email,
            phoneNumber: userData.phoneNumber
          } : undefined
        });
      });

      const lastDocument = snapshot.docs[snapshot.docs.length - 1] || null;

      return { bookings, lastDoc: lastDocument };
    } catch (error) {
      console.error('Error fetching stylist bookings:', error);
      throw error;
    }
  });

  /**
   * 利用可能な時間枠を効率的に計算
   */
  static async getAvailableSlotsOptimized(
    stylistId: string,
    date: Date,
    serviceDuration: number,
    workingHours: { start: string; end: string } = { start: '09:00', end: '18:00' }
  ): Promise<string[]> {
    try {
      // その日の予約を一度に取得
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('stylistId', '==', stylistId),
        where('scheduledAt', '>=', Timestamp.fromDate(startOfDay)),
        where('scheduledAt', '<=', Timestamp.fromDate(endOfDay)),
        where('status', 'in', ['confirmed', 'pending'])
      );

      const snapshot = await getDocs(bookingsQuery);
      
      // 予約済み時間帯をマップに変換（高速検索用）
      const bookedSlots = new Map<string, boolean>();
      snapshot.docs.forEach(doc => {
        const booking = doc.data();
        const startTime = booking.scheduledAt.toDate();
        const endTime = new Date(startTime.getTime() + booking.duration * 60000);
        
        // 予約時間帯をマーク
        let current = new Date(startTime);
        while (current < endTime) {
          const timeString = `${current.getHours().toString().padStart(2, '0')}:${current.getMinutes().toString().padStart(2, '0')}`;
          bookedSlots.set(timeString, true);
          current.setMinutes(current.getMinutes() + 30); // 30分刻み
        }
      });

      // 利用可能な時間枠を生成
      const availableSlots: string[] = [];
      const [startHour, startMinute] = workingHours.start.split(':').map(Number);
      const [endHour, endMinute] = workingHours.end.split(':').map(Number);
      
      const currentTime = new Date(date);
      currentTime.setHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(date);
      endTime.setHours(endHour, endMinute, 0, 0);

      while (currentTime < endTime) {
        const timeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
        
        // サービス時間分の空きがあるかチェック
        let isAvailable = true;
        let checkTime = new Date(currentTime);
        for (let i = 0; i < serviceDuration / 30; i++) {
          const checkTimeString = `${checkTime.getHours().toString().padStart(2, '0')}:${checkTime.getMinutes().toString().padStart(2, '0')}`;
          if (bookedSlots.has(checkTimeString)) {
            isAvailable = false;
            break;
          }
          checkTime.setMinutes(checkTime.getMinutes() + 30);
        }
        
        if (isAvailable && checkTime <= endTime) {
          availableSlots.push(timeString);
        }
        
        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }

      return availableSlots;
    } catch (error) {
      console.error('Error calculating available slots:', error);
      throw error;
    }
  }

  /**
   * 予約の一括作成（トランザクション使用）
   */
  static async createBulkBookings(
    bookings: Array<Omit<OptimizedBooking, 'id'>>
  ): Promise<string[]> {
    try {
      const batch = writeBatch(db);
      const bookingIds: string[] = [];

      bookings.forEach(booking => {
        const bookingRef = doc(collection(db, 'bookings'));
        batch.set(bookingRef, {
          ...booking,
          scheduledAt: Timestamp.fromDate(booking.scheduledAt),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        bookingIds.push(bookingRef.id);
      });

      await batch.commit();
      return bookingIds;
    } catch (error) {
      console.error('Error creating bulk bookings:', error);
      throw error;
    }
  }

  /**
   * 予約ステータスの一括更新
   */
  static async updateBookingStatuses(
    updates: Array<{ id: string; status: OptimizedBooking['status'] }>
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      updates.forEach(({ id, status }) => {
        const bookingRef = doc(db, 'bookings', id);
        batch.update(bookingRef, {
          status,
          updatedAt: Timestamp.now()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error updating booking statuses:', error);
      throw error;
    }
  }
}