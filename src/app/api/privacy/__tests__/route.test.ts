import './test-setup';
import { GET, POST, DELETE } from '../route';
import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Mock Firebase Admin
jest.mock('firebase-admin/auth');
jest.mock('firebase-admin/firestore');
jest.mock('firebase-admin/storage');
jest.mock('@/lib/firebase/admin', () => ({
  auth: 'mocked-auth',
  db: 'mocked-db',
  storage: 'mocked-storage'
}));

const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>;
const mockGetFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>;
const mockGetStorage = getStorage as jest.MockedFunction<typeof getStorage>;

describe('Privacy API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/privacy', () => {
    it('should export user data for authenticated user', async () => {
      // Mock authentication
      const mockVerifyIdToken = jest.fn().mockResolvedValue({ uid: 'user123' });
      mockGetAuth.mockReturnValue({ verifyIdToken: mockVerifyIdToken } as any);

      // Mock Firestore data
      const mockUserDoc = {
        exists: true,
        data: () => ({
          name: 'Test User',
          email: 'test@example.com',
          createdAt: new Date('2024-01-01')
        })
      };

      const mockDiagnosesSnapshot = {
        empty: false,
        docs: [
          {
            id: 'diag1',
            data: () => ({
              faceType: '卵型',
              createdAt: new Date('2024-01-10')
            })
          }
        ]
      };

      const mockBookingsSnapshot = {
        empty: false,
        docs: [
          {
            id: 'booking1',
            data: () => ({
              stylistId: 'stylist1',
              scheduledAt: new Date('2024-01-15'),
              status: 'completed'
            })
          }
        ]
      };

      const mockDoc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockUserDoc)
      });
      const mockCollection = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockImplementation((path) => {
            if (path.includes('diagnoses')) return Promise.resolve(mockDiagnosesSnapshot);
            if (path.includes('bookings')) return Promise.resolve(mockBookingsSnapshot);
            return Promise.resolve({ empty: true, docs: [] });
          })
        })
      });

      mockGetFirestore.mockReturnValue({
        collection: mockCollection,
        doc: mockDoc
      } as any);

      // Create request with auth header
      const request = new NextRequest('http://localhost:3000/api/privacy', {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('userData');
      expect(data).toHaveProperty('diagnoses');
      expect(data).toHaveProperty('bookings');
      expect(data).toHaveProperty('exportDate');
      expect(data.userData.name).toBe('Test User');
      expect(data.diagnoses).toHaveLength(1);
      expect(data.bookings).toHaveLength(1);
    });

    it('should return 401 for unauthenticated request', async () => {
      const request = new NextRequest('http://localhost:3000/api/privacy');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('POST /api/privacy', () => {
    it('should create a deletion request', async () => {
      // Mock authentication
      const mockVerifyIdToken = jest.fn().mockResolvedValue({ uid: 'user123' });
      mockGetAuth.mockReturnValue({ verifyIdToken: mockVerifyIdToken } as any);

      // Mock Firestore
      const mockAdd = jest.fn().mockResolvedValue({ id: 'deletion123' });
      const mockCollection = jest.fn().mockReturnValue({ add: mockAdd });
      mockGetFirestore.mockReturnValue({ collection: mockCollection } as any);

      const request = new NextRequest('http://localhost:3000/api/privacy', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'requestDeletion',
          reason: 'No longer using the service'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('削除リクエストを受け付けました。30日以内に処理されます。');
      expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123',
        requestedAt: expect.any(Object),
        status: 'pending',
        reason: 'No longer using the service'
      }));
    });

    it('should handle consent update', async () => {
      // Mock authentication
      const mockVerifyIdToken = jest.fn().mockResolvedValue({ uid: 'user123' });
      mockGetAuth.mockReturnValue({ verifyIdToken: mockVerifyIdToken } as any);

      // Mock Firestore
      const mockAdd = jest.fn().mockResolvedValue({ id: 'consent123' });
      const mockCollection = jest.fn().mockReturnValue({ add: mockAdd });
      mockGetFirestore.mockReturnValue({ collection: mockCollection } as any);

      const request = new NextRequest('http://localhost:3000/api/privacy', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'updateConsent',
          consent: {
            marketing: false,
            analytics: true
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('同意設定を更新しました');
    });
  });

  describe('DELETE /api/privacy', () => {
    it('should immediately delete user data', async () => {
      // Mock authentication
      const mockVerifyIdToken = jest.fn().mockResolvedValue({ uid: 'user123' });
      mockGetAuth.mockReturnValue({ verifyIdToken: mockVerifyIdToken } as any);

      // Mock Firestore batch operations
      const mockDelete = jest.fn();
      const mockCommit = jest.fn().mockResolvedValue(undefined);
      const mockBatch = jest.fn().mockReturnValue({
        delete: mockDelete,
        commit: mockCommit
      });

      const mockDocs = [
        { ref: { id: 'doc1' } },
        { ref: { id: 'doc2' } }
      ];

      const mockCollection = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            empty: false,
            docs: mockDocs
          })
        })
      });

      const mockDoc = jest.fn().mockReturnValue({ id: 'user123' });

      mockGetFirestore.mockReturnValue({
        batch: mockBatch,
        collection: mockCollection,
        doc: mockDoc
      } as any);

      // Mock Storage
      const mockListFiles = jest.fn().mockResolvedValue({
        items: [{ delete: jest.fn().mockResolvedValue(undefined) }]
      });
      mockGetStorage.mockReturnValue({
        bucket: jest.fn().mockReturnValue({
          file: jest.fn().mockReturnValue({
            exists: jest.fn().mockResolvedValue([true]),
            getFiles: mockListFiles
          })
        })
      } as any);

      const request = new NextRequest('http://localhost:3000/api/privacy', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('アカウントとすべてのデータを削除しました');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockCommit).toHaveBeenCalled();
    });
  });
});