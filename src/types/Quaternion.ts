import { Vector3 } from './Vector3';
import { Slerpable } from './Slerpable';

export class Quaternion implements Slerpable<Quaternion> {
    public readonly isQuaternion: boolean = true;
    public x: number;
    public y: number;
    public z: number;
    public w: number;

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    
    // --- Methods ---
    
    set(x: number, y: number, z: number, w: number): this {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }
    
    clone(): Quaternion {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }
    
    copy(q: Quaternion): this {
        this.x = q.x;
        this.y = q.y;
        this.z = q.z;
        this.w = q.w;
        return this;
    }

    conjugate(): Quaternion {
        return new Quaternion(-this.x, -this.y, -this.z, this.w);
    }
    
    inverse(): Quaternion {
        return this.conjugate().normalize();
    }
    
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    
    normalize(): this {
        let len = this.length();
        if (len === 0) {
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.w = 1;
        } else {
            len = 1 / len;
            this.x *= len;
            this.y *= len;
            this.z *= len;
            this.w *= len;
        }
        return this;
    }
    
    multiply(q: Quaternion): Quaternion {
        const ax = this.x, ay = this.y, az = this.z, aw = this.w;
        const bx = q.x, by = q.y, bz = q.z, bw = q.w;

        return new Quaternion(
            ax * bw + aw * bx + ay * bz - az * by,
            ay * bw + aw * by + az * bx - ax * bz,
            az * bw + aw * bz + ax * by - ay * bx,
            aw * bw - ax * bx - ay * by - az * bz
        );
    }
    
    rotateVector(v: Vector3): Vector3 {
        const qv = new Quaternion(v.x, v.y, v.z, 0);
        const qConj = this.conjugate();
        const rotatedQv = this.multiply(qv).multiply(qConj);
        return new Vector3(rotatedQv.x, rotatedQv.y, rotatedQv.z);
    }

    toEulerAngles(): Vector3 {
        // Convert quaternion to Euler angles (YXZ order) using pure math
        const x = this.x, y = this.y, z = this.z, w = this.w;
        
        // Roll (x-axis rotation)
        const sinr_cosp = 2 * (w * x + y * z);
        const cosr_cosp = 1 - 2 * (x * x + y * y);
        const roll = Math.atan2(sinr_cosp, cosr_cosp);

        // Pitch (y-axis rotation)
        const sinp = 2 * (w * y - z * x);
        let pitch;
        if (Math.abs(sinp) >= 1) {
            pitch = Math.sign(sinp) * Math.PI / 2; // Use 90 degrees if out of range
        } else {
            pitch = Math.asin(sinp);
        }

        // Yaw (z-axis rotation)
        const siny_cosp = 2 * (w * z + x * y);
        const cosy_cosp = 1 - 2 * (y * y + z * z);
        const yaw = Math.atan2(siny_cosp, cosy_cosp);

        return new Vector3(roll, pitch, yaw);
    }

    toEulerAnglesDegrees(): Vector3 {
        const eulerRad = this.toEulerAngles();
        const radToDeg = 180 / Math.PI;
        return new Vector3(
            eulerRad.x * radToDeg,
            eulerRad.y * radToDeg,
            eulerRad.z * radToDeg
        );
    }

    equals(q: Quaternion, tolerance: number = 0.000001): boolean {
        return Math.abs(this.x - q.x) < tolerance &&
               Math.abs(this.y - q.y) < tolerance &&
               Math.abs(this.z - q.z) < tolerance &&
               Math.abs(this.w - q.w) < tolerance;
    }
    
    toArray(): [number, number, number, number] {
        return [this.x, this.y, this.z, this.w];
    }
    
    toString(): string {
        return `Quaternion(${this.x}, ${this.y}, ${this.z}, ${this.w})`;
    }

    // Add setFromAxisAngle as instance method for compatibility
    setFromAxisAngle(axis: Vector3, angle: number): this {
        const halfAngle = angle / 2;
        const s = Math.sin(halfAngle);
        this.x = axis.x * s;
        this.y = axis.y * s;
        this.z = axis.z * s;
        this.w = Math.cos(halfAngle);
        return this;
    }

    // Set from Euler angles (YXZ order)
    setFromEulerAngles(x: number, y: number, z: number): this {
        const c1 = Math.cos(x / 2);
        const c2 = Math.cos(y / 2);
        const c3 = Math.cos(z / 2);
        const s1 = Math.sin(x / 2);
        const s2 = Math.sin(y / 2);
        const s3 = Math.sin(z / 2);

        this.x = s1 * c2 * c3 + c1 * s2 * s3;
        this.y = c1 * s2 * c3 - s1 * c2 * s3;
        this.z = c1 * c2 * s3 + s1 * s2 * c3;
        this.w = c1 * c2 * c3 - s1 * s2 * s3;

        return this;
    }

    // --- Static Methods ---
    
    static identity(): Quaternion {
        return new Quaternion(0, 0, 0, 1);
    }

    static fromAxisAngle(axis: Vector3, angle: number): Quaternion {
        const halfAngle = angle / 2;
        const s = Math.sin(halfAngle);
        return new Quaternion(
            axis.x * s,
            axis.y * s,
            axis.z * s,
            Math.cos(halfAngle)
        );
    }
    
    static lookAt(eye: Vector3, target: Vector3, up: Vector3): Quaternion {
        const forward = target.subtract(eye).normalize();
        return Quaternion.lookDir(forward, up);
    }

    static fromArray(arr: [number, number, number, number]): Quaternion {
        return new Quaternion(arr[0], arr[1], arr[2], arr[3]);
    }

    /**
     * Creates a new quaternion that represents a rotation looking in a specific direction.
     * @param direction The direction vector to look in.
     * @param up The desired 'up' vector.
     * @returns A new quaternion with the calculated rotation.
     */
    static lookDir(direction: Vector3, up: Vector3): Quaternion {
        // CRITICAL: Ensure input vectors are normalized to prevent scaling
        const forward = direction.clone().normalize();
        const upNormalized = up.clone().normalize();
        
        // Calculate right vector
        let right = upNormalized.cross(forward).normalize();
        
        // Handle cases where direction and up are parallel
        if (right.lengthSquared() < 0.000001) {
            if (Math.abs(forward.y) === 1.0) { // Looking straight up or down
                right = new Vector3(0, 0, 1).cross(forward).normalize();
            } else {
                right = new Vector3(0, 1, 0).cross(forward).normalize();
            }
        }

        // CRITICAL: Recalculate up to ensure orthogonality and normalize it
        const newUp = forward.cross(right).normalize();
        
        // Build rotation matrix and convert to quaternion using pure math
        // Right-handed coordinate system: +X = right, +Y = up, +Z = -forward
        const m00 = right.x, m01 = right.y, m02 = right.z;
        const m10 = newUp.x, m11 = newUp.y, m12 = newUp.z;
        const m20 = -forward.x, m21 = -forward.y, m22 = -forward.z;

        // Convert rotation matrix to quaternion with improved stability
        const trace = m00 + m11 + m22;
        let qw, qx, qy, qz;

        if (trace > 0) {
            const s = Math.sqrt(trace + 1.0) * 2; // s = 4 * qw
            qw = 0.25 * s;
            qx = (m21 - m12) / s;
            qy = (m02 - m20) / s;
            qz = (m10 - m01) / s;
        } else if ((m00 > m11) && (m00 > m22)) {
            const s = Math.sqrt(1.0 + m00 - m11 - m22) * 2; // s = 4 * qx
            qw = (m21 - m12) / s;
            qx = 0.25 * s;
            qy = (m01 + m10) / s;
            qz = (m02 + m20) / s;
        } else if (m11 > m22) {
            const s = Math.sqrt(1.0 + m11 - m00 - m22) * 2; // s = 4 * qy
            qw = (m02 - m20) / s;
            qx = (m01 + m10) / s;
            qy = 0.25 * s;
            qz = (m12 + m21) / s;
        } else {
            const s = Math.sqrt(1.0 + m22 - m00 - m11) * 2; // s = 4 * qz
            qw = (m10 - m01) / s;
            qx = (m02 + m20) / s;
            qy = (m12 + m21) / s;
            qz = 0.25 * s;
        }

        // Create quaternion and ALWAYS normalize it
        const result = new Quaternion(qx, qy, qz, qw);
        result.normalize(); // CRITICAL: Always normalize after matrix conversion
        
        return result;
    }

    static slerp(q1: Quaternion, q2: Quaternion, t: number): Quaternion {
        // Spherical linear interpolation using pure math
        let dot = q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;

        // If the dot product is negative, slerp won't take the shorter path.
        // Note that v1 and -v1 are equivalent when using quaternions
        let q2Copy = q2.clone();
        if (dot < 0) {
            q2Copy.x = -q2Copy.x;
            q2Copy.y = -q2Copy.y;
            q2Copy.z = -q2Copy.z;
            q2Copy.w = -q2Copy.w;
            dot = -dot;
        }

        // If the inputs are too close for comfort, linearly interpolate
        if (dot > 0.9995) {
            const result = new Quaternion(
                q1.x + t * (q2Copy.x - q1.x),
                q1.y + t * (q2Copy.y - q1.y),
                q1.z + t * (q2Copy.z - q1.z),
                q1.w + t * (q2Copy.w - q1.w)
            );
            return result.normalize();
        }

        // Calculate the angle between the quaternions
        const theta_0 = Math.acos(Math.abs(dot));
        const sin_theta_0 = Math.sin(theta_0);
        const theta = theta_0 * t;
        const sin_theta = Math.sin(theta);

        const s0 = Math.cos(theta) - dot * sin_theta / sin_theta_0;
        const s1 = sin_theta / sin_theta_0;

        return new Quaternion(
            s0 * q1.x + s1 * q2Copy.x,
            s0 * q1.y + s1 * q2Copy.y,
            s0 * q1.z + s1 * q2Copy.z,
            s0 * q1.w + s1 * q2Copy.w
        );
    }

    static fromEulerAnglesDegrees(eulerDegrees: Vector3): Quaternion {
        const degToRad = Math.PI / 180;
        const q = new Quaternion();
        q.setFromEulerAngles(
            eulerDegrees.x * degToRad,
            eulerDegrees.y * degToRad,
            eulerDegrees.z * degToRad
        );
        return q;
    }

    slerp(target: Quaternion, alpha: number): Quaternion {
        return Quaternion.slerp(this, target, alpha);
    }

    // --- THREE.JS CONVERSION METHODS (only place where Three.js is used) ---
    
    fromThree(q: any): this {
        this.x = q.x;
        this.y = q.y;
        this.z = q.z;
        this.w = q.w;
        return this;
    }

    toThree(): any {
        // Import THREE dynamically only when needed for conversion
        const THREE = require('three');
        return new THREE.Quaternion(this.x, this.y, this.z, this.w);
    }

    // Legacy method for Three.js Euler compatibility
    setFromEuler(euler: any): this {
        // Convert Three.js Euler to our format
        this.setFromEulerAngles(euler.x, euler.y, euler.z);
        return this;
    }
}