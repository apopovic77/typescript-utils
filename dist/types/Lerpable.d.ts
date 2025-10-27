export interface Lerpable<T> {
    lerp(target: T, t: number): T;
}
export interface Equatable<T> {
    equals(other: T, tolerance?: number): boolean;
}
