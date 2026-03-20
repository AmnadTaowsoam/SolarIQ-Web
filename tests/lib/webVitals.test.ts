/**
 * Tests for Web Vitals performance tracking
 * WK-014: Monitoring, Logging & Observability
 */

import {
  initWebVitals,
  getPagePerformanceMetrics,
  trackPerformanceMark,
  measurePerformance,
  trackApiCall,
  trackInteraction,
} from '@/lib/webVitals';

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  addBreadcrumb: jest.fn(),
  captureMessage: jest.fn(),
}));

// Mock web-vitals
jest.mock('web-vitals', () => ({
  onCLS: jest.fn((cb) => cb({ name: 'CLS', value: 0.1, id: 'test-id', delta: 0.05, navigationType: 'navigate' })),
  onFID: jest.fn((cb) => cb({ name: 'FID', value: 50, id: 'test-id', delta: 10, navigationType: 'navigate' })),
  onLCP: jest.fn((cb) => cb({ name: 'LCP', value: 2000, id: 'test-id', delta: 500, navigationType: 'navigate' })),
  onFCP: jest.fn((cb) => cb({ name: 'FCP', value: 1500, id: 'test-id', delta: 300, navigationType: 'navigate' })),
  onTTFB: jest.fn((cb) => cb({ name: 'TTFB', value: 600, id: 'test-id', delta: 100, navigationType: 'navigate' })),
}));

import * as Sentry from '@sentry/nextjs';

describe('Web Vitals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.performance
    Object.defineProperty(window, 'performance', {
      value: {
        getEntriesByType: jest.fn().mockReturnValue([{
          domainLookupEnd: 100,
          domainLookupStart: 50,
          connectEnd: 200,
          connectStart: 100,
          responseStart: 300,
          requestStart: 200,
          responseEnd: 400,
          domComplete: 600,
          domInteractive: 500,
          loadEventEnd: 700,
          fetchStart: 0,
        }]),
        mark: jest.fn(),
        measure: jest.fn(),
      },
      writable: true,
    });

    // Mock navigator.sendBeacon
    Object.defineProperty(navigator, 'sendBeacon', {
      value: jest.fn(),
      writable: true,
    });

    // Mock fetch
    global.fetch = jest.fn();
  });

  describe('initWebVitals', () => {
    it('should initialize all web vitals listeners', () => {
      initWebVitals();

      // Verify all web vitals callbacks are registered
      const { onCLS, onFID, onLCP, onFCP, onTTFB } = jest.requireMock('web-vitals');
      expect(onCLS).toHaveBeenCalled();
      expect(onFID).toHaveBeenCalled();
      expect(onLCP).toHaveBeenCalled();
      expect(onFCP).toHaveBeenCalled();
      expect(onTTFB).toHaveBeenCalled();
    });

    it('should add breadcrumbs to Sentry for each metric', () => {
      initWebVitals();

      // Each metric should add a breadcrumb
      expect(Sentry.addBreadcrumb).toHaveBeenCalledTimes(5);
    });
  });

  describe('getPagePerformanceMetrics', () => {
    it('should return performance metrics when available', () => {
      const metrics = getPagePerformanceMetrics();

      expect(metrics).toEqual({
        dns: 50,  // 100 - 50
        tcp: 100, // 200 - 100
        request: 100, // 300 - 200
        response: 100, // 400 - 300
        domProcessing: 100, // 600 - 500
        totalLoad: 700, // 700 - 0
      });
    });

    it('should return null when performance API is not available', () => {
      Object.defineProperty(window, 'performance', {
        value: undefined,
        writable: true,
      });

      const metrics = getPagePerformanceMetrics();
      expect(metrics).toBeNull();
    });

    it('should return null when navigation timing is not available', () => {
      (window.performance.getEntriesByType as jest.Mock).mockReturnValue([]);

      const metrics = getPagePerformanceMetrics();
      expect(metrics).toBeNull();
    });
  });

  describe('trackPerformanceMark', () => {
    it('should create a performance mark', () => {
      trackPerformanceMark('test-mark');

      expect(window.performance.mark).toHaveBeenCalledWith('custom:test-mark');
    });

    it('should add breadcrumb to Sentry when data is provided', () => {
      trackPerformanceMark('test-mark', { foo: 'bar' });

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'performance-mark',
        message: 'custom:test-mark',
        level: 'info',
        data: { foo: 'bar' },
      });
    });

    it('should not add breadcrumb when no data provided', () => {
      trackPerformanceMark('test-mark');

      expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
    });

    it('should handle missing performance API gracefully', () => {
      Object.defineProperty(window, 'performance', {
        value: undefined,
        writable: true,
      });

      // Should not throw
      expect(() => trackPerformanceMark('test-mark')).not.toThrow();
    });
  });

  describe('measurePerformance', () => {
    it('should create a performance measure', () => {
      const mockMeasure = jest.fn().mockReturnValue({});
      window.performance.measure = mockMeasure;

      const result = measurePerformance('test-measure', 'start-mark', 'end-mark');

      expect(mockMeasure).toHaveBeenCalledWith('test-measure', 'start-mark', 'end-mark');
      expect(result).toEqual({});
    });

    it('should create end mark if not provided', () => {
      const mockMark = jest.fn();
      const mockMeasure = jest.fn().mockReturnValue({});
      window.performance.mark = mockMark;
      window.performance.measure = mockMeasure;

      measurePerformance('test-measure', 'start-mark');

      expect(mockMark).toHaveBeenCalledWith('test-measure:end');
      expect(mockMeasure).toHaveBeenCalledWith('test-measure', 'start-mark', 'test-measure:end');
    });

    it('should return null on error', () => {
      window.performance.measure = jest.fn().mockImplementation(() => {
        throw new Error('Measure failed');
      });

      const result = measurePerformance('test-measure', 'start-mark');

      expect(result).toBeNull();
    });
  });

  describe('trackApiCall', () => {
    it('should add breadcrumb for API call', () => {
      trackApiCall('/api/test', 150, 200, true);

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'api-call',
        message: '/api/test - 200 (150ms)',
        level: 'info',
        data: {
          endpoint: '/api/test',
          duration: 150,
          status: 200,
          success: true,
        },
      });
    });

    it('should use warning level for failed calls', () => {
      trackApiCall('/api/test', 150, 500, false);

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'api-call',
        message: '/api/test - 500 (150ms)',
        level: 'warning',
        data: {
          endpoint: '/api/test',
          duration: 150,
          status: 500,
          success: false,
        },
      });
    });

    it('should capture message for slow API calls (>3s)', () => {
      trackApiCall('/api/slow', 3500, 200, true);

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Slow API call: /api/slow', {
        level: 'warning',
        tags: {
          endpoint: '/api/slow',
          status: '200',
        },
        extra: {
          duration: 3500,
        },
      });
    });
  });

  describe('trackInteraction', () => {
    it('should add breadcrumb for user interaction', () => {
      trackInteraction('button_click', 50, { button: 'submit' });

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'user-interaction',
        message: 'button_click (50ms)',
        level: 'info',
        data: {
          action: 'button_click',
          duration: 50,
          button: 'submit',
        },
      });
    });

    it('should work without metadata', () => {
      trackInteraction('page_view', 0);

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'user-interaction',
        message: 'page_view (0ms)',
        level: 'info',
        data: {
          action: 'page_view',
          duration: 0,
        },
      });
    });
  });
});

describe('Web Vitals Rating', () => {
  // Test the rating logic indirectly through the sendToAnalytics function

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'test-dsn';
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
  });

  it('should classify LCP correctly', () => {
    // LCP <= 2500ms is good
    // LCP <= 4000ms needs improvement
    // LCP > 4000ms is poor
    const { onLCP } = jest.requireMock('web-vitals');

    // Good LCP
    onLCP.mockImplementation((cb) => cb({
      name: 'LCP',
      value: 2000,
      id: 'test-id',
      delta: 100,
      navigationType: 'navigate',
    }));

    initWebVitals();

    const breadcrumb = (Sentry.addBreadcrumb as jest.Mock).mock.calls[0][0];
    expect(breadcrumb.message).toContain('good');
  });

  it('should classify FID correctly', () => {
    const { onFID } = jest.requireMock('web-vitals');

    // Good FID <= 100ms
    onFID.mockImplementation((cb) => cb({
      name: 'FID',
      value: 50,
      id: 'test-id',
      delta: 10,
      navigationType: 'navigate',
    }));

    initWebVitals();

    const breadcrumb = (Sentry.addBreadcrumb as jest.Mock).mock.calls.find(
      (call) => call[0].message?.includes('FID')
    )?.[0];

    expect(breadcrumb?.message).toContain('good');
  });

  it('should capture poor metrics as Sentry messages', () => {
    const { onLCP } = jest.requireMock('web-vitals');

    // Poor LCP > 4000ms
    onLCP.mockImplementation((cb) => cb({
      name: 'LCP',
      value: 5000,
      id: 'test-id',
      delta: 100,
      navigationType: 'navigate',
    }));

    initWebVitals();

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'Poor Web Vital: LCP',
      expect.objectContaining({
        level: 'warning',
      })
    );
  });
});
