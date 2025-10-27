/**
 * An interface for types that can be spherically linearly interpolated (slerped).
 * This is primarily used for quaternions to ensure smooth rotation animations.
 */
export interface Slerpable<T> {
    /**
     * Spherically interpolates between this value and a target value.
     * @param target The target value to interpolate towards.
     * @param alpha The interpolation factor, typically between 0 and 1.
     * @returns A new instance of T representing the interpolated value.
     */
    slerp(target: T, alpha: number): T;
} 