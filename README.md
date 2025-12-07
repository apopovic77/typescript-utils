# @apopovic77/typescript-utils

**TypeScript utilities for animated properties, vector math, and field-aware systems.**

Built for production use in 3D engines, data visualization, and interactive applications.

[![npm version](https://img.shields.io/npm/v/@apopovic77/typescript-utils.svg)](https://www.npmjs.com/package/@apopovic77/typescript-utils)

---

## 🌟 Features

### ⚡ InterpolatedProperty - Automatic Smooth Animation

Every property change animates automatically. No manual tweening, no animation loops.

```typescript
import { InterpolatedProperty, Vector3 } from '@apopovic77/typescript-utils';

// Create animated property
const opacity = new InterpolatedProperty('opacity', 1.0, null, 0.3);

// Change value → Automatic smooth transition!
opacity.value = 0.0; // Fades over 0.3 seconds

// Works with numbers, Vector3, Quaternion, Color, any Lerpable type!
const position = new InterpolatedProperty('position', new Vector3(0, 0, 0), null, 0.5);
position.value = new Vector3(10, 5, 0); // Smooth movement!
```

**Why InterpolatedProperty is Brilliant:**
- ✅ Deklarative API - Just set value, animation happens automatically
- ✅ Type-safe generics - Works with any type (numbers, vectors, quaternions, colors)
- ✅ Hierarchical - Properties can inherit from parents
- ✅ Easing functions - Exponential, cubic, elastic, bounce, etc.
- ✅ Event system - Subscribe to changes
- ✅ Sine oscillation mode - Built-in wiggle/breathing effects
- ✅ UI integration - Automatic metadata for UI generation

### 📐 Vector Math

Complete 2D/3D vector and quaternion library:

```typescript
import { Vector3, Quaternion, Color } from '@apopovic77/typescript-utils';

const v1 = new Vector3(1, 2, 3);
const v2 = new Vector3(4, 5, 6);

// Vector operations
const sum = v1.clone().add(v2);
const cross = new Vector3().crossVectors(v1, v2);
const distance = v1.distanceTo(v2);

// Interpolation
const lerped = v1.clone().lerp(v2, 0.5); // 50% between v1 and v2

// Quaternion rotations
const quat = new Quaternion();
quat.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2); // 90° around Y-axis
```

### 🎨 Easing Functions

Professional easing functions for smooth animations:

```typescript
import { Easing } from '@apopovic77/typescript-utils';

// Available easings:
Easing.linear
Easing.exponentialOut  // Default - smooth deceleration
Easing.exponentialIn
Easing.exponentialInOut
Easing.cubicOut
Easing.cubicInOut
Easing.elasticOut      // Bouncy
Easing.bounceOut       // Realistic bounce
```

### 🔗 Lerpable & Slerpable Interfaces

Extensible interpolation system:

```typescript
import { Lerpable, Slerpable } from '@apopovic77/typescript-utils';

// Make any type interpolatable
class MyType implements Lerpable<MyType> {
    constructor(public value: number) {}

    lerp(other: MyType, t: number): MyType {
        return new MyType(this.value + (other.value - this.value) * t);
    }

    clone(): MyType {
        return new MyType(this.value);
    }
}

// Now works with InterpolatedProperty!
const prop = new InterpolatedProperty('myProp', new MyType(0), null);
prop.value = new MyType(100); // Smooth interpolation!
```

---

## 📦 Installation

```bash
npm install @apopovic77/typescript-utils
```

### From Source (Development)

```bash
git clone git@github.com:apopovic77/typescript-utils.git
cd typescript-utils
npm install
npm run build
npm link
```

Then in your project:
```bash
npm link @apopovic77/typescript-utils
```

---

## 🚀 Usage

### Basic Example

```typescript
import {
    InterpolatedProperty,
    Vector3,
    Easing
} from '@apopovic77/typescript-utils';

// Create entity with animated properties
class Entity {
    public readonly position = new InterpolatedProperty(
        'position',
        new Vector3(0, 0, 0),
        null,
        0.5 // 0.5 second duration
    );

    public readonly opacity = new InterpolatedProperty(
        'opacity',
        1.0,
        null,
        0.3
    ).setEasing(Easing.exponentialOut);

    constructor() {
        // Subscribe to changes
        this.position.on((newVal, oldVal) => {
            console.log('Position changed:', newVal);
        });
    }

    moveTo(pos: Vector3) {
        this.position.value = pos; // Smooth 0.5s movement
    }

    fadeOut() {
        this.opacity.value = 0; // Smooth 0.3s fade
    }
}

// Usage
const entity = new Entity();
entity.moveTo(new Vector3(10, 5, 0)); // Animates smoothly!
entity.fadeOut(); // Fades out smoothly!
```

### Hierarchical Properties

Properties can inherit values from parents:

```typescript
// Global default
const globalOpacity = new InterpolatedProperty('opacity', 1.0, null);

// Child property (inherits if no own value)
const entityOpacity = new InterpolatedProperty(
    'opacity',
    null, // No initial value
    null,
    0.3,
    'Appearance',
    globalOpacity // Parent
);

// Change global → All children inherit
globalOpacity.value = 0.5; // All entities fade to 50%

// Override for specific entity
entityOpacity.value = 1.0; // This entity stays at 100%
```

### Sine Oscillation Mode

Built-in wiggle/breathing effects:

```typescript
const wiggle = new InterpolatedProperty('wiggle', 0, null);

// Enable sine wave oscillation
wiggle.enableSinAnimation({
    amplitude: 0.5,   // Oscillation range
    frequencyHz: 2.0, // 2 cycles per second
    phaseRad: 0       // Phase offset
});

// Property now oscillates: value = target + amplitude * sin(2πft + phase)
// Perfect for breathing effects, idle movements, etc.
```

---

## 🎯 Use Cases

### 1. 3D Engines & Game Development

```typescript
class GameObject {
    transform = {
        position: new InterpolatedProperty('pos', new Vector3(), null, 0.5),
        rotation: new InterpolatedProperty('rot', new Quaternion(), null, 0.3),
        scale: new InterpolatedProperty('scale', new Vector3(1,1,1), null, 0.2)
    };

    // Smooth movement
    moveTo(target: Vector3) {
        this.transform.position.value = target;
    }
}
```

### 2. UI Animations

```typescript
class UIElement {
    opacity = new InterpolatedProperty('opacity', 1, null, 0.3);
    scale = new InterpolatedProperty('scale', 1, null, 0.2);
    color = new InterpolatedProperty('color', new Color(1,1,1), null, 0.3);

    show() {
        this.opacity.value = 1;
        this.scale.value = 1;
    }

    hide() {
        this.opacity.value = 0;
        this.scale.value = 0;
    }
}
```

### 3. Data Visualization

```typescript
class DataPoint {
    position = new InterpolatedProperty('pos', new Vector3(), null, 0.5);
    size = new InterpolatedProperty('size', 1, null, 0.3);
    color = new InterpolatedProperty('color', new Color(1,1,1), null, 0.4);

    update(data: Data) {
        // Smooth transitions when data changes
        this.position.value = this.calculatePosition(data);
        this.size.value = data.value;
        this.color.value = this.getColorForValue(data.value);
    }
}
```

---

## 📚 API Documentation

### InterpolatedProperty<T>

#### Constructor
```typescript
new InterpolatedProperty<T>(
    name: string,
    initialValue: T | null,
    defaultValue: T | null,
    duration: number = 0.5,
    groupName?: string,
    parent?: SettingsProperty<T>
)
```

#### Properties
- `value: T | null` - Current value (getter/setter, animated)
- `targetValue: T | null` - Target value (final destination)
- `isInterpolating: boolean` - Currently animating?
- `progress: number` - Animation progress (0-1)
- `duration: number` - Animation duration in seconds

#### Methods
- `setImmediate(value: T)` - Set value without animation
- `setDuration(duration: number)` - Change animation duration
- `setEasing(easing: EasingFunction)` - Change easing function
- `on(handler: (newVal, oldVal, prop) => void)` - Subscribe to changes
- `enableSinAnimation(params)` - Enable sine oscillation
- `disableSinAnimation()` - Disable sine oscillation

#### Fluent API
```typescript
const prop = new InterpolatedProperty('opacity', 1.0, null)
    .withDuration(0.5)
    .withEasing(Easing.exponentialOut)
    .withCurrentValueInUI(true);
```

### Vector3

#### Constructor
```typescript
new Vector3(x: number = 0, y: number = 0, z: number = 0)
```

#### Methods
- `clone()` - Create copy
- `add(v: Vector3)` - Add vector (mutates)
- `sub(v: Vector3)` - Subtract vector (mutates)
- `multiply(scalar: number)` - Multiply by scalar (mutates)
- `normalize()` - Normalize to unit length (mutates)
- `dot(v: Vector3)` - Dot product
- `cross(v: Vector3)` - Cross product
- `length()` - Vector length
- `distanceTo(v: Vector3)` - Distance to other vector
- `lerp(v: Vector3, t: number)` - Linear interpolation
- `equals(v: Vector3)` - Equality check

### Quaternion

#### Constructor
```typescript
new Quaternion(x: number = 0, y: number = 0, z: number = 0, w: number = 1)
```

#### Methods
- `setFromAxisAngle(axis: Vector3, angle: number)` - Set from axis-angle
- `setFromEuler(x, y, z, order?)` - Set from Euler angles
- `multiply(q: Quaternion)` - Multiply quaternions
- `slerp(q: Quaternion, t: number)` - Spherical interpolation
- `normalize()` - Normalize quaternion
- `invert()` - Invert quaternion

---

## 🏗️ Architecture

This library embodies **Senior-Level Software Engineering** principles:

### Design Patterns
- **Generic Programming** - Type-safe for any interpolatable type
- **Strategy Pattern** - Pluggable easing functions
- **Observer Pattern** - Event system for property changes
- **Template Method** - Abstract base class with hooks
- **Factory Method** - Static create() methods

### SOLID Principles
- ✅ **Single Responsibility** - Each class has one job
- ✅ **Open/Closed** - Extensible via interfaces (Lerpable, Slerpable)
- ✅ **Liskov Substitution** - Subtypes fully substitutable
- ✅ **Interface Segregation** - Small, focused interfaces
- ✅ **Dependency Inversion** - Depend on abstractions

### Clean Code
- Comprehensive TypeScript types
- Defensive copying (immutability where appropriate)
- Clear naming conventions
- Extensive documentation
- Production-tested code

---

## 🔧 Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch

# Test (when configured)
npm test
```

### Project Structure

```
typescript-utils/
├── src/
│   ├── properties/
│   │   ├── SettingsProperty.ts       # Abstract base class
│   │   ├── InterpolatedProperty.ts   # Animated properties ⭐
│   │   └── SimpleSettingsProperty.ts # Non-animated properties
│   ├── types/
│   │   ├── Vector2.ts
│   │   ├── Vector3.ts
│   │   ├── Quaternion.ts
│   │   ├── Color.ts
│   │   ├── Lerpable.ts              # Interpolation interface
│   │   ├── Slerpable.ts             # Spherical interpolation
│   │   ├── easing.ts                # Easing functions
│   │   └── type-guards.ts           # Runtime type checking
│   ├── core/
│   │   └── Logger.ts
│   └── index.ts                     # Public API
├── dist/                            # Build output
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📖 Examples

See the [3dPresenter2 engine](https://github.com/apopovic77/3dPresenter2) for production usage of this library in a complete 3D scene engine with:
- Field-aware self-organizing systems
- POI (Points of Interest) with animated properties
- Layout systems (Circle, Grid, Spiral, Hex)
- Complex coordinated animations

---

## 🤝 Contributing

This is a production library used in Arkturian projects.

For bugs or feature requests, please open an issue on GitHub.

---

## 📄 License

MIT License

Copyright (c) 2024 Arkturian (Alex Popovic)

---

## 🌟 About Arkturian

Arkturian builds elite-level software systems with focus on:
- Clean OOP architecture
- Production-ready code
- Advanced design patterns
- Innovative solutions

**Projects:**
- **3dPresenter2** - TypeScript 3D Engine with Field-Aware Systems
- **Storage API** - Python FastAPI with AI Vision Integration
- **O'Neal API** - Multi-tenant Product Management System
- **typescript-utils** - This library

---

**Built with precision. Engineered for excellence.**
