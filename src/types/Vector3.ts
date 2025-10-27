import * as THREE from 'three';

export class Vector3 {
    public x: number;
    public y: number;
    public z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    // Basic operations
    add(v: Vector3): Vector3 {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    subtract(v: Vector3): Vector3 {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    multiply(scalar: number): Vector3 {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    divide(scalar: number): Vector3 {
        if (scalar === 0) throw new Error("Division by zero");
        return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar);
    }

    multiplyScalar(scalar: number): this {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }

    // Vector operations
    dot(v: Vector3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v: Vector3): Vector3 {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    negate(): Vector3 {
        return new Vector3(-this.x, -this.y, -this.z);
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    lengthSquared(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    normalize(): Vector3 {
        const len = this.length();
        if (len === 0) return new Vector3(0, 0, 0);
        return this.divide(len);
    }

    distance(v: Vector3): number {
        return this.subtract(v).length();
    }

    // Add distanceTo as alias for distance for compatibility
    distanceTo(v: Vector3): number {
        return this.distance(v);
    }

    distanceSquared(v: Vector3): number {
        return this.subtract(v).lengthSquared();
    }

    // Add min method for setting to minimum values
    min(v: Vector3): this {
        this.x = Math.min(this.x, v.x);
        this.y = Math.min(this.y, v.y);
        this.z = Math.min(this.z, v.z);
        return this;
    }

    // Add max method for setting to maximum values
    max(v: Vector3): this {
        this.x = Math.max(this.x, v.x);
        this.y = Math.max(this.y, v.y);
        this.z = Math.max(this.z, v.z);
        return this;
    }

    // Add crossVectors method for calculating cross product of two vectors
    crossVectors(a: Vector3, b: Vector3): this {
        const ax = a.x, ay = a.y, az = a.z;
        const bx = b.x, by = b.y, bz = b.z;

        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;

        return this;
    }

    // Add projectOnPlane method for projecting vector onto a plane
    projectOnPlane(planeNormal: Vector3): this {
        const dot = this.dot(planeNormal);
        this.x -= planeNormal.x * dot;
        this.y -= planeNormal.y * dot;
        this.z -= planeNormal.z * dot;
        return this;
    }

    lerp(v: Vector3, t: number): Vector3 {
        return new Vector3(
            this.x + (v.x - this.x) * t,
            this.y + (v.y - this.y) * t,
            this.z + (v.z - this.z) * t
        );
    }

    applyQuaternion(q: import('./Quaternion').Quaternion): Vector3 {
        return q.rotateVector(this);
    }

    // Utility methods
    clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    copy(v: Vector3): Vector3 {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    set(x: number, y: number, z: number): Vector3 {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    equals(v: Vector3, tolerance: number = 0.000001): boolean {
        return Math.abs(this.x - v.x) < tolerance &&
               Math.abs(this.y - v.y) < tolerance &&
               Math.abs(this.z - v.z) < tolerance;
    }

    toArray(): [number, number, number] {
        return [this.x, this.y, this.z];
    }

    toString(): string {
        return `Vector3(${this.x}, ${this.y}, ${this.z})`;
    }

    // Static factory methods
    static zero(): Vector3 {
        return new Vector3(0, 0, 0);
    }

    static one(): Vector3 {
        return new Vector3(1, 1, 1);
    }

    static up(): Vector3 {
        return new Vector3(0, 1, 0);
    }

    static right(): Vector3 {
        return new Vector3(1, 0, 0);
    }

    static forward(): Vector3 {
        return new Vector3(0, 0, 1);
    }

    static fromArray(arr: [number, number, number]): Vector3 {
        return new Vector3(arr[0], arr[1], arr[2]);
    }

    // --- THREE.JS CONVERSION METHODS (only place where Three.js is used) ---
    
    fromThree(v: THREE.Vector3): this {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    toThree(): THREE.Vector3 {
        return new THREE.Vector3(this.x, this.y, this.z);
    }
} 