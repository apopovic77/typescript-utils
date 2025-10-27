import * as THREE from 'three';
export class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    // Basic operations
    add(v) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    subtract(v) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    multiply(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }
    divide(scalar) {
        if (scalar === 0)
            throw new Error("Division by zero");
        return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar);
    }
    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }
    // Vector operations
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    cross(v) {
        return new Vector3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
    }
    negate() {
        return new Vector3(-this.x, -this.y, -this.z);
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    normalize() {
        const len = this.length();
        if (len === 0)
            return new Vector3(0, 0, 0);
        return this.divide(len);
    }
    distance(v) {
        return this.subtract(v).length();
    }
    // Add distanceTo as alias for distance for compatibility
    distanceTo(v) {
        return this.distance(v);
    }
    distanceSquared(v) {
        return this.subtract(v).lengthSquared();
    }
    // Add min method for setting to minimum values
    min(v) {
        this.x = Math.min(this.x, v.x);
        this.y = Math.min(this.y, v.y);
        this.z = Math.min(this.z, v.z);
        return this;
    }
    // Add max method for setting to maximum values
    max(v) {
        this.x = Math.max(this.x, v.x);
        this.y = Math.max(this.y, v.y);
        this.z = Math.max(this.z, v.z);
        return this;
    }
    // Add crossVectors method for calculating cross product of two vectors
    crossVectors(a, b) {
        const ax = a.x, ay = a.y, az = a.z;
        const bx = b.x, by = b.y, bz = b.z;
        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;
        return this;
    }
    // Add projectOnPlane method for projecting vector onto a plane
    projectOnPlane(planeNormal) {
        const dot = this.dot(planeNormal);
        this.x -= planeNormal.x * dot;
        this.y -= planeNormal.y * dot;
        this.z -= planeNormal.z * dot;
        return this;
    }
    lerp(v, t) {
        return new Vector3(this.x + (v.x - this.x) * t, this.y + (v.y - this.y) * t, this.z + (v.z - this.z) * t);
    }
    applyQuaternion(q) {
        return q.rotateVector(this);
    }
    // Utility methods
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    equals(v, tolerance = 0.000001) {
        return Math.abs(this.x - v.x) < tolerance &&
            Math.abs(this.y - v.y) < tolerance &&
            Math.abs(this.z - v.z) < tolerance;
    }
    toArray() {
        return [this.x, this.y, this.z];
    }
    toString() {
        return `Vector3(${this.x}, ${this.y}, ${this.z})`;
    }
    // Static factory methods
    static zero() {
        return new Vector3(0, 0, 0);
    }
    static one() {
        return new Vector3(1, 1, 1);
    }
    static up() {
        return new Vector3(0, 1, 0);
    }
    static right() {
        return new Vector3(1, 0, 0);
    }
    static forward() {
        return new Vector3(0, 0, 1);
    }
    static fromArray(arr) {
        return new Vector3(arr[0], arr[1], arr[2]);
    }
    // --- THREE.JS CONVERSION METHODS (only place where Three.js is used) ---
    fromThree(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }
    toThree() {
        return new THREE.Vector3(this.x, this.y, this.z);
    }
}
