# @synax-ai/cli

Command-line interface for Synax AI - starts an HTTP server for multi-modal AI operations.

## Install

```bash
npm install -g @synax-ai/cli
```

## Usage

```bash
synax
```

The server starts on port 3000 by default.

## Configuration

The CLI reads configuration from `~/.config/synax/synax.json`:

```json
{
  "appName": "my-app",
  "plugins": [
    "my-npm-plugin",
    "file:/path/to/local-plugin"
  ],
  "providers": [
    { "id": "openai", "use": "openai-provider", "options": { "apiKey": "..." } }
  ],
  "groups": [
    { "id": "default", "provider": "openai", "model": "gpt-4" }
  ],
  "endpoints": [
    { "use": "openai-compatible", "basePath": "/v1" }
  ],
  "api": [
    { "use": "models-api" }
  ]
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |

## Example

```bash
# Set custom port
PORT=8080 synax

# Output:
# Synax server running on http://localhost:8080
# Config: ~/.config/synax/synax.json
```

## Endpoints

The server provides:

- `/health` - Health check endpoint
- Custom endpoints from configured plugins (e.g., `/v1/chat/completions`)

## Related

- [@synax-ai/core](https://www.npmjs.com/package/@synax-ai/core) - Core engine
- [@synax-ai/server](https://www.npmjs.com/package/@synax-ai/server) - Server implementation
- [@synax-ai/sdk](https://www.npmjs.com/package/@synax-ai/sdk) - TypeScript SDK
