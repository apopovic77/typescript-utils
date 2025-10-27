import { Vector3 } from "./Vector3";

export class BoundingBox {
    public min: Vector3;
    public max: Vector3;

    constructor(min: Vector3 = new Vector3(Infinity, Infinity, Infinity), max: Vector3 = new Vector3(-Infinity, -Infinity, -Infinity)) {
        this.min = min;
        this.max = max;
    }

    public getCenter(): Vector3 {
        return this.min.clone().add(this.max).multiplyScalar(0.5);
    }

    public getSize(): Vector3 {
        return this.max.clone().subtract(this.min);
    }

    /**
     * Calculate where a ray from center intersects with bounding sphere surface
     * @param sphereCenter - Center of the sphere
     * @param sphereRadius - Radius of the sphere  
     * @param direction - Normalized direction vector from center
     * @returns Surface intersection point on the sphere
     */
    public static sphereIntersection(sphereCenter: Vector3, sphereRadius: number, direction: Vector3): Vector3 {
        // For sphere intersection: surface point = center + (direction * radius)
        return sphereCenter.add(direction.multiply(sphereRadius));
    }

    /**
     * Calculate where a ray from center intersects with bounding box surface
     * @param center - Starting point of the ray
     * @param direction - Normalized direction vector
     * @returns Surface intersection point on the box
     */
    public rayIntersection(center: Vector3, direction: Vector3): Vector3 {
        // Calculate intersection with each face and find the closest positive intersection
        let closestT = Infinity;
        
        // Check all 6 faces of the box
        const faces = [
            { normal: new Vector3(1, 0, 0), point: this.max.x }, // +X face
            { normal: new Vector3(-1, 0, 0), point: this.min.x }, // -X face
            { normal: new Vector3(0, 1, 0), point: this.max.y }, // +Y face
            { normal: new Vector3(0, -1, 0), point: this.min.y }, // -Y face
            { normal: new Vector3(0, 0, 1), point: this.max.z }, // +Z face
            { normal: new Vector3(0, 0, -1), point: this.min.z }, // -Z face
        ];
        
        for (const face of faces) {
            const denominator = direction.dot(face.normal);
            if (Math.abs(denominator) > 0.0001) { // Not parallel
                const t = (face.point - center.dot(face.normal)) / denominator;
                if (t > 0 && t < closestT) { // Positive direction and closer
                    const intersection = center.add(direction.multiply(t));
                    
                    // Check if intersection is within box bounds
                    if (intersection.x >= this.min.x && intersection.x <= this.max.x &&
                        intersection.y >= this.min.y && intersection.y <= this.max.y &&
                        intersection.z >= this.min.z && intersection.z <= this.max.z) {
                        closestT = t;
                    }
                }
            }
        }
        
        // If no intersection found, use the direction scaled to box size
        if (closestT === Infinity) {
            const size = Math.max(this.max.x - this.min.x, this.max.y - this.min.y, this.max.z - this.min.z) * 0.5;
            return center.add(direction.multiply(size));
        }
        
        return center.add(direction.multiply(closestT));
    }
} 