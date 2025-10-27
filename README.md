# @arkturian/typescript-utils

TypeScript utilities for Arkturian projects including animated properties, vector math, and easing functions.

## Installation

Install directly from GitHub:

```bash
npm install github:YOUR_USERNAME/typescript-utils
```

Or add to `package.json`:

```json
{
  "dependencies": {
    "@arkturian/typescript-utils": "github:YOUR_USERNAME/typescript-utils"
  }
}
```

## Usage

```typescript
import { InterpolatedProperty, Vector2, Easing } from '@arkturian/typescript-utils';

// Animated property
const position = new InterpolatedProperty<Vector2>(
  'position',
  new Vector2(0, 0),
  new Vector2(0, 0),
  0.5 // duration in seconds
);

position.setEasing(Easing.exponentialOut);
position.value = new Vector2(100, 100); // Animates over 0.5s

// In animation loop
requestAnimationFrame(() => {
  const current = position.value; // Gets interpolated value
  console.log(current.x, current.y);
});
```

## Features

### Properties
- **`InterpolatedProperty<T>`** - Animated properties with easing
- **`SettingsProperty<T>`** - Hierarchical property system with change events
- **`SimpleSettingsProperty<T>`** - Simple property wrapper

### Types
- **`Vector2`** / **`Vector3`** - 2D/3D vectors
- **`Quaternion`** - Rotation quaternions with slerp
- **`Color`** - Color utilities
- **`BoundingBox`** - AABB bounding boxes

### Easing Functions
- `linear`, `easeInQuad`, `easeOutQuad`, `easeInOutQuad`
- `easeInCubic`, `easeOutCubic`, `easeInOutCubic`
- `easeOutElastic`, `exponentialOut`

## Development

```bash
# Build
npm run build

# Watch mode
npm run watch

# Test
npm test
```

## License

MIT - Arkturian

