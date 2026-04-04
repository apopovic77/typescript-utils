/**
 * Layouters - High-level layout API.
 * Port of modern-layouters.js ModernLayouters class.
 * Each static method takes a LayoutConfig and returns LayoutTransform[].
 */
import { LayoutConfig, LayoutTransform } from './types';
export declare class Layouters {
    /**
     * Circle layout - distribute objects along a circle path.
     */
    static circle(config: LayoutConfig): LayoutTransform[];
    /**
     * Line layout - distribute objects along a line path.
     */
    static line(config: LayoutConfig): LayoutTransform[];
    /**
     * Spiral layout - distribute objects along a spiral path.
     */
    static spiral(config: LayoutConfig): LayoutTransform[];
    /**
     * Adaptive line layout - normalizes object heights and adaptive spacing.
     * Requires objects with userData dimensions.
     * Returns transforms with needsAdaptiveScaling=true.
     */
    static lineAdaptive(config: LayoutConfig): LayoutTransform[];
    /**
     * Adaptive circle layout - normalizes object heights and adaptive arc spacing.
     */
    static circleAdaptive(config: LayoutConfig): LayoutTransform[];
    /**
     * Adaptive spiral layout - normalizes object heights and adaptive spiral spacing.
     */
    static spiralAdaptive(config: LayoutConfig): LayoutTransform[];
    /**
     * Sphere Grid layout.
     */
    static sphereGrid(config: LayoutConfig): LayoutTransform[];
    /**
     * Sphere Hex layout (Fibonacci distribution).
     */
    static sphereHex(config: LayoutConfig): LayoutTransform[];
    /**
     * Sphere Hex Rings layout - ring-based hexagonal pattern on sphere.
     */
    static sphereHexRings(config: LayoutConfig): LayoutTransform[];
    /**
     * Sphere Hex Honeycomb layout - true honeycomb tessellation pattern.
     */
    static sphereHexHoneycomb(config: LayoutConfig): LayoutTransform[];
    /**
     * Plane Grid layout.
     */
    static planeGrid(config: LayoutConfig): LayoutTransform[];
    /**
     * Plane Hex layout.
     */
    static planeHex(config: LayoutConfig): LayoutTransform[];
    /**
     * Plane Hex Rings layout.
     */
    static planeHexRings(config: LayoutConfig): LayoutTransform[];
    /**
     * Cylinder Grid layout.
     */
    static cylinderGrid(config: LayoutConfig): LayoutTransform[];
    /**
     * Adaptive Line Layout - positions only, scale calculated externally.
     */
    private static _adaptiveLineLayoutPositionsOnly;
    /**
     * Adaptive Line Layout with explicit direction (fallback for edge cases).
     */
    private static _adaptiveLineLayoutWithDirection;
    /**
     * Adaptive Circle Layout - positions only, scale calculated externally.
     */
    private static _adaptiveCircleLayoutPositionsOnly;
    /**
     * Adaptive Spiral Layout - positions only, scale calculated externally.
     */
    private static _adaptiveSpiralLayoutPositionsOnly;
    /**
     * Find correct t-increment for spiral to achieve desired arc length (legacy Y-axis spiral).
     */
    static findSpiralTIncrement(currentT: number, targetDistance: number, spiralTurns: number, maxRadius: number, growthRate?: number): number;
    /**
     * Find correct t-increment for spiral with custom direction.
     */
    private static _findSpiralTIncrementWithDirection;
    /**
     * Get spiral position for given t parameter (legacy Y-axis spiral).
     */
    private static _getSpiralPosition;
    /**
     * Get spiral position for given t parameter with custom direction.
     */
    private static _getSpiralPositionWithDirection;
}
