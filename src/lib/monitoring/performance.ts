import * as Sentry from '@sentry/nextjs';

// パフォーマンス監視ユーティリティ
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // API呼び出しのパフォーマンスを計測
  async measureApiCall<T>(
    endpoint: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    const transaction = Sentry.startTransaction({
      name: `API Call: ${endpoint}`,
      op: 'http.client',
    });

    try {
      const result = await operation();
      const duration = performance.now() - startTime;

      // メトリクスを記録
      this.recordMetric(`api.${endpoint}`, duration);

      // Sentryにパフォーマンスデータを送信
      transaction.setData('duration', duration);
      transaction.setData('endpoint', endpoint);
      transaction.setStatus('ok');

      // 遅いAPIコールを警告
      if (duration > 3000) {
        Sentry.captureMessage(`Slow API call: ${endpoint} took ${duration}ms`, 'warning');
      }

      return result;
    } catch (error) {
      transaction.setStatus('internal_error');
      throw error;
    } finally {
      transaction.finish();
    }
  }

  // React コンポーネントのレンダリング時間を計測
  measureComponentRender(componentName: string, renderFn: () => void): void {
    const startTime = performance.now();
    
    renderFn();
    
    const duration = performance.now() - startTime;
    this.recordMetric(`component.${componentName}`, duration);

    // 遅いレンダリングを検出
    if (duration > 16) { // 60fps = 16.67ms per frame
      console.warn(`Slow render detected: ${componentName} took ${duration}ms`);
      Sentry.captureMessage(
        `Slow component render: ${componentName} took ${duration}ms`,
        'warning'
      );
    }
  }

  // 画像最適化のパフォーマンスを計測
  async measureImageOptimization(
    imageName: string,
    optimizeFn: () => Promise<any>
  ): Promise<any> {
    const startTime = performance.now();
    
    try {
      const result = await optimizeFn();
      const duration = performance.now() - startTime;
      
      this.recordMetric(`image.optimization.${imageName}`, duration);
      
      // 画像最適化が遅い場合
      if (duration > 1000) {
        Sentry.captureMessage(
          `Slow image optimization: ${imageName} took ${duration}ms`,
          'warning'
        );
      }
      
      return result;
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          operation: 'image_optimization',
          image: imageName,
        },
      });
      throw error;
    }
  }

  // メトリクスを記録
  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // 最新100件のみ保持
    if (values.length > 100) {
      values.shift();
    }

    // 定期的にSentryに集約データを送信
    if (values.length % 10 === 0) {
      this.sendAggregatedMetrics(name, values);
    }
  }

  // 集約されたメトリクスをSentryに送信
  private sendAggregatedMetrics(name: string, values: number[]): void {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const p95 = this.calculatePercentile(values, 95);

    Sentry.captureMessage('Performance Metrics', {
      level: 'info',
      tags: {
        metric_name: name,
      },
      extra: {
        average: avg.toFixed(2),
        max: max.toFixed(2),
        min: min.toFixed(2),
        p95: p95.toFixed(2),
        sample_size: values.length,
      },
    });
  }

  // パーセンタイル計算
  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  // Web Vitalsの監視
  static reportWebVitals(metric: any): void {
    const { name, value, id } = metric;
    
    // Sentryに送信
    Sentry.captureMessage(`Web Vital: ${name}`, {
      level: 'info',
      tags: {
        web_vital: name,
      },
      extra: {
        value: value.toFixed(2),
        id,
      },
    });

    // 閾値を超えた場合は警告
    const thresholds: Record<string, number> = {
      FCP: 2000, // First Contentful Paint
      LCP: 2500, // Largest Contentful Paint
      CLS: 0.1,  // Cumulative Layout Shift
      FID: 100,  // First Input Delay
      TTFB: 600, // Time to First Byte
    };

    if (thresholds[name] && value > thresholds[name]) {
      Sentry.captureMessage(
        `Poor Web Vital: ${name} = ${value.toFixed(2)} (threshold: ${thresholds[name]})`,
        'warning'
      );
    }
  }
}

// シングルトンインスタンスをエクスポート
export const performanceMonitor = PerformanceMonitor.getInstance();