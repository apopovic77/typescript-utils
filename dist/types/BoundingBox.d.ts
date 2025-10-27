import { Vector3 } from "./Vector3";
export declare class BoundingBox {
    min: Vector3;
    max: Vector3;
    constructor(min?: Vector3, max?: Vector3);
    getCenter(): Vector3;
    getSize(): Vector3;
    /**
     * Calculate where a ray from center intersects with bounding sphere surface
     * @param sphereCenter - Center of the sphere
     * @param sphereRadius - Radius of the sphere
     * @param direction - Normalized direction vector from center
     * @returns Surface intersection point on the sphere
     */
    static sphereIntersection(sphereCenter: Vector3, sphereRadius: number, direction: Vector3): Vector3;
    /**
     * Calculate where a ray from center intersects with bounding box surface
     * @param center - Starting point of the ray
     * @param direction - Normalized direction vector
     * @returns Surface intersection point on the box
     */
    rayIntersection(center: Vector3, direction: Vector3): Vector3;
}
