import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Booking, BookingStatus, ServiceType, PaymentMethod } from '@/types/models';

interface CreateBookingData {
  userId: string;
  stylistId: string;
  date: Date;
  duration: number;
  serviceType: ServiceType;
  price: number;
  notes?: string;
  diagnosis: {
    faceShape: string;
    personalColor: string;
  };
}

export class BookingService {
  /**
   * 新規予約を作成
   */
  static async createBooking(data: CreateBookingData): Promise<string> {
    try {
      const bookingData = {
        userId: data.userId,
        stylistId: data.stylistId,
        date: Timestamp.fromDate(data.date),
        duration: data.duration,
        service: {
          type: data.serviceType,
          price: data.price
        },
        status: 'pending' as BookingStatus,
        diagnosis: data.diagnosis,
        payment: {
          method: null,
          status: 'pending',
          amount: data.price
        },
        notes: data.notes || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      return docRef.id;
    } catch (error) {
      console.error('予約作成エラー:', error);
      throw error;
    }
  }

  /**
   * 予約のステータスを更新
   */
  static async updateBookingStatus(
    bookingId: string, 
    status: BookingStatus
  ): Promise<void> {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('予約ステータス更新エラー:', error);
      throw error;
    }
  }

  /**
   * 支払い情報を更新
   */
  static async updatePaymentInfo(
    bookingId: string,
    paymentMethod: PaymentMethod,
    paymentStatus: 'pending' | 'completed' | 'refunded'
  ): Promise<void> {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        'payment.method': paymentMethod,
        'payment.status': paymentStatus,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('支払い情報更新エラー:', error);
      throw error;
    }
  }

  /**
   * 予約情報を取得
   */
  static async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      if (bookingDoc.exists()) {
        return { id: bookingDoc.id, ...bookingDoc.data() } as Booking;
      }
      return null;
    } catch (error) {
      console.error('予約情報取得エラー:', error);
      throw error;
    }
  }

  /**
   * ユーザーの予約一覧を取得
   */
  static async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const bookings: Booking[] = [];

      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() } as Booking);
      });

      return bookings;
    } catch (error) {
      console.error('ユーザー予約取得エラー:', error);
      throw error;
    }
  }

  /**
   * 美容師の予約一覧を取得
   */
  static async getStylistBookings(
    stylistId: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<Booking[]> {
    try {
      let q = query(
        collection(db, 'bookings'),
        where('stylistId', '==', stylistId)
      );

      if (startDate && endDate) {
        q = query(
          collection(db, 'bookings'),
          where('stylistId', '==', stylistId),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate)),
          orderBy('date', 'asc')
        );
      }

      const querySnapshot = await getDocs(q);
      const bookings: Booking[] = [];

      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() } as Booking);
      });

      return bookings;
    } catch (error) {
      console.error('美容師予約取得エラー:', error);
      throw error;
    }
  }

  /**
   * 予約可能時間を取得
   */
  static async getAvailableSlots(
    stylistId: string,
    date: Date,
    serviceDuration: number
  ): Promise<Date[]> {
    try {
      // 営業時間（仮に10:00-20:00とする）
      const openingHour = 10;
      const closingHour = 20;
      const slotInterval = 30; // 30分間隔

      // 指定日の予約を取得
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const existingBookings = await this.getStylistBookings(
        stylistId,
        startOfDay,
        endOfDay
      );

      // 予約済み時間帯を抽出
      const bookedSlots: { start: Date; end: Date }[] = existingBookings
        .filter(booking => booking.status !== 'cancelled')
        .map(booking => ({
          start: booking.date.toDate(),
          end: new Date(booking.date.toDate().getTime() + booking.duration * 60000)
        }));

      // 利用可能なスロットを生成
      const availableSlots: Date[] = [];
      const currentDate = new Date();

      for (let hour = openingHour; hour < closingHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotInterval) {
          const slotStart = new Date(date);
          slotStart.setHours(hour, minute, 0, 0);
          
          const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);

          // 営業時間内かチェック
          if (slotEnd.getHours() > closingHour || 
              (slotEnd.getHours() === closingHour && slotEnd.getMinutes() > 0)) {
            continue;
          }

          // 過去の時間はスキップ
          if (slotStart <= currentDate) {
            continue;
          }

          // 既存予約との重複チェック
          const isBooked = bookedSlots.some(booked => {
            return (slotStart >= booked.start && slotStart < booked.end) ||
                   (slotEnd > booked.start && slotEnd <= booked.end) ||
                   (slotStart <= booked.start && slotEnd >= booked.end);
          });

          if (!isBooked) {
            availableSlots.push(slotStart);
          }
        }
      }

      return availableSlots;
    } catch (error) {
      console.error('予約可能時間取得エラー:', error);
      throw error;
    }
  }

  /**
   * 予約をキャンセル
   */
  static async cancelBooking(bookingId: string): Promise<void> {
    try {
      await this.updateBookingStatus(bookingId, 'cancelled');
      
      // TODO: キャンセル料の計算と返金処理
    } catch (error) {
      console.error('予約キャンセルエラー:', error);
      throw error;
    }
  }

  /**
   * リマインダー送信対象の予約を取得
   */
  static async getBookingsForReminder(): Promise<Booking[]> {
    try {
      // 明日の予約を取得
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const q = query(
        collection(db, 'bookings'),
        where('date', '>=', Timestamp.fromDate(tomorrow)),
        where('date', '<', Timestamp.fromDate(dayAfterTomorrow)),
        where('status', '==', 'confirmed')
      );

      const querySnapshot = await getDocs(q);
      const bookings: Booking[] = [];

      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() } as Booking);
      });

      return bookings;
    } catch (error) {
      console.error('リマインダー対象取得エラー:', error);
      throw error;
    }
  }
}