# Server API

## Configuration Management

### GET /api/config
Get full configuration

### GET /api/providers
List all providers

### POST /api/providers
Add a provider
```json
{ "id": "openai", "use": "ai-sdk", "options": {...} }
```

### PUT /api/providers/:id
Update a provider

### DELETE /api/providers/:id
Remove a provider

### GET /api/groups
List all groups

### POST /api/groups
Add a group
```json
{ "id": "default", "members": [{"provider": "openai", "model": "gpt-4"}] }
```

### PUT /api/groups/:id
Update a group

### DELETE /api/groups/:id
Remove a group

### GET /api/endpoints
List all endpoints

### POST /api/endpoints
Add an endpoint
```json
{ "use": "openai-compatible", "basePath": "/v1" }
```

### DELETE /api/endpoints/:use
Remove an endpoint

### GET /api/registry/providers
List available provider plugins

### GET /api/registry/endpoints
List available endpoint plugins

### GET /api/models
List all available models
