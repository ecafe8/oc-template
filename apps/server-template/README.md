# Server Template


## Description
This is a template for creating a server application using Bun. It provides a basic structure and setup to get you started quickly.

## Getting Started
```
bun install
bun run dev
```

## RPC Types
生成 RPC 类型导出：

```bash
bun run gen:rpc-type
```

说明：
- 该脚本会生成 `exports/rpc.ts` 供 web 侧 RPC 代码生成使用。
- 不再生成 `exports/types.ts`。
- 共享业务类型请从 `src/modules/*/types` 维护，并由消费方使用 `import type` 直接导入。

## Accessing the Server
Once the server is running, you can access it by navigating to the following URL in your web browser:
```
open http://localhost:3100
```
