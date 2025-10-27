// Easing function types
export type EasingFunction = (t: number) => number;

// Common easing functions
export const Easing = {
    linear: (t: number) => t,
    easeInQuad: (t: number) => t * t,
    easeOutQuad: (t: number) => t * (2 - t),
    easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t: number) => t * t * t,
    easeOutCubic: (t: number) => (--t) * t * t + 1,
    easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    // For a smoother, more natural "spring" like convergence
    easeOutElastic: (t: number) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0
          ? 0
          : t === 1
          ? 1
          : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    // Exponential decay - approaches the target quickly at first, then slows down.
    // This is the time-based equivalent of curr += (target - curr) * speed.
    exponentialOut: (t: number) => {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }
} as const; 