import * as THREE from 'three';

export class Color {
    public r!: number; // 0-1
    public g!: number; // 0-1
    public b!: number; // 0-1
    public a!: number; // 0-1, alpha channel

    constructor(r: number | string = 1, g: number = 1, b: number = 1, a: number = 1) {
        if (typeof r === 'string') {
            this.fromHex(r);
        } else {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
    }

    private fromHex(hex: string): void {
        const hexVal = hex.startsWith('#') ? hex.substring(1) : hex;
        
        if (hexVal.length === 8) {
            // #RRGGBBAA format
            const bigint = parseInt(hexVal, 16);
            this.r = ((bigint >> 24) & 255) / 255;
            this.g = ((bigint >> 16) & 255) / 255;
            this.b = ((bigint >> 8) & 255) / 255;
            this.a = (bigint & 255) / 255;
        } else if (hexVal.length === 6) {
            // #RRGGBB format (backwards compatible)
            const bigint = parseInt(hexVal, 16);
            this.r = ((bigint >> 16) & 255) / 255;
            this.g = ((bigint >> 8) & 255) / 255;
            this.b = (bigint & 255) / 255;
            this.a = 1.0; // Default alpha
        } else {
            // Invalid format, use default
            this.r = 1.0;
            this.g = 1.0;
            this.b = 1.0;
            this.a = 1.0;
        }
    }

    toHex(includeAlpha: boolean = false): string {
        const toHexVal = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0');
        
        if (includeAlpha) {
            return `#${toHexVal(this.r)}${toHexVal(this.g)}${toHexVal(this.b)}${toHexVal(this.a)}`;
        } else {
            return `#${toHexVal(this.r)}${toHexVal(this.g)}${toHexVal(this.b)}`;
        }
    }

    lerp(targetColor: Color, t: number): Color {
        const r = this.r + (targetColor.r - this.r) * t;
        const g = this.g + (targetColor.g - this.g) * t;
        const b = this.b + (targetColor.b - this.b) * t;
        const a = this.a + (targetColor.a - this.a) * t;
        return new Color(r, g, b, a);
    }
    
    clone(): Color {
        return new Color(this.r, this.g, this.b, this.a);
    }

    equals(c: Color, tolerance: number = 0.001): boolean {
        return Math.abs(this.r - c.r) < tolerance &&
               Math.abs(this.g - c.g) < tolerance &&
               Math.abs(this.b - c.b) < tolerance &&
               Math.abs(this.a - c.a) < tolerance;
    }

    toString(): string {
        // Return with alpha if not fully opaque, otherwise just RGB
        return this.a < 1.0 ? this.toHex(true) : this.toHex(false);
    }

    /**
     * Get the final alpha value considering both color alpha and additional opacity
     */
    getFinalAlpha(additionalOpacity: number = 1.0): number {
        return this.a * additionalOpacity;
    }

    /**
     * Create a new color with modified alpha
     */
    withAlpha(alpha: number): Color {
        return new Color(this.r, this.g, this.b, alpha);
    }

    static toThree(color: Color | string | null, defaultColor: string = '#ffffff'): THREE.Color {
        if (color instanceof Color) {
            return new THREE.Color(color.r, color.g, color.b);
        }
        if (typeof color === 'string') {
            return new THREE.Color(color);
        }
        // Handle plain objects that might have been deserialized incorrectly
        if (color && typeof color === 'object' && 'r' in color && 'g' in color && 'b' in color) {
            return new THREE.Color((color as any).r, (color as any).g, (color as any).b);
        }
        return new THREE.Color(defaultColor);
    }

    /**
     * Convert to THREE.js color with alpha support
     */
    static toThreeWithAlpha(color: Color | null, additionalOpacity: number = 1.0): { color: THREE.Color; opacity: number } {
        if (color) {
            return {
                color: new THREE.Color(color.r, color.g, color.b),
                opacity: color.getFinalAlpha(additionalOpacity)
            };
        }
        return {
            color: new THREE.Color('#ffffff'),
            opacity: additionalOpacity
        };
    }

    static fromHex(hex: string): Color {
        const color = new Color();
        color.fromHex(hex);
        return color;
    }
    
    /**
     * Create a Color from HSL values
     * @param h Hue (0-360 degrees)
     * @param s Saturation (0-100 percent)
     * @param l Lightness (0-100 percent)
     * @param a Alpha (0-1, optional, defaults to 1.0)
     * @returns Color instance
     */
    static fromHsl(h: number, s: number, l: number, a: number = 1.0): Color {
        // Normalize values
        h = ((h % 360) + 360) % 360; // Ensure h is in [0, 360)
        s = Math.max(0, Math.min(100, s)) / 100; // Clamp s to [0, 1]
        l = Math.max(0, Math.min(100, l)) / 100; // Clamp l to [0, 1]
        a = Math.max(0, Math.min(1, a)); // Clamp a to [0, 1]
        
        // Convert HSL to RGB
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        
        let r = 0, g = 0, b = 0;
        
        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }
        
        return new Color(r + m, g + m, b + m, a);
    }
} 