/**
 * Performance Optimization Utilities
 * Tools for monitoring and optimizing application performance
 */

// Debounce function for search inputs and API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// Throttle function for scroll events and resize handlers
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Intersection Observer hook for lazy loading
export function createIntersectionObserver(options: IntersectionObserverInit = {}) {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        
        // Trigger lazy loading
        if (element.dataset['src']) {
          const img = element as HTMLImageElement;
          const srcValue = element.dataset['src'];
          if (srcValue) {
            img.src = srcValue;
            img.removeAttribute('data-src');
          }
        }
        
        // Trigger component loading
        if (element.dataset['lazyComponent']) {
          element.dispatchEvent(new CustomEvent('lazyLoad'));
        }
        
        // Stop observing once loaded
        entry.target.classList.add('loaded');
      }
    });
  }, defaultOptions);
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start timing a operation
  startTiming(label: string): void {
    performance.mark(`${label}-start`);
  }

  // End timing and log result
  endTiming(label: string): number {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label)[0] as PerformanceMeasure;
    const duration = measure.duration;
    
    this.metrics.set(label, duration);
    
    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  // Get all metrics
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // Monitor Core Web Vitals
  monitorWebVitals(): void {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.metrics.set('LCP', lastEntry.startTime);
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    }

    // First Input Delay
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.set('FID', entry.processingStart - entry.startTime);
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    }

    // Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.set('CLS', clsValue);
          }
        });
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }
  }

  // Cleanup observers
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Memory usage monitoring
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
    };
  }
  return null;
}

// Bundle analyzer utilities
export function analyzeBundleSize(): void {
  if (process.env['NODE_ENV'] === 'development') {
    console.group('Bundle Analysis');
    
    // Check for large dependencies
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    scripts.forEach((script: any) => {
      if (script.src) {
        console.log(`Script: ${script.src}`);
      }
    });
    
    // Memory usage
    const memory = getMemoryUsage();
    if (memory) {
      console.log(`Memory Usage: ${memory.percentage}% (${(memory.used / 1024 / 1024).toFixed(2)} MB)`);
    }
    
    console.groupEnd();
  }
}

// Image optimization utilities
export function optimizeImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const { width, height } = img;
      const aspectRatio = width / height;
      
      let newWidth = width;
      let newHeight = height;
      
      if (width > maxWidth) {
        newWidth = maxWidth;
        newHeight = maxWidth / aspectRatio;
      }
      
      // Set canvas dimensions
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// Virtual scrolling helper
export class VirtualScrolling {
  private container: HTMLElement;
  private itemHeight: number;
  private visibleItems: number;
  private buffer: number;
  private totalItems: number;
  private scrollTop: number = 0;

  constructor(
    container: HTMLElement,
    itemHeight: number,
    visibleItems: number,
    totalItems: number,
    buffer: number = 5
  ) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.visibleItems = visibleItems;
    this.totalItems = totalItems;
    this.buffer = buffer;
  }

  getVisibleRange(): { start: number; end: number } {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + this.visibleItems + this.buffer,
      this.totalItems - 1
    );

    return {
      start: Math.max(0, startIndex - this.buffer),
      end: endIndex
    };
  }

  updateScrollTop(scrollTop: number): void {
    this.scrollTop = scrollTop;
  }

  getTotalHeight(): number {
    return this.totalItems * this.itemHeight;
  }

  getOffsetY(index: number): number {
    return index * this.itemHeight;
  }
}

// Cache management
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private static instance: CacheManager;

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Initialize performance monitoring
export function initializePerformanceMonitoring(): void {
  const monitor = PerformanceMonitor.getInstance();
  monitor.monitorWebVitals();
  
  // Monitor route changes
  let currentPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== currentPath) {
      monitor.startTiming('route-change');
      currentPath = window.location.pathname;
      
      // End timing after a short delay to capture rendering
      setTimeout(() => {
        monitor.endTiming('route-change');
      }, 100);
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Bundle analysis in development
  if (process.env['NODE_ENV'] === 'development') {
    setTimeout(analyzeBundleSize, 2000);
  }
}

export default {
  debounce,
  throttle,
  createIntersectionObserver,
  PerformanceMonitor,
  getMemoryUsage,
  analyzeBundleSize,
  optimizeImage,
  VirtualScrolling,
  CacheManager,
  initializePerformanceMonitoring
};