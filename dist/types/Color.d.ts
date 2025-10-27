import * as THREE from 'three';
export declare class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(r?: number | string, g?: number, b?: number, a?: number);
    private fromHex;
    toHex(includeAlpha?: boolean): string;
    lerp(targetColor: Color, t: number): Color;
    clone(): Color;
    equals(c: Color, tolerance?: number): boolean;
    toString(): string;
    /**
     * Get the final alpha value considering both color alpha and additional opacity
     */
    getFinalAlpha(additionalOpacity?: number): number;
    /**
     * Create a new color with modified alpha
     */
    withAlpha(alpha: number): Color;
    static toThree(color: Color | string | null, defaultColor?: string): THREE.Color;
    /**
     * Convert to THREE.js color with alpha support
     */
    static toThreeWithAlpha(color: Color | null, additionalOpacity?: number): {
        color: THREE.Color;
        opacity: number;
    };
    static fromHex(hex: string): Color;
    /**
     * Create a Color from HSL values
     * @param h Hue (0-360 degrees)
     * @param s Saturation (0-100 percent)
     * @param l Lightness (0-100 percent)
     * @param a Alpha (0-1, optional, defaults to 1.0)
     * @returns Color instance
     */
    static fromHsl(h: number, s: number, l: number, a?: number): Color;
}
