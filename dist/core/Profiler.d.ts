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
    slowestResources: Array<{
        name: string;
        durationMs: number;
    }>;
}
export declare class Profiler {
    private config;
    private callbacks;
    private running;
    private rafId;
    private memoryTimer;
    private flushTimer;
    private resourceObserver;
    private buffer;
    private sequence;
    private startTime;
    private lastFrameTime;
    private frameDurations;
    private windowFrameDurations;
    private lastSampleTime;
    private jankCount;
    private peakMemoryBytes;
    private resourceCount;
    private slowestResources;
    constructor(callbacks: ProfilerCallbacks, config?: Partial<ProfilerConfig>);
    /** Start profiling. Begins collecting frame times, resources, and memory. */
    start(): void;
    /** Stop profiling. Flushes remaining data and returns a summary. */
    stop(): ProfilerSummary;
    /** Insert a custom named marker into the profiling timeline. */
    mark(name: string, detail?: string): void;
    /** Whether the profiler is currently running. */
    get isRunning(): boolean;
    private onFrame;
    private emitFrameSample;
    private sampleMemory;
    private setupResourceObserver;
    private shortenUrl;
    private emit;
    private flush;
    private computeSummary;
    private buildEmptySummary;
}
