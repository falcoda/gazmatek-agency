---
name: create-component
description: Create a BMAD-compliant React component with proper structure
model: sonnet
allowed-tools: IDE:*
---

# Create Component

Creates a new React component following BMAD standards with proper file structure, TypeScript typing, and theme integration.

## Workflow

1. **Determine component location**
   - UI components: `src/components/ComponentName/`
   - Page components: `src/pages/ComponentName/`

2. **Create component file**
   - File: `ComponentName/ComponentName.tsx` (NEVER index.tsx)
   - Test: `ComponentName/ComponentName.test.tsx`

3. **Use template**:

```typescript
import { useTheme } from '@/hooks/useTheme';

interface ComponentNameProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'warning';
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  // Add specific props here
}

export const ComponentName = ({
  variant = 'primary',
  disabled = false,
  loading = false,
  testID,
  accessibilityLabel,
}: ComponentNameProps) => {
  const { theme } = useTheme();

  // Component logic here

  return (
    // JSX here
  );
};
```

4. **Create test file**:

```typescript
import { render } from '@testing-library/react-native';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<ComponentName testID="component-name" />);
    expect(getByTestId('component-name')).toBeTruthy();
  });
});
```

## Rules

- File MUST be named `ComponentName.tsx`, NOT `index.tsx`
- **Each component MUST have its own dedicated folder**, even if related to another component
- MUST use `useTheme()` for all styling
- NO hardcoded colors (#FFF, 'red', etc.)
- Use `theme.colors.*` or `theme.baseColors.*`
- Include proper TypeScript interfaces
- Add testID and accessibilityLabel props
- Standard variant props: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'warning'
- Standard boolean props: disabled, loading

## One Component = One Folder (CRITICAL)

Each component must live in its own folder. If a component is **related to / belongs to a parent component**, place it as a **sub-folder inside the parent's folder**. Never put multiple `.tsx` files flat in the same folder, and never create sibling top-level folders for child components.

### ❌ WRONG — flat files in the same folder

```
pages/LinkedInPost/
  LinkedInPost.tsx
  LinkedInPostExport.tsx   ❌
  LinkedInPostPage.tsx     ❌
```

### ❌ WRONG — sibling top-level folders for child components

```
pages/LinkedInPost/
  LinkedInPost.tsx
pages/LinkedInPostExport/    ❌
  LinkedInPostExport.tsx
pages/LinkedInPostPage/      ❌
  LinkedInPostPage.tsx
```

### ✅ CORRECT — child components as subfolders of the parent

```
pages/LinkedInPost/
  LinkedInPost.tsx
  LinkedInPostExport/
    LinkedInPostExport.tsx
  LinkedInPostPage/
    LinkedInPostPage.tsx
```

## PR Blockers

- File named `index.tsx`
- Multiple components sharing the same folder
- Hardcoded colors
- Missing `useTheme()`
- No test file
- TypeScript `any` usage
