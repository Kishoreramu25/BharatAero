// Performance Telemetry & Web Vitals Monitor

const thresholds = {
  routeTransition: 100, // 100ms target
  imageLoad: 200,       // 200ms target for visible
  mapRender: 500        // 500ms target for map setup
};

export const perfMonitor = {
  // Store measurements in memory
  records: [],

  logRecord(type, name, duration, metadata = {}) {
    const record = {
      type,
      name,
      duration: Math.round(duration),
      timestamp: Date.now(),
      status: duration > (thresholds[type] || 300) ? 'SLOW' : 'FAST',
      ...metadata
    };

    this.records.push(record);

    // Warn in console if an operation is slow
    const color = record.status === 'SLOW' ? '#ca0013' : '#22c55e';
    console.log(
      `%c[PerfMonitor] ${type.toUpperCase()} - ${name}: ${record.duration}ms (${record.status})`,
      `color: ${color}; font-weight: bold;`
    );

    // Caps records size
    if (this.records.length > 100) {
      this.records.shift();
    }
  },

  // Track route transition times
  startRouteTransition(fromScreen, toScreen) {
    const startTime = performance.now();
    return {
      end: () => {
        const duration = performance.now() - startTime;
        this.logRecord('routeTransition', `${fromScreen} ➔ ${toScreen}`, duration);
      }
    };
  },

  // Setup Web Vitals observers (LCP, FID, CLS)
  initWebVitals() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      // 1. Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.logRecord('webVitals', 'LCP', lastEntry.startTime, {
          element: lastEntry.element?.tagName || 'unknown'
        });
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // 2. First Input Delay (FID)
      const fidObserver = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry) => {
          const delay = entry.processingStart - entry.startTime;
          this.logRecord('webVitals', 'FID', delay, {
            name: entry.name
          });
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.warn('[PerfMonitor] Failed to initialize PerformanceObservers:', e);
    }
  }
};

// Initialize performance monitoring immediately
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    perfMonitor.initWebVitals();
  });
}
