import { Vector3 } from './Vector3';
import { Slerpable } from './Slerpable';
export declare class Quaternion implements Slerpable<Quaternion> {
    readonly isQuaternion: boolean;
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    set(x: number, y: number, z: number, w: number): this;
    clone(): Quaternion;
    copy(q: Quaternion): this;
    conjugate(): Quaternion;
    inverse(): Quaternion;
    length(): number;
    normalize(): this;
    multiply(q: Quaternion): Quaternion;
    rotateVector(v: Vector3): Vector3;
    toEulerAngles(): Vector3;
    toEulerAnglesDegrees(): Vector3;
    equals(q: Quaternion, tolerance?: number): boolean;
    toArray(): [number, number, number, number];
    toString(): string;
    setFromAxisAngle(axis: Vector3, angle: number): this;
    setFromEulerAngles(x: number, y: number, z: number): this;
    static identity(): Quaternion;
    static fromAxisAngle(axis: Vector3, angle: number): Quaternion;
    static lookAt(eye: Vector3, target: Vector3, up: Vector3): Quaternion;
    static fromArray(arr: [number, number, number, number]): Quaternion;
    /**
     * Creates a new quaternion that represents a rotation looking in a specific direction.
     * @param direction The direction vector to look in.
     * @param up The desired 'up' vector.
     * @returns A new quaternion with the calculated rotation.
     */
    static lookDir(direction: Vector3, up: Vector3): Quaternion;
    static slerp(q1: Quaternion, q2: Quaternion, t: number): Quaternion;
    static fromEulerAnglesDegrees(eulerDegrees: Vector3): Quaternion;
    slerp(target: Quaternion, alpha: number): Quaternion;
    fromThree(q: any): this;
    toThree(): any;
    setFromEuler(euler: any): this;
}
