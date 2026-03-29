/**
 * Performance Profiler for browser-based apps.
 *
 * Collects frame timing (rAF), long tasks, resource loading, memory snapshots,
 * and custom marks. Designed to work on all browsers (iPhone Safari + Chrome).
 * Data is flushed periodically via a callback for remote logging.
 *
 * Usage:
 *   const profiler = new Profiler({
 *     onFlush: async (entries) => { await sendToLogAPI(entries); },
 *   });
 *   profiler.start();
 *   // ... user interacts ...
 *   const summary = profiler.stop();
 */

// ── Types ────────────────────────────────────────────────────────────

export interface ProfilerConfig {
  /** Frame sampling interval in ms (default: 100 = 10 samples/sec) */
  sampleIntervalMs: number;
  /** Memory polling interval in ms (default: 2000) */
  memorySampleIntervalMs: number;
  /** Observe resource loading via PerformanceObserver (default: true) */
  observeResources: boolean;
  /** Frame duration above this is counted as jank, in ms (default: 33.33 = below 30fps) */
  jankThresholdMs: number;
  /** How often to flush buffered entries to remote, in ms (default: 3000) */
  flushIntervalMs: number;
  /** Max entries before force-flush (default: 200) */
  maxBufferSize: number;
}

export interface ProfilerCallbacks {
  /** Called periodically with buffered entries to send to remote (e.g. Log API) */
  onFlush: (entries: ProfilerEntry[]) => Promise<void>;
}

export interface ProfilerEntry {
  timestamp: string;
  log_type: string;
  source: string;
  message: string;
  sequence: number;
}

export interface ProfilerSummary {
  totalFrames: number;
  avgFps: number;
  minFps: number;
  maxFps: number;
  avgFrameMs: number;
  p95FrameMs: number;
  p99FrameMs: number;
  jankCount: number;
  peakMemoryMB: number | null;
  profilingDurationMs: number;
  resourceCount: number;
  slowestResources: Array<{ name: string; durationMs: number }>;
}

// ── Constants ────────────────────────────────────────────────────────

const DEFAULT_CONFIG: ProfilerConfig = {
  sampleIntervalMs: 100,
  memorySampleIntervalMs: 2000,
  observeResources: true,
  jankThresholdMs: 33.33,
  flushIntervalMs: 3000,
  maxBufferSize: 200,
};

// ── Profiler ─────────────────────────────────────────────────────────

export class Profiler {
  private config: ProfilerConfig;
  private callbacks: ProfilerCallbacks;

  private running = false;
  private rafId: number | null = null;
  private memoryTimer: ReturnType<typeof setInterval> | null = null;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private resourceObserver: PerformanceObserver | null = null;

  private buffer: ProfilerEntry[] = [];
  private sequence = 0;
  private startTime = 0;

  // Frame tracking
  private lastFrameTime = 0;
  private frameDurations: number[] = [];
  private windowFrameDurations: number[] = [];
  private lastSampleTime = 0;
  private jankCount = 0;

  // Memory tracking
  private peakMemoryBytes = 0;

  // Resource tracking
  private resourceCount = 0;
  private slowestResources: Array<{ name: string; durationMs: number }> = [];

  constructor(callbacks: ProfilerCallbacks, config: Partial<ProfilerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.callbacks = callbacks;
  }

  /** Start profiling. Begins collecting frame times, resources, and memory. */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.startTime = performance.now();
    this.lastFrameTime = 0;
    this.lastSampleTime = 0;
    this.sequence = 0;
    this.frameDurations = [];
    this.windowFrameDurations = [];
    this.jankCount = 0;
    this.peakMemoryBytes = 0;
    this.resourceCount = 0;
    this.slowestResources = [];
    this.buffer = [];

    // Start rAF loop
    this.rafId = requestAnimationFrame((ts) => this.onFrame(ts));

    // Start memory polling (Chrome only)
    if ((performance as any).memory) {
      this.sampleMemory();
      this.memoryTimer = setInterval(
        () => this.sampleMemory(),
        this.config.memorySampleIntervalMs,
      );
    }

    // Start resource observer
    if (this.config.observeResources) {
      this.setupResourceObserver();
    }

    // Start flush timer
    this.flushTimer = setInterval(
      () => this.flush(),
      this.config.flushIntervalMs,
    );
  }

  /** Stop profiling. Flushes remaining data and returns a summary. */
  stop(): ProfilerSummary {
    if (!this.running) {
      return this.buildEmptySummary();
    }
    this.running = false;

    // Stop rAF
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Stop memory polling
    if (this.memoryTimer !== null) {
      clearInterval(this.memoryTimer);
      this.memoryTimer = null;
    }

    // Stop resource observer
    if (this.resourceObserver) {
      this.resourceObserver.disconnect();
      this.resourceObserver = null;
    }

    // Stop flush timer
    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Compute summary
    const summary = this.computeSummary();

    // Emit summary as entry
    this.emit('PerfSummary', summary);

    // Final flush (fire and forget)
    this.flush();

    return summary;
  }

  /** Insert a custom named marker into the profiling timeline. */
  mark(name: string, detail?: string): void {
    if (!this.running) return;
    try {
      performance.mark(name);
    } catch {
      // PerformanceObserver mark may not be supported
    }
    this.emit('PerfMark', {
      name,
      detail: detail || null,
      elapsedMs: Math.round(performance.now() - this.startTime),
    });
  }

  /** Whether the profiler is currently running. */
  get isRunning(): boolean {
    return this.running;
  }

  // ── Frame Loop ───────────────────────────────────────────────────

  private onFrame(timestamp: DOMHighResTimeStamp): void {
    if (!this.running) return;

    if (this.lastFrameTime > 0) {
      const frameDuration = timestamp - this.lastFrameTime;
      this.frameDurations.push(frameDuration);
      this.windowFrameDurations.push(frameDuration);

      if (frameDuration > this.config.jankThresholdMs) {
        this.jankCount++;
      }

      // Emit a sample at the configured interval
      if (timestamp - this.lastSampleTime >= this.config.sampleIntervalMs) {
        this.emitFrameSample(timestamp);
        this.lastSampleTime = timestamp;
      }
    } else {
      this.lastSampleTime = timestamp;
    }

    this.lastFrameTime = timestamp;
    this.rafId = requestAnimationFrame((ts) => this.onFrame(ts));
  }

  private emitFrameSample(timestamp: DOMHighResTimeStamp): void {
    if (this.windowFrameDurations.length === 0) return;

    const durations = this.windowFrameDurations;
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const fps = 1000 / avgDuration;

    this.emit('PerfFrame', {
      fps: Math.round(fps * 10) / 10,
      frameDuration: Math.round(avgDuration * 100) / 100,
      maxFrameDuration: Math.round(maxDuration * 100) / 100,
      jank: maxDuration > this.config.jankThresholdMs,
      sampleFrames: durations.length,
    });

    this.windowFrameDurations = [];
  }

  // ── Memory ───────────────────────────────────────────────────────

  private sampleMemory(): void {
    const mem = (performance as any).memory;
    if (!mem) return;

    const used = mem.usedJSHeapSize || 0;
    const total = mem.totalJSHeapSize || 0;
    const limit = mem.jsHeapSizeLimit || 0;

    if (used > this.peakMemoryBytes) {
      this.peakMemoryBytes = used;
    }

    this.emit('PerfMemory', {
      usedJSHeapSize: used,
      totalJSHeapSize: total,
      jsHeapSizeLimit: limit,
    });
  }

  // ── Resources ────────────────────────────────────────────────────

  private setupResourceObserver(): void {
    try {
      this.resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resEntry = entry as PerformanceResourceTiming;
          const duration = resEntry.duration;
          this.resourceCount++;

          // Track slowest resources (keep top 10)
          const name = this.shortenUrl(resEntry.name);
          this.slowestResources.push({ name, durationMs: Math.round(duration) });
          this.slowestResources.sort((a, b) => b.durationMs - a.durationMs);
          if (this.slowestResources.length > 10) {
            this.slowestResources.length = 10;
          }

          // Only emit entries for slow resources (>50ms)
          if (duration > 50) {
            this.emit('PerfResource', {
              name,
              type: resEntry.initiatorType,
              durationMs: Math.round(duration),
              transferSize: resEntry.transferSize || 0,
            });
          }
        }
      });
      this.resourceObserver.observe({ entryTypes: ['resource'] });
    } catch {
      // PerformanceObserver not supported
    }
  }

  private shortenUrl(url: string): string {
    try {
      const u = new URL(url);
      const path = u.pathname;
      return path.length > 60 ? '...' + path.slice(-57) : path;
    } catch {
      return url.slice(-60);
    }
  }

  // ── Buffer & Flush ───────────────────────────────────────────────

  private emit(logType: string, data: Record<string, any>): void {
    this.buffer.push({
      timestamp: new Date().toISOString(),
      log_type: logType,
      source: 'profiler',
      message: JSON.stringify(data),
      sequence: this.sequence++,
    });

    if (this.buffer.length >= this.config.maxBufferSize) {
      this.flush();
    }
  }

  private flush(): void {
    if (this.buffer.length === 0) return;
    const entries = [...this.buffer];
    this.buffer = [];
    // Fire and forget — profiling must never break the app
    this.callbacks.onFlush(entries).catch(() => {});
  }

  // ── Summary ──────────────────────────────────────────────────────

  private computeSummary(): ProfilerSummary {
    const durations = this.frameDurations;
    const n = durations.length;
    const profilingDurationMs = performance.now() - this.startTime;

    if (n === 0) {
      return {
        ...this.buildEmptySummary(),
        profilingDurationMs: Math.round(profilingDurationMs),
      };
    }

    const sorted = [...durations].sort((a, b) => a - b);
    const avgMs = sorted.reduce((a, b) => a + b, 0) / n;
    const fpsValues = durations.map((d) => 1000 / d);

    return {
      totalFrames: n,
      avgFps: Math.round((fpsValues.reduce((a, b) => a + b, 0) / n) * 10) / 10,
      minFps: Math.round(Math.min(...fpsValues) * 10) / 10,
      maxFps: Math.round(Math.max(...fpsValues) * 10) / 10,
      avgFrameMs: Math.round(avgMs * 100) / 100,
      p95FrameMs: Math.round(sorted[Math.floor(n * 0.95)] * 100) / 100,
      p99FrameMs: Math.round(sorted[Math.min(Math.floor(n * 0.99), n - 1)] * 100) / 100,
      jankCount: this.jankCount,
      peakMemoryMB: this.peakMemoryBytes > 0
        ? Math.round((this.peakMemoryBytes / (1024 * 1024)) * 10) / 10
        : null,
      profilingDurationMs: Math.round(profilingDurationMs),
      resourceCount: this.resourceCount,
      slowestResources: this.slowestResources.slice(0, 5),
    };
  }

  private buildEmptySummary(): ProfilerSummary {
    return {
      totalFrames: 0,
      avgFps: 0,
      minFps: 0,
      maxFps: 0,
      avgFrameMs: 0,
      p95FrameMs: 0,
      p99FrameMs: 0,
      jankCount: 0,
      peakMemoryMB: null,
      profilingDurationMs: 0,
      resourceCount: 0,
      slowestResources: [],
    };
  }
}
