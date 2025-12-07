# Publishing Guide - @arkturian/typescript-utils

## 📦 Publishing to GitHub Packages

### Prerequisites

1. **GitHub Personal Access Token** with `write:packages` permission
   - Go to: https://github.com/settings/tokens
   - Generate new token (classic)
   - Select scope: `write:packages`
   - Copy token

2. **Authenticate npm with GitHub**
   ```bash
   npm login --registry=https://npm.pkg.github.com
   # Username: apopovic77
   # Password: <YOUR_GITHUB_TOKEN>
   # Email: alex@arkturian.com
   ```

### Publishing Steps

```bash
# 1. Ensure you're on main branch
git checkout main

# 2. Update version (if needed)
npm version patch  # or minor, or major
# This creates a git tag automatically

# 3. Build
npm run build

# 4. Publish to GitHub Packages
npm publish

# 5. Push version tag to GitHub
git push origin main --tags
```

### Version Management

```bash
# Patch version (1.0.0 → 1.0.1) - Bug fixes
npm version patch

# Minor version (1.0.0 → 1.1.0) - New features (backward compatible)
npm version minor

# Major version (1.0.0 → 2.0.0) - Breaking changes
npm version major
```

---

## 📥 Installing the Package

### In Other Projects

```bash
# 1. Configure npm to use GitHub Packages for @arkturian scope
echo "@arkturian:registry=https://npm.pkg.github.com" >> .npmrc

# 2. Authenticate (if not already)
npm login --registry=https://npm.pkg.github.com

# 3. Install
npm install @arkturian/typescript-utils
```

### Using in React Projects

```typescript
// tsconfig.json - Add to compilerOptions
{
  "compilerOptions": {
    "moduleResolution": "bundler", // or "node"
    "esModuleInterop": true
  }
}
```

```typescript
// Usage
import {
    InterpolatedProperty,
    Vector3,
    Easing
} from '@arkturian/typescript-utils';

const position = new InterpolatedProperty('pos', new Vector3(0,0,0), null, 0.5);
position.value = new Vector3(10, 5, 0); // Smooth animation!
```

---

## 🔄 Update Workflow

When making changes to typescript-utils:

```bash
# 1. Make changes in src/
# ...

# 2. Commit to dev
git add .
git commit -m "feature: improved interpolation"
git push origin dev

# 3. When ready for release
git checkout main
git merge dev

# 4. Bump version
npm version patch

# 5. Publish
npm run build
npm publish

# 6. Push
git push origin main --tags
```

---

## 🏷️ GitHub Release

After publishing, create a GitHub release:

```bash
# Via GitHub CLI
gh release create v1.0.1 --title "Version 1.0.1" --notes "Bug fixes and improvements"

# Or manually on GitHub
# https://github.com/apopovic77/typescript-utils/releases/new
```

---

## 🚨 Troubleshooting

### "npm ERR! 404 Not Found"

**Solution:** Ensure `publishConfig` in package.json is correct:
```json
"publishConfig": {
  "registry": "https://npm.pkg.github.com"
}
```

### "npm ERR! need auth"

**Solution:** Login to GitHub Packages:
```bash
npm login --registry=https://npm.pkg.github.com
```

### "npm ERR! 403 Forbidden"

**Solution:** Check GitHub token has `write:packages` permission.

---

## 📊 Package Status

Check package status:

```bash
# View on GitHub
https://github.com/apopovic77/typescript-utils/packages

# View versions
npm view @arkturian/typescript-utils versions

# View latest version
npm view @arkturian/typescript-utils version
```

---

## 🔐 Security

**NEVER** commit:
- GitHub tokens
- `.npmrc` with auth tokens
- `.env` files

**Add to `.gitignore`:**
```
.npmrc
.env
*.env.local
```

---

## ✅ Checklist Before Publishing

- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] README.md updated
- [ ] Version bumped (`npm version`)
- [ ] Git committed and pushed
- [ ] Changelog updated (if exists)
- [ ] Breaking changes documented

---

**Last Updated:** 2025-11-28
