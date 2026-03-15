# 配置管理功能实现总结

## 实现的功能

### 1. Server API（运行时配置同步）

所有配置修改会同时：
- ✅ 保存到配置文件
- ✅ 更新运行时 Synax 实例

**Provider API**
- `POST /api/providers` - 添加 provider，立即生效
- `PUT /api/providers/:id` - 更新 provider，立即生效
- `DELETE /api/providers/:id` - 删除 provider（需重启）

**Group API**
- `POST /api/groups` - 添加 group，立即生效
- `PUT /api/groups/:id` - 更新 group，立即生效
- `DELETE /api/groups/:id` - 删除 group（需重启）

**Endpoint API**
- `POST /api/endpoints` - 添加 endpoint（需重启）
- `DELETE /api/endpoints/:use` - 删除 endpoint（需重启）

注：Endpoint 的动态挂载需要重启服务器

### 2. CLI 命令

所有命令都会修改配置文件：
- `synax provider add/remove` - 管理 providers
- `synax group add/remove` - 管理 groups
- `synax endpoint add/remove` - 管理 endpoints

### 3. 配置存储

`FileConfigStore` 实现：
- 读写 JSON 配置文件
- 支持所有 CRUD 操作
- 自动创建目录

## 使用示例

### 通过 API 添加 Provider
```bash
curl -X POST http://localhost:3000/api/providers \
  -H "Content-Type: application/json" \
  -d '{"id":"openai","use":"ai-sdk","options":{"apiKey":"sk-xxx"}}'
```

### 通过 CLI 添加 Provider
```bash
synax provider add
# 交互式输入 id, use, proxy 等
```

## 配置文件位置

`~/.config/synax/synax.json`
