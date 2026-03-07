# @synax-ai/server

HTTP server for Synax AI, built on Hono. Provides a flexible plugin system for custom endpoints and APIs.

## Install

```bash
npm install @synax-ai/server
```

## Usage

```ts
import { createServer } from '@synax-ai/server';

const { app, synax } = await createServer({
  config: {
    appName: 'my-app',
    plugins: [
      'file:/path/to/plugin',
      'my-npm-plugin'
    ],
    providers: [
      { id: 'openai', use: 'openai-provider', options: { apiKey: '...' } }
    ],
    groups: [
      { id: 'default', provider: 'openai', model: 'gpt-4' }
    ],
    endpoints: [
      { use: 'openai-compatible', basePath: '/v1' }
    ],
    api: [
      { use: 'models-api' }
    ]
  }
});

// Start server
Bun.serve({ port: 3000, fetch: app.fetch });
```

## Configuration

### ServerConfig

| Option | Type | Description |
|--------|------|-------------|
| `appName` | `string` | Application name for storage/logging |
| `plugins` | `string[]` | Plugin sources to load (file paths, npm packages) |
| `providers` | `ProviderConfig[]` | AI provider configurations |
| `groups` | `GroupConfig[]` | Model group configurations |
| `endpoints` | `EndpointConfig[]` | Endpoint plugin configurations |
| `api` | `EndpointConfig[]` | API plugin configurations |

### EndpointConfig

| Option | Type | Description |
|--------|------|-------------|
| `use` | `string` | Plugin ID (e.g., `'openai-compatible'`) |
| `basePath` | `string` | Custom base path (optional) |
| `options` | `Record<string, unknown>` | Plugin-specific options |

## Plugins

Plugins extend Synax with providers, dispatchers, endpoints, and APIs. Load them via the `plugins` config:

```ts
{
  plugins: [
    'my-npm-plugin',           // npm package
    'file:/path/to/plugin',    // local directory
    'github:user/repo'         // GitHub repository
  ]
}
```

### Plugin Types

| Type | Description | Registration |
|------|-------------|--------------|
| `provider` | AI provider implementation | Used via `providers[].use` |
| `dispatcher` | Request routing logic | Used via `dispatchers[].use` |
| `endpoint` | Full-featured HTTP endpoints | Configured in `endpoints[]` |
| `api` | Lightweight API endpoints | Configured in `api[]` |

## Endpoints vs API

- **Endpoints**: Full access to all clients (language, embedding, image, speech, video) and model list. Ideal for API proxies, OpenAI-compatible endpoints.
- **API**: Access to model list only. Ideal for metadata endpoints like `/models`.

## Built-in Endpoints

### Health Check

```bash
curl http://localhost:3000/health
# {"status":"ok","version":"0.0.1"}
```

## Example: OpenAI-Compatible Server

```ts
import { createServer } from '@synax-ai/server';

const { app } = await createServer({
  config: {
    plugins: ['openai-provider', 'openai-compatible-endpoint'],
    providers: [
      { id: 'openai', use: 'openai-provider', options: { apiKey: process.env.OPENAI_API_KEY } }
    ],
    groups: [
      { id: 'default', provider: 'openai', model: 'gpt-4' }
    ],
    endpoints: [
      { use: 'openai-compatible', basePath: '/v1' }
    ]
  }
});

Bun.serve({ port: 3000, fetch: app.fetch });

// Now you can call:
// POST http://localhost:3000/v1/chat/completions
```

## Accessing Synax Instance

The `createServer` function returns both `app` (Hono instance) and `synax` (Synax instance):

```ts
const { app, synax } = await createServer({ config: {...} });

// Use synax for direct client access
const models = synax.listModels();
const response = await synax.language.chat({...});
```

## Exports

```ts
export { createServer } from './server';
export type { ServerConfig, ServerOptions } from './server';
```

## Related

- [@synax-ai/core](https://www.npmjs.com/package/@synax-ai/core) - Core engine
- [@synax-ai/sdk](https://www.npmjs.com/package/@synax-ai/sdk) - TypeScript SDK
- [@synax-ai/cli](https://www.npmjs.com/package/@synax-ai/cli) - Command-line interface
