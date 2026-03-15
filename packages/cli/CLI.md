# Synax CLI

## Commands

### Start Server
```bash
synax start [-p <port>]
```

### Provider Management
```bash
# List providers
synax provider list

# Add provider (interactive)
synax provider add

# Remove provider
synax provider remove <id>
```

### Group Management
```bash
# List groups
synax group list

# Add group (interactive)
synax group add

# Remove group
synax group remove <id>
```

### Endpoint Management
```bash
# List endpoints
synax endpoint list

# Add endpoint (interactive)
synax endpoint add

# Remove endpoint
synax endpoint remove <use>
```

## Configuration

Config file: `~/.config/synax/synax.json`

```json
{
  "appName": "synax",
  "plugins": [],
  "providers": [
    { "id": "openai", "use": "ai-sdk", "options": {...} }
  ],
  "groups": [
    { "id": "default", "members": [...] }
  ],
  "endpoints": [
    { "use": "openai-compatible", "basePath": "/v1" }
  ]
}
```
