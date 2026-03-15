# Synax 自动请求跟踪和优雅更新

## 使用方式

### 基本使用（无需手动跟踪）

```typescript
import { Synax } from '@synax-ai/core';

// 创建实例
const synax = new Synax({
  providers: [],
  groups: []
});

// 添加配置
await synax.addProvider({
  id: 'openai',
  use: 'ai-sdk',
  options: { apiKey: 'sk-xxx' }
});

synax.addGroup({
  id: 'default',
  members: [{ provider: 'openai', model: 'gpt-4' }]
});

// 直接使用，自动跟踪请求
const response = await synax.language.generate({
  model: 'default',
  messages: [{ role: 'user', content: 'Hello' }]
});

// 运行时更新配置（自动优雅更新）
await synax.addProvider({
  id: 'anthropic',
  use: 'ai-sdk',
  options: { apiKey: 'sk-ant-xxx' }
});
```

## 工作原理

### 1. 自动请求跟踪
- `DispatcherRunner` 在每次 dispatch 时自动调用 `acquire()`
- 请求完成后自动调用 `release()`
- **用户无需手动管理**

### 2. 优雅更新
- 配置更新时检查活跃请求数
- 有活跃请求：加入待更新队列
- 无活跃请求：立即更新
- 请求完成时自动应用待更新配置

### 3. 零影响
- 旧请求使用旧配置（内存中的 Map）
- 新请求使用新配置
- 自动切换，无需重启

## 实现细节

```typescript
// DispatcherRunner 自动跟踪
async dispatch(modelId, capability, execute) {
  this.deps.onAcquire?.();  // 自动 acquire
  try {
    return await dispatcher.dispatch(...);
  } finally {
    this.deps.onRelease?.();  // 自动 release
  }
}

// Synax 管理请求计数
acquire() { this.activeRequests++; }
release() {
  this.activeRequests--;
  if (this.activeRequests === 0) {
    // 执行所有待更新
    this.pendingUpdates.forEach(fn => fn());
  }
}
```

## 优势

✅ **零配置** - 无需手动 acquire/release
✅ **自动管理** - 内部自动跟踪所有请求
✅ **优雅更新** - 不影响正在处理的请求
✅ **简单易用** - 只需调用 addProvider/addGroup
