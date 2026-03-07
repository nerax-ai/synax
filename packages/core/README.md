# @synax-ai/core

Core engine for Synax AI - unified multi-modal AI client with plugin support.

## Install

```bash
npm install @synax-ai/core
```

## Quick Start

```ts
import { Synax } from '@synax-ai/core';

const synax = new Synax({
  appName: 'my-app',
  providers: [
    { id: 'openai', type: 'openai', apiKey: process.env.OPENAI_API_KEY }
  ],
  groups: [
    { id: 'default', provider: 'openai', model: 'gpt-4' }
  ]
});

// Language client
const response = await synax.language.chat({
  messages: [{ role: 'user', content: 'Hello!' }]
});

// Embedding client
const embedding = await synax.embedding.create({
  input: 'Hello world'
});

// Image client
const image = await synax.image.generate({
  prompt: 'A beautiful sunset'
});

// Speech client
const audio = await synax.speech.create({
  input: 'Hello world'
});

// Video client
const video = await synax.video.generate({
  prompt: 'A cat playing piano'
});
```

## Clients

| Client | Description |
|--------|-------------|
| `synax.language` | Chat/completions API |
| `synax.embedding` | Text embeddings |
| `synax.image` | Image generation |
| `synax.speech` | Text-to-speech / Speech-to-text |
| `synax.video` | Video generation |

## Provider Management

### addProvider(config)

Add a provider (direct or plugin mode):

```ts
// Direct configuration
await synax.addProvider({
  id: 'openai',
  type: 'openai',
  apiKey: '...'
});

// Plugin mode
await synax.addProvider({
  id: 'anthropic',
  use: 'anthropic-provider',  // plugin ID
  options: { apiKey: '...' }
});
```

### getProvider(id)

Get a provider by ID:

```ts
const provider = synax.getProvider('openai');
```

### listProviders()

List all registered providers:

```ts
const providers = synax.listProviders();
```

## Group Management

### addGroup(config)

Add a model group:

```ts
synax.addGroup({
  id: 'fast',
  provider: 'openai',
  model: 'gpt-3.5-turbo'
});
```

### getGroup(id)

Get a group by ID:

```ts
const group = synax.getGroup('fast');
```

### listGroups()

List all groups:

```ts
const groups = synax.listGroups();
```

## Dispatcher Management

### addDispatcher(config)

Add a dispatcher (direct or plugin mode):

```ts
// Direct configuration
import { DefaultDispatcher } from '@synax-ai/core';

synax.addDispatcher(new DefaultDispatcher());

// Plugin mode
await synax.addDispatcher({
  name: 'retry-dispatcher',
  use: 'retry-dispatcher',
  options: { maxRetries: 3 }
});
```

### getDispatcher(name)

Get a dispatcher by name:

```ts
const dispatcher = synax.getDispatcher('default');
```

## Model Listing

### listModels()

List all available models across providers:

```ts
const models = synax.listModels();
// Returns: [{ provider: 'openai', model: 'gpt-4', type: 'language' }, ...]
```

## Configuration

### SynaxConfig

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `appName` | `string` | No | Application name for logging |
| `logger` | `Logger` | No | Custom logger instance |
| `providers` | `Provider[]` | Yes | AI provider configurations |
| `groups` | `GroupConfig[]` | Yes | Model group configurations |
| `metrics` | `Metrics` | No | Metrics collector |
| `dispatchers` | `Dispatcher[]` | No | Custom dispatchers |

## Exports

```ts
export { Synax } from './synax';
export type { SynaxConfig, ExtendedDispatcherConfig } from './synax';
export { DispatcherRunner } from './dispatcher-runner';
export { DefaultDispatcher } from './default-dispatcher';
export { resolveModel } from './model-resolver';
export type { ResolvedGroup } from './model-resolver';
export { LanguageClient } from './clients/language-client';
export { EmbeddingClient } from './clients/embedding-client';
export { ImageClient } from './clients/image-client';
export { SpeechClient } from './clients/speech-client';
export { VideoClient } from './clients/video-client';
```

## Related

- [@synax-ai/sdk](https://www.npmjs.com/package/@synax-ai/sdk) - TypeScript types and SDK
- [@synax-ai/server](https://www.npmjs.com/package/@synax-ai/server) - HTTP server
- [@synax-ai/cli](https://www.npmjs.com/package/@synax-ai/cli) - Command-line interface
