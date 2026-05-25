---
name: create-store
description: Create a Zustand store following BMAD state management patterns
model: sonnet
allowed-tools: IDE:*
---

# Create Store

Creates a new Zustand store following BMAD state management standards with proper error handling and persistence patterns.

## Workflow

1. **Create store file**: `src/stores/myStore.ts`

2. **Use template**:

```typescript
import { create } from 'zustand';
import { ErrorHandler } from '@/utils/ErrorHandler';
import { loggerService, LogTag } from '@/utils/LoggerService';

interface MyStoreState {
  // State properties
  data: MyType | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setData: (data: MyType) => void;
  fetchData: () => Promise<void>;
  clearData: () => void;
  reset: () => void;
}

const initialState = {
  data: null,
  isLoading: false,
  error: null,
};

export const useMyStore = create<MyStoreState>((set, get) => ({
  ...initialState,

  setData: (data) => {
    loggerService.log(LogTag.STATE, 'MyStore: setData', { data });
    set({ data, error: null });
  },

  fetchData: async () => {
    try {
      set({ isLoading: true, error: null });
      loggerService.log(LogTag.API, 'MyStore: fetchData started');

      const result = await myService.getData();

      set({ data: result, isLoading: false });
      loggerService.log(LogTag.API, 'MyStore: fetchData success', { result });
    } catch (error) {
      const errorMessage = ErrorHandler.handle(error);
      set({ error: errorMessage, isLoading: false });
      loggerService.error(LogTag.API, 'MyStore: fetchData failed', { error });
    }
  },

  clearData: () => {
    loggerService.log(LogTag.STATE, 'MyStore: clearData');
    set({ data: null, error: null });
  },

  reset: () => {
    loggerService.log(LogTag.STATE, 'MyStore: reset');
    set(initialState);
  },
}));
```

## Rules

- NEVER access AsyncStorage directly from components
- Pattern: Component -> Hook -> Store -> AsyncStorage
- All async operations MUST use try/catch with ErrorHandler.handle()
- Use loggerService for all logging (NO console.log)
- Include loading and error states
- Provide reset() method
- Use TypeScript strict mode (no `any`)

## Store Access Pattern

Component -> Custom Hook -> Store:

```typescript
// hooks/useMyData.ts
export const useMyData = () => {
  const { data, isLoading, error, fetchData } = useMyStore();

  React.useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error };
};

// Component
const MyComponent = () => {
  const { data, isLoading, error } = useMyData();
  // ...
};
```

## PR Blockers

- Direct AsyncStorage access in components
- Missing error handling
- console.log() usage
- No loading/error states
- TypeScript `any` usage
