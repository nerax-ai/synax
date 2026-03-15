# 插件 Schema 支持

## 定义

插件现在可以在注册时提供 schema：

```typescript
import type { Endpoint, EndpointContext, PluginRegisterContext, Schema } from '@synax-ai/sdk';

const schema: Schema = {
  fields: [
    {
      name: 'apiKey',
      type: 'string',
      description: 'API Key',
      required: true
    },
    {
      name: 'baseURL',
      type: 'string',
      description: 'Base URL',
      default: 'https://api.example.com'
    },
    {
      name: 'timeout',
      type: 'number',
      description: 'Timeout (ms)',
      default: 30000
    },
    {
      name: 'debug',
      type: 'boolean',
      description: 'Enable debug',
      default: false
    }
  ]
};

export function setup(ctx: PluginRegisterContext) {
  ctx.register('provider', 'my-provider', (options) => {
    return {
      id: options.id as string,
      name: 'My Provider',
      // ... 实现
    };
  }, schema);
}
```

## CLI 使用

CLI 会自动读取 schema 并生成交互式表单：

```bash
synax provider add
# 1. Provider ID: my-id
# 2. Provider plugin: my-provider
# 3. Proxy URL (optional):
# 4. API Key: sk-xxx (来自 schema)
# 5. Base URL: https://api.example.com (来自 schema)
# 6. Timeout (ms): 30000 (来自 schema)
# 7. Enable debug: No (来自 schema)
```

## 类型定义

```typescript
interface SchemaField {
  name: string;
  type?: 'string' | 'number' | 'boolean';
  description?: string;
  required?: boolean;
  default?: unknown;
}

interface Schema {
  fields?: SchemaField[];
}
```
