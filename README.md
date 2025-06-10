# Unieo

A powerful router core library for edge computing environments.

## Features

- 🚀 High-performance routing for edge environments
- 🛠️ Extensible executor system
- 🔧 Middleware support
- 📦 TypeScript support
- ⚡ Built for modern edge runtimes

## Installation

```bash
npm install unieo --save
```

## Quick Start

### Basic Usage

```typescript
import { Route } from 'unieo';

addEventListener('fetch', (event: FetchEvent) => {
  // 创建 Route 实例
  const route = new Route({ event });
  
  // 收集路由
  const routes = [];
  
  // 执行路由
  const response = route.execute(routes);
  
  // 响应
  event.respondWith(response);
});
```

### Extending Executors

```typescript
// 拓展 executor 示例
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](.github/CONTRIBUTING.md) for details on how to get started.

## License

MIT License - see the [LICENSE](LICENSE) file for details.
