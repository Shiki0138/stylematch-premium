import { OptimizedBookingService } from '../booking.service.optimized';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  writeBatch,
  Timestamp
} from 'firebase/firestore';

// Mock Firebase
jest.mock('@/lib/firebase/firestore', () => ({
  db: 'mocked-db'
}));

const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;

describe('OptimizedBookingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStylistBookingsOptimized', () => {
    it('should fetch bookings with related user and service data', async () => {
      // Mock booking data
      const mockBookings = [
        {
          id: 'booking1',
          data: () => ({
            userId: 'user1',
            stylistId: 'stylist1',
            serviceId: 'service1',
            scheduledAt: Timestamp.fromDate(new Date('2024-01-15T10:00:00')),
            duration: 60,
            status: 'confirmed'
          })
        }
      ];

      // Mock user data
      const mockUser = {
        exists: () => true,
        id: 'user1',
        data: () => ({
          name: 'Test User',
          email: 'test@example.com',
          phoneNumber: '090-1234-5678'
        })
      };

      // Mock service data
      const mockService = {
        exists: () => true,
        id: 'service1',
        data: () => ({
          name: 'カット',
          price: 5000
        })
      };

      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: mockBookings,
        size: 1,
        forEach: (callback: any) => mockBookings.forEach(callback)
      } as any);

      mockGetDoc.mockImplementation((docRef: any) => {
        if (docRef.id === 'user1') return Promise.resolve(mockUser as any);
        if (docRef.id === 'service1') return Promise.resolve(mockService as any);
        return Promise.resolve({ exists: () => false } as any);
      });

      const result = await OptimizedBookingService.getStylistBookingsOptimized(
        'stylist1',
        new Date('2024-01-15T00:00:00'),
        new Date('2024-01-15T23:59:59')
      );

      expect(result.bookings).toHaveLength(1);
      expect(result.bookings[0]).toMatchObject({
        id: 'booking1',
        userId: 'user1',
        stylistId: 'stylist1',
        status: 'confirmed',
        service: {
          id: 'service1',
          name: 'カット',
          price: 5000
        },
        user: {
          name: 'Test User',
          email: 'test@example.com',
          phoneNumber: '090-1234-5678'
        }
      });
    });

    it('should handle empty results gracefully', async () => {
      mockGetDocs.mockResolvedValue({
        empty: true,
        docs: [],
        size: 0
      } as any);

      const result = await OptimizedBookingService.getStylistBookingsOptimized(
        'stylist1',
        new Date('2024-01-15T00:00:00'),
        new Date('2024-01-15T23:59:59')
      );

      expect(result.bookings).toEqual([]);
      expect(result.lastDoc).toBeNull();
    });
  });

  describe('getAvailableSlotsOptimized', () => {
    it('should calculate available slots excluding booked times', async () => {
      // Mock existing bookings
      const mockBookings = [
        {
          data: () => ({
            scheduledAt: Timestamp.fromDate(new Date('2024-01-15T10:00:00')),
            duration: 60 // 10:00-11:00 is booked
          })
        },
        {
          data: () => ({
            scheduledAt: Timestamp.fromDate(new Date('2024-01-15T14:00:00')),
            duration: 90 // 14:00-15:30 is booked
          })
        }
      ];

      mockGetDocs.mockResolvedValue({
        docs: mockBookings,
        forEach: (callback: any) => mockBookings.forEach(callback)
      } as any);

      const availableSlots = await OptimizedBookingService.getAvailableSlotsOptimized(
        'stylist1',
        new Date('2024-01-15'),
        60, // 60 minutes service
        { start: '09:00', end: '17:00' }
      );

      // Should not include 10:00, 10:30 (booked)
      expect(availableSlots).not.toContain('10:00');
      expect(availableSlots).not.toContain('10:30');

      // Should not include 14:00, 14:30, 15:00 (booked)
      expect(availableSlots).not.toContain('14:00');
      expect(availableSlots).not.toContain('14:30');
      expect(availableSlots).not.toContain('15:00');

      // Should include available times
      expect(availableSlots).toContain('09:00');
      expect(availableSlots).toContain('09:30');
      expect(availableSlots).toContain('11:00');
      expect(availableSlots).toContain('11:30');
      expect(availableSlots).toContain('12:00');
      expect(availableSlots).toContain('16:00');
    });

    it('should not return slots that would exceed working hours', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [],
        forEach: jest.fn()
      } as any);

      const availableSlots = await OptimizedBookingService.getAvailableSlotsOptimized(
        'stylist1',
        new Date('2024-01-15'),
        120, // 2 hours service
        { start: '09:00', end: '11:00' }
      );

      // 09:00 is available (ends at 11:00)
      expect(availableSlots).toContain('09:00');
      
      // 09:30 would end at 11:30, exceeding working hours
      expect(availableSlots).not.toContain('09:30');
      expect(availableSlots).not.toContain('10:00');
      expect(availableSlots).not.toContain('10:30');
    });
  });

  describe('createBulkBookings', () => {
    it('should create multiple bookings in a batch', async () => {
      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };
      (writeBatch as jest.Mock).mockReturnValue(mockBatch);

      const bookings = [
        {
          userId: 'user1',
          stylistId: 'stylist1',
          scheduledAt: new Date('2024-01-15T10:00:00'),
          duration: 60,
          status: 'pending' as const,
          service: {
            id: 'service1',
            name: 'カット',
            price: 5000
          }
        },
        {
          userId: 'user2',
          stylistId: 'stylist1',
          scheduledAt: new Date('2024-01-15T11:00:00'),
          duration: 60,
          status: 'pending' as const,
          service: {
            id: 'service1',
            name: 'カット',
            price: 5000
          }
        }
      ];

      const bookingIds = await OptimizedBookingService.createBulkBookings(bookings);

      expect(bookingIds).toHaveLength(2);
      expect(mockBatch.set).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateBookingStatuses', () => {
    it('should update multiple booking statuses in a batch', async () => {
      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };
      (writeBatch as jest.Mock).mockReturnValue(mockBatch);

      const updates = [
        { id: 'booking1', status: 'completed' as const },
        { id: 'booking2', status: 'cancelled' as const }
      ];

      await OptimizedBookingService.updateBookingStatuses(updates);

      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });
  });
});