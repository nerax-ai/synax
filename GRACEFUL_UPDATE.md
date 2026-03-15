# 优雅配置更新实现

## 核心设计

配置更新逻辑已移至 **Synax Core**，确保所有使用 Synax 的应用都能受益。

## 实现原理

### 1. 请求跟踪
```typescript
// Synax core 中
private activeRequests = 0;
private pendingUpdates: (() => void)[] = [];

acquire() { this.activeRequests++; }
release() {
  this.activeRequests--;
  if (this.activeRequests === 0 && this.pendingUpdates.length > 0) {
    this.pendingUpdates.forEach(fn => fn());
    this.pendingUpdates = [];
  }
}
```

### 2. 优雅更新
```typescript
private scheduleUpdate(fn: () => void) {
  if (this.activeRequests === 0) {
    fn(); // 无活跃请求，立即执行
  } else {
    this.pendingUpdates.push(fn); // 有活跃请求，等待完成
  }
}
```

### 3. Provider/Group 更新
- `addProvider()` - 使用 scheduleUpdate，等待请求完成后更新
- `addGroup()` - 使用 scheduleUpdate，等待请求完成后更新

## Server 使用方式

```typescript
// 中间件跟踪请求
app.use('*', async (c, next) => {
  synax.acquire();
  try {
    await next();
  } finally {
    synax.release();
  }
});

// API 直接调用 Synax 方法
await synax.addProvider(config); // 自动优雅更新
synax.addGroup(config); // 自动优雅更新
```

## 优势

1. **核心实现** - 任何使用 Synax 的应用都能自动获得优雅更新能力
2. **简单易用** - 只需调用 acquire/release 跟踪请求
3. **零影响** - 旧请求使用旧配置，新请求使用新配置
4. **自动切换** - 请求完成后自动应用待更新配置

## 使用示例

```typescript
// 任何使用 Synax 的应用
const synax = new Synax({...});

// 跟踪请求
synax.acquire();
try {
  // 处理请求
} finally {
  synax.release();
}

// 更新配置（自动优雅更新）
await synax.addProvider({...});
synax.addGroup({...});
```
