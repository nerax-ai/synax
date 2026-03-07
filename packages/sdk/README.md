# @synax-ai/sdk

SDK and type definitions for Synax AI.

## Install

```bash
npm install @synax-ai/sdk
```

## Exports

```ts
// Common types
export * from './common';

// Protocol definitions
export * from './protocol';

// Provider types
export * from './provider';

// Group configuration
export * from './group';

// Dispatcher types
export * from './dispatcher';

// Error types
export * from './error';

// Endpoint types
export * from './endpoint';

// Re-export plugin types from @nerax-ai/plugin
export type {
  PluginStorage,
  PluginLogger,
  Extension,
  PluginContext,
  PluginModule,
  InlinePlugin,
} from '@nerax-ai/plugin';
```

## Key Types

### Provider

```ts
interface Provider {
  id: string;
  type: string;
  apiKey?: string;
  baseUrl?: string;
  // ...
}
```

### GroupConfig

```ts
interface GroupConfig {
  id: string;
  provider: string;
  model: string;
  // ...
}
```

### Dispatcher

```ts
interface Dispatcher {
  name: string;
  dispatch(request: any): Promise<any>;
}
```
