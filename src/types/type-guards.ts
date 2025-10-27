import { Lerpable } from "./Lerpable";
import { Equatable } from "./Lerpable";
import { Slerpable } from "./Slerpable";

export function isLerpable(obj: any): obj is Lerpable<any> {
    return obj && typeof obj.lerp === 'function';
}

export function isSlerpable(obj: any): obj is Slerpable<any> {
    return obj && typeof obj.slerp === 'function';
}

export function isEquatable(obj: any): obj is Equatable<any> {
    return obj && typeof obj.equals === 'function';
} 