import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  GeoPoint,
  QueryDocumentSnapshot,
  DocumentData,
  CollectionReference,
  Query
} from 'firebase/firestore';
import { db } from './config';
import { 
  UserProfile, 
  DiagnosisResult, 
  StylistProfile, 
  Review, 
  Booking, 
  Message,
  MatchingResult 
} from '@/types/database';

// ヘルパー関数
const convertTimestamp = (data: any) => {
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    }
  });
  return converted;
};

// Users Collection
export class UserService {
  private static collection = collection(db, 'users');
  
  static async getUser(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(this.collection, userId));
      if (!userDoc.exists()) return null;
      
      return convertTimestamp(userDoc.data()) as UserProfile;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
  
  static async createUser(userId: string, userData: Partial<UserProfile>): Promise<void> {
    try {
      const newUser: UserProfile = {
        uid: userId,
        email: userData.email || '',
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        isPublic: false,
        allowNotifications: true,
        preferredLanguage: 'ja',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...userData
      };
      
      await setDoc(doc(this.collection, userId), newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  static async updateUser(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await updateDoc(doc(this.collection, userId), updateData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  static async updateLastLogin(userId: string): Promise<void> {
    try {
      await updateDoc(doc(this.collection, userId), {
        lastLoginAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }
}

// Diagnosis Results Service
export class DiagnosisService {
  static async saveDiagnosis(userId: string, diagnosisData: Partial<DiagnosisResult>): Promise<string> {
    try {
      const diagnosisRef = doc(collection(db, 'users', userId, 'diagnoses'));
      const diagnosis: DiagnosisResult = {
        id: diagnosisRef.id,
        userId,
        createdAt: new Date(),
        aiVersion: '1.0.0',
        ...diagnosisData
      } as DiagnosisResult;
      
      await setDoc(diagnosisRef, diagnosis);
      return diagnosisRef.id;
    } catch (error) {
      console.error('Error saving diagnosis:', error);
      throw error;
    }
  }
  
  static async getUserDiagnoses(userId: string, limitCount: number = 10): Promise<DiagnosisResult[]> {
    try {
      const q = query(
        collection(db, 'users', userId, 'diagnoses'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => 
        convertTimestamp(doc.data()) as DiagnosisResult
      );
    } catch (error) {
      console.error('Error getting user diagnoses:', error);
      return [];
    }
  }
  
  static async getLatestDiagnosis(userId: string): Promise<DiagnosisResult | null> {
    try {
      const diagnoses = await this.getUserDiagnoses(userId, 1);
      return diagnoses.length > 0 ? diagnoses[0] : null;
    } catch (error) {
      console.error('Error getting latest diagnosis:', error);
      return null;
    }
  }
}

// Stylists Service
export class StylistService {
  private static collection = collection(db, 'stylists');
  
  static async getStylist(stylistId: string): Promise<StylistProfile | null> {
    try {
      const stylistDoc = await getDoc(doc(this.collection, stylistId));
      if (!stylistDoc.exists()) return null;
      
      return convertTimestamp(stylistDoc.data()) as StylistProfile;
    } catch (error) {
      console.error('Error getting stylist:', error);
      return null;
    }
  }
  
  static async getStylists(filters: {
    prefecture?: string;
    specialties?: string[];
    minRating?: number;
    maxDistance?: number;
    userLocation?: { lat: number; lng: number };
    limit?: number;
  } = {}): Promise<StylistProfile[]> {
    try {
      let q: Query<DocumentData> = this.collection as CollectionReference<DocumentData>;
      
      // フィルター適用
      if (filters.prefecture) {
        q = query(q, where('location.prefecture', '==', filters.prefecture));
      }
      
      if (filters.minRating) {
        q = query(q, where('ratings.overall', '>=', filters.minRating));
      }
      
      // アクティブな美容師のみ
      q = query(q, where('isActive', '==', true));
      
      // 評価順でソート
      q = query(q, orderBy('ratings.overall', 'desc'));
      
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }
      
      const querySnapshot = await getDocs(q);
      let stylists = querySnapshot.docs.map(doc => 
        convertTimestamp(doc.data()) as StylistProfile
      );
      
      // 距離フィルター（クライアントサイドで処理）
      if (filters.maxDistance && filters.userLocation) {
        stylists = stylists.filter(stylist => {
          const distance = this.calculateDistance(
            filters.userLocation!,
            stylist.location.coordinates
          );
          return distance <= filters.maxDistance!;
        });
      }
      
      return stylists;
    } catch (error) {
      console.error('Error getting stylists:', error);
      return [];
    }
  }
  
  static async createStylistProfile(stylistId: string, profileData: Partial<StylistProfile>): Promise<void> {
    try {
      const newProfile: StylistProfile = {
        id: stylistId,
        uid: stylistId,
        displayName: '',
        firstName: '',
        lastName: '',
        email: '',
        salonName: '',
        salonAddress: '',
        position: '',
        experience: 0,
        license: [],
        location: {
          prefecture: '',
          city: '',
          address: '',
          coordinates: { latitude: 0, longitude: 0 }
        },
        specialties: {
          faceShapes: [],
          personalColors: [],
          techniques: [],
          ageGroups: []
        },
        portfolio: [],
        pricing: {},
        businessHours: {},
        bookingSettings: {
          advanceBookingDays: 30,
          minBookingHours: 24,
          slotDuration: 60
        },
        ratings: {
          overall: 0,
          technique: 0,
          communication: 0,
          satisfaction: 0,
          reviewCount: 0
        },
        isActive: true,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...profileData
      };
      
      await setDoc(doc(this.collection, stylistId), newProfile);
    } catch (error) {
      console.error('Error creating stylist profile:', error);
      throw error;
    }
  }
  
  // 距離計算（Haversine formula）
  private static calculateDistance(
    point1: { lat: number; lng: number },
    point2: { latitude: number; longitude: number }
  ): number {
    const R = 6371; // 地球の半径（km）
    const dLat = this.toRad(point2.latitude - point1.lat);
    const dLon = this.toRad(point2.longitude - point1.lng);
    const lat1 = this.toRad(point1.lat);
    const lat2 = this.toRad(point2.latitude);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  }
  
  private static toRad(value: number): number {
    return value * Math.PI / 180;
  }
}

// Reviews Service
export class ReviewService {
  static async addReview(stylistId: string, reviewData: Partial<Review>): Promise<string> {
    try {
      const reviewRef = doc(collection(db, 'stylists', stylistId, 'reviews'));
      const review: Review = {
        id: reviewRef.id,
        createdAt: new Date(),
        isAnonymous: false,
        isVerifiedBooking: false,
        ...reviewData
      } as Review;
      
      await setDoc(reviewRef, review);
      
      // 美容師の評価を更新
      await this.updateStylistRatings(stylistId);
      
      return reviewRef.id;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }
  
  static async getStylistReviews(stylistId: string, limitCount: number = 10): Promise<Review[]> {
    try {
      const q = query(
        collection(db, 'stylists', stylistId, 'reviews'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => 
        convertTimestamp(doc.data()) as Review
      );
    } catch (error) {
      console.error('Error getting reviews:', error);
      return [];
    }
  }
  
  private static async updateStylistRatings(stylistId: string): Promise<void> {
    try {
      const reviews = await this.getStylistReviews(stylistId, 100); // 最新100件で計算
      
      if (reviews.length === 0) return;
      
      const totals = reviews.reduce((acc, review) => ({
        overall: acc.overall + review.ratings.overall,
        technique: acc.technique + review.ratings.technique,
        communication: acc.communication + review.ratings.communication,
        satisfaction: acc.satisfaction + review.ratings.satisfaction,
      }), { overall: 0, technique: 0, communication: 0, satisfaction: 0 });
      
      const averages = {
        overall: Number((totals.overall / reviews.length).toFixed(1)),
        technique: Number((totals.technique / reviews.length).toFixed(1)),
        communication: Number((totals.communication / reviews.length).toFixed(1)),
        satisfaction: Number((totals.satisfaction / reviews.length).toFixed(1)),
        reviewCount: reviews.length
      };
      
      await updateDoc(doc(db, 'stylists', stylistId), {
        ratings: averages,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating stylist ratings:', error);
    }
  }
}

// Booking Service
export class BookingService {
  private static collection = collection(db, 'bookings');
  
  static async createBooking(bookingData: Partial<Booking>): Promise<string> {
    try {
      const bookingRef = doc(this.collection);
      const booking: Booking = {
        id: bookingRef.id,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...bookingData
      } as Booking;
      
      await setDoc(bookingRef, booking);
      return bookingRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }
  
  static async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      const q = query(
        this.collection,
        where('userId', '==', userId),
        orderBy('serviceDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => 
        convertTimestamp(doc.data()) as Booking
      );
    } catch (error) {
      console.error('Error getting user bookings:', error);
      return [];
    }
  }
  
  static async getStylistBookings(stylistId: string): Promise<Booking[]> {
    try {
      const q = query(
        this.collection,
        where('stylistId', '==', stylistId),
        orderBy('serviceDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => 
        convertTimestamp(doc.data()) as Booking
      );
    } catch (error) {
      console.error('Error getting stylist bookings:', error);
      return [];
    }
  }
  
  static async updateBookingStatus(
    bookingId: string, 
    status: Booking['status'],
    updates?: Partial<Booking>
  ): Promise<void> {
    try {
      const updateData: Partial<Booking> = {
        status,
        updatedAt: new Date(),
        ...updates
      };
      
      if (status === 'confirmed') {
        updateData.confirmedAt = new Date();
      } else if (status === 'completed') {
        updateData.completedAt = new Date();
      } else if (status === 'cancelled') {
        updateData.cancelledAt = new Date();
      }
      
      await updateDoc(doc(this.collection, bookingId), updateData);
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }
}

export { convertTimestamp };