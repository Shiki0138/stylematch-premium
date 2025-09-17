import { ImageOptimizer } from '../image-optimizer';

// Canvas APIのモック
const mockToBlob = jest.fn();
const mockDrawImage = jest.fn();
const mockGetContext = jest.fn(() => ({
  drawImage: mockDrawImage,
}));

HTMLCanvasElement.prototype.toBlob = mockToBlob;
HTMLCanvasElement.prototype.getContext = mockGetContext;

// FileReaderのモック
const mockReadAsDataURL = jest.fn();
const mockFileReader = {
  readAsDataURL: mockReadAsDataURL,
  result: 'data:image/jpeg;base64,mockImageData',
};

global.FileReader = jest.fn(() => mockFileReader) as any;

describe('ImageOptimizer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('optimizeImage', () => {
    it('should optimize image with default options', (done) => {
      const mockFile = new File(['mock'], 'test.jpg', { type: 'image/jpeg' });
      const mockBlob = new Blob(['optimized'], { type: 'image/jpeg' });

      // FileReaderのモック動作を設定
      mockReadAsDataURL.mockImplementation(() => {
        // Simulate async file read
        setTimeout(() => {
          if (mockFileReader.onload) {
            mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,test' } });
          }
        }, 0);
      });

      // Imageのモック
      const mockImage = {
        onload: null,
        src: '',
        width: 2000,
        height: 1500,
      };

      global.Image = jest.fn(() => mockImage) as any;

      // Canvas.toBlobのモック動作
      mockToBlob.mockImplementation((callback) => {
        callback(mockBlob);
      });

      // Start optimization
      ImageOptimizer.optimizeImage(mockFile).then((result) => {
        expect(result).toHaveProperty('blob');
        expect(result).toHaveProperty('dataUrl');
        expect(result).toHaveProperty('size');
        expect(mockDrawImage).toHaveBeenCalled();
        done();
      }).catch(done);

      // Trigger image onload after file reader completes
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 10);
    });

    it('should handle image load error', async () => {
      const mockFile = new File(['mock'], 'test.jpg', { type: 'image/jpeg' });

      mockReadAsDataURL.mockImplementation(() => {
        Promise.resolve().then(() => {
          mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,test' } });
        });
      });

      const mockImage = {
        onerror: null,
        src: '',
      };

      global.Image = jest.fn(() => mockImage) as any;

      // Start the promise
      const resultPromise = ImageOptimizer.optimizeImage(mockFile);

      // Trigger error after a tick
      await Promise.resolve();
      if (mockImage.onerror) mockImage.onerror();

      await expect(resultPromise).rejects.toThrow('Failed to load image');
    });
  });

  describe('calculateDimensions', () => {
    it('should calculate correct dimensions maintaining aspect ratio', () => {
      // @ts-ignore - accessing private method for testing
      const dimensions = ImageOptimizer.calculateDimensions(2000, 1500, 1024, 1024);
      
      expect(dimensions.width).toBe(1024);
      expect(dimensions.height).toBe(768);
    });

    it('should handle portrait images correctly', () => {
      // @ts-ignore - accessing private method for testing
      const dimensions = ImageOptimizer.calculateDimensions(1500, 2000, 1024, 1024);
      
      expect(dimensions.width).toBe(768);
      expect(dimensions.height).toBe(1024);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(ImageOptimizer.formatFileSize(0)).toBe('0 Bytes');
      expect(ImageOptimizer.formatFileSize(1024)).toBe('1 KB');
      expect(ImageOptimizer.formatFileSize(1048576)).toBe('1 MB');
      expect(ImageOptimizer.formatFileSize(1536000)).toBe('1.46 MB');
    });
  });

  describe('estimateCompression', () => {
    it('should calculate compression metrics correctly', () => {
      const result = ImageOptimizer.estimateCompression(1000000, 400000);
      
      expect(result.ratio).toBeCloseTo(0.4);
      expect(result.percentage).toBe(60);
      expect(result.saved).toBe(600000);
    });
  });

  describe('isWebPSupported', () => {
    it('should detect WebP support', () => {
      // Mock createElement to return our mock canvas
      const mockCanvas = {
        width: 1,
        height: 1,
        toDataURL: jest.fn(() => 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=')
      };
      
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn((tagName) => {
        if (tagName === 'canvas') {
          return mockCanvas as any;
        }
        return originalCreateElement.call(document, tagName);
      });

      const isSupported = ImageOptimizer.isWebPSupported();
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/webp');
      // The check is indexOf('image/webp') === 0, so the string should start with 'data:image/webp'
      expect(isSupported).toBe(true);

      // Restore original
      document.createElement = originalCreateElement;
    });
  });
});