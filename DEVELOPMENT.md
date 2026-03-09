# Development Setup

This project uses [muka-ui](https://github.com/uxdelta/muka) as a local dependency via `npm link` for simultaneous development.

---

## Styling Guidelines: Muka UI Only

**This app is a proof-of-concept for Muka UI. All UI components must come from muka-ui.**

### The Rule

Every button, input, card, badge, and UI element must be imported from `muka-ui`. This forces the design system to grow based on real application needs and keeps the grip consistent and maintainable.

### Check Available Components

1. **Storybook (production):** [storybook.mukaui.com](https://storybook.mukaui.com)
2. **Storybook (local):** http://localhost:6006 when running `npm run dev` in muka

### What's Allowed

```tsx
// ✅ Import UI components from muka-ui
import { Button, Card, Input, Badge } from 'muka-ui';

// ✅ Use Muka UI tokens for layout spacing
<div style={{
  display: 'flex',
  gap: 'var(--spacing-4)',
  padding: 'var(--spacing-6)'
}}>

// ✅ Use semantic color tokens
<span style={{ color: 'var(--color-text-subtle-default)' }}>
```

### What's Prohibited

```tsx
// ❌ No Tailwind classes
<div className="flex gap-4 p-6">

// ❌ No CSS modules
import styles from './Component.module.css';

// ❌ No styled-components
const StyledButton = styled.button`...`;

// ❌ No arbitrary colors or values
<div style={{ color: '#6366f1', padding: '24px' }}>

// ❌ No creating UI components in this repo
// (create them in muka-ui instead)
```

### When a Component Doesn't Exist

If you need a component that isn't in Muka UI yet:

1. **Stop** — the grip feature is blocked
2. **Switch to muka-ui** — create the component there first
3. **Add to Storybook** — verify it works with all themes
4. **Build muka-ui** — run `npm run build` in the muka directory
5. **Resume** — continue the grip feature

This workflow ensures all UI components are reusable and documented.

---

## Prerequisites

- Node.js 18+
- npm 9+
- Both projects cloned:
  - `/Users/revikornmann/dev/muka` (muka-ui design system)
  - `/Users/revikornmann/dev/grip` (this app)

## Initial Setup

The npm link is already configured. If you're setting up fresh:

```bash
# 1. Build muka-ui
cd /Users/revikornmann/dev/muka
npm install
npm run build

# 2. Register muka-ui globally
npm link

# 3. Link in grip
cd /Users/revikornmann/dev/grip
npm install
npm link muka-ui
```

## Development Workflow

### Running Both Projects

**Terminal 1 - Muka UI Storybook:**
```bash
cd /Users/revikornmann/dev/muka
npm run dev  # Starts Storybook on http://localhost:6006
```

**Terminal 2 - Tax Calculator:**
```bash
cd /Users/revikornmann/dev/grip
npm run dev  # Starts Next.js on http://localhost:3000
```

### Making Changes to muka-ui

When you modify components in muka-ui:

1. **For TypeScript/React changes:**
   ```bash
   cd /Users/revikornmann/dev/muka
   npm run build:components
   ```
   The grip app will pick up changes on next refresh.

2. **For token/CSS changes:**
   ```bash
   cd /Users/revikornmann/dev/muka
   npm run build  # Rebuilds tokens + components + styles
   ```

3. **Watch mode (recommended):**
   You can run the token build in watch mode for continuous development:
   ```bash
   # In muka directory
   npm run build:tokens  # Run after token JSON changes
   npm run build:styles  # Run after CSS changes
   ```

## Re-linking After node_modules Deletion

If you delete `node_modules` in either project, you need to re-establish the link:

```bash
# 1. Rebuild and re-register muka-ui
cd /Users/revikornmann/dev/muka
npm install
npm run build
npm link

# 2. Re-link in grip
cd /Users/revikornmann/dev/grip
npm install
npm link muka-ui
```

## Switching to Published Package

When muka-ui is published to npm:

```bash
cd /Users/revikornmann/dev/grip

# 1. Unlink the local package
npm unlink muka-ui

# 2. Install from npm
npm install muka-ui

# 3. (Optional) Unregister the global link
cd /Users/revikornmann/dev/muka
npm unlink
```

## Importing Components

```tsx
// Import components
import { Button, Card, Input, Badge } from 'muka-ui';

// Import styles in your root layout (already configured in src/app/layout.tsx)
import 'muka-ui/styles';

// For specific themes:
import 'muka-ui/styles/muka-dark.css';      // Dark theme
import 'muka-ui/styles/wireframe-light.css'; // Wireframe brand, light
import 'muka-ui/styles/wireframe-dark.css';  // Wireframe brand, dark
```

## Available Components

- `Button` - Primary, secondary, ghost variants with sm/md/lg sizes
- `Card` - Content container with token-based styling
- `Input` - Text input with label, helper text, error states
- `Badge` - Status indicators (info, success, warning, error)
- `Label` - Form field labels
- `Icon` - Icon wrapper
- `Divider` - Visual separator
- `Select` - Dropdown select
- `Tabs`, `TabList`, `Tab`, `TabPanel` - Tabbed interface
- `ListItem` - List item component

## Troubleshooting

### "Module not found: Can't resolve 'muka-ui'"

The link may be broken. Re-run:
```bash
cd /Users/revikornmann/dev/muka && npm link
cd /Users/revikornmann/dev/grip && npm link muka-ui
```

### "Invalid hook call" Error

This usually means duplicate React instances. Ensure:
1. muka-ui has React as a `peerDependency` (not regular dependency)
2. Only grip's React is being used

Check for duplicate React:
```bash
npm ls react
```

### Styles Not Loading

Make sure you have `import 'muka-ui/styles';` in your root layout.

### TypeScript Errors After muka-ui Changes

Rebuild the types:
```bash
cd /Users/revikornmann/dev/muka
npm run build:types
```

## Next.js Configuration

This project uses webpack mode (not Turbopack) for npm link compatibility. See `next.config.ts` for configuration.

The `transpilePackages` setting ensures muka-ui is properly transpiled:
```ts
transpilePackages: ["muka-ui"],
```
