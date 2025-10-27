export class Vector2 {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    public set(x: number, y: number): this {
        this.x = x;
        this.y = y;
        return this;
    }

    public copy(v: Vector2): this {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    public equals(v: Vector2): boolean {
        return v.x === this.x && v.y === this.y;
    }
} 