<div align="center">
<h1>🍥 Unieo</h1>
💪🏻 A powerful routing rule engine for edge computing environments.
</div>
<br>
Unieo `[/juːniˈoʊ/]` provides a flexible and extensible routing system designed specifically for edge runtimes. It is built with **WinterTC (Web-interoperable Server Runtimes Technical Committee) standards compliance**, ensuring seamless operation on any WinterTC-compliant web runtime, including Cloudflare Workers, Vercel Edge Functions, Aliyun EdgeRoutine, and other modern edge platforms. 

## ✨ Features

- 🌐 **WinterTC Standards Compliance** - Compatible with Web-interoperable Server Runtimes Technical Committee standards, ensuring cross-platform compatibility
- 🚀 **High-performance routing** - Optimized for edge environments with minimal overhead
- 📦 **Universal runtime support** - Runs on any WinterTC-compliant runtime including Cloudflare Workers, Vercel Edge, Aliyun EdgeRoutine, Node.js and more
- 🛠️ **Extensible executor system** - Pluggable processor architecture for custom routing logic
- 🔧 **Middleware support** - Comprehensive middleware system for request/response transformation
- 🎯 **Advanced matching** - Flexible matching system with multiple operators and conditions
- 🔄 **Request/Response rewriting** - Powerful URL, header, and content transformation capabilities
- 🚦 **Conditional routing** - Route based on headers, cookies, device types, and more

## 📥 Installation

```bash
npm install unieo --save
```

## 🏃‍♂️ Quick Start

> 🚧 **Simplifying in Progress** - The current route configuration schema is relatively complex. We are developing a more concise and intuitive routing API. Stay tuned! You'll be able to achieve the same functionality with much less code in the future.

### 💡 Basic Usage

```typescript
import { Route } from 'unieo';

addEventListener('fetch', (event: FetchEvent) => {
  // Create Route instance
  const route = new Route({ event });
  
  // Define routes configuration
  const routes = [
    {
      name: 'api-routes',
      type: 'api',
      processor: 'COMMON_GROUP_PROCESSOR',
      routes: [
        {
          name: 'health-check',
          type: 'health',
          processor: 'COMMON_SUB_PROCESSOR',
          meta: {
            match: {
              list: [
                {
                  origin: { source: 'path', sourceType: 'url' },
                  criteria: { source: '/health', sourceType: 'literal' },
                  operator: 'equal'
                }
              ]
            },
            responseRewrites: [
              {
                type: 'header',
                field: 'content-type',
                value: { source: 'application/json', sourceType: 'literal' },
                operation: 'set'
              }
            ]
          }
        }
      ]
    }
  ];
  
  // Execute routes
  const response = route.execute(routes);
  
  // Respond
  event.respondWith(response);
});
```

## 🎨 Use Cases

### 🌐 1. API Gateway

Perfect for building API gateways that need request routing, authentication, and response transformation:

```typescript
const apiGatewayRoutes = [
  {
    name: 'auth-group',
    type: 'authentication',
    processor: 'COMMON_GROUP_PROCESSOR',
    routes: [
      {
        name: 'require-auth',
        type: 'auth-check',
        processor: 'COMMON_SUB_PROCESSOR',
        meta: {
          match: {
            list: [
              {
                origin: { source: 'path', sourceType: 'url' },
                criteria: { source: '^/api/private', sourceType: 'literal' },
                operator: 'regexp'
              }
            ]
          },
          requestRewrites: [
            {
              type: 'header',
              field: 'x-auth-required',
              value: { source: 'true', sourceType: 'literal' },
              operation: 'set'
            }
          ]
        }
      }
    ]
  }
];
```

### 🚀 2. CDN Edge Logic

Implement sophisticated CDN logic with cache control and content optimization:

```typescript
const cdnRoutes = [
  {
    name: 'static-assets',
    type: 'cdn',
    processor: 'COMMON_GROUP_PROCESSOR',
    routes: [
      {
        name: 'image-optimization',
        type: 'image',
        processor: 'COMMON_SUB_PROCESSOR',
        meta: {
          match: {
            list: [
              {
                origin: { source: 'path', sourceType: 'url' },
                criteria: { source: '\\.(jpg|jpeg|png|webp)$', sourceType: 'literal' },
                operator: 'regexp'
              }
            ]
          },
          requestRewrites: [
            {
              type: 'middleware',
              value: {
                source: [
                  ['ImageOptimization', { quality: 80, format: 'webp' }],
                  ['DefaultFetch', {}]
                ],
                sourceType: 'literal'
              },
              operation: 'set'
            }
          ]
        }
      }
    ]
  }
];
```

### 🧪 3. A/B Testing and Feature Flags

Implement dynamic A/B testing based on user characteristics:

```typescript
const abTestingRoutes = [
  {
    name: 'feature-toggle',
    type: 'ab-test',
    processor: 'COMMON_GROUP_PROCESSOR',
    routes: [
      {
        name: 'new-ui-test',
        type: 'ui-variant',
        processor: 'COMMON_SUB_PROCESSOR',
        meta: {
          match: {
            list: [
              {
                origin: { source: 'x-user-segment', sourceType: 'request_header' },
                criteria: { source: 'beta', sourceType: 'literal' },
                operator: 'equal'
              },
              {
                origin: { source: 'path', sourceType: 'url' },
                criteria: { source: '/app', sourceType: 'literal' },
                operator: 'prefix'
              }
            ],
            operator: 'and'
          },
          requestRewrites: [
            {
              type: 'url',
              value: { source: '/app-beta', sourceType: 'literal' },
              operation: 'set'
            }
          ]
        }
      }
    ]
  }
];
```

### 📱 4. Device-Based Routing

Route requests based on device characteristics for optimal user experience:

```typescript
const deviceRoutes = [
  {
    name: 'device-routing',
    type: 'responsive',
    processor: 'COMMON_GROUP_PROCESSOR',
    routes: [
      {
        name: 'mobile-optimization',
        type: 'mobile',
        processor: 'COMMON_SUB_PROCESSOR',
        meta: {
          match: {
            list: [
              {
                origin: { source: 'type', sourceType: 'device' },
                criteria: { source: 'mobile', sourceType: 'literal' },
                operator: 'equal'
              }
            ]
          },
          requestRewrites: [
            {
              type: 'header',
              field: 'x-mobile-optimized',
              value: { source: 'true', sourceType: 'literal' },
              operation: 'set'
            }
          ]
        }
      }
    ]
  }
];
```

### 🌍 5. Geographical Content Delivery

Serve localized content based on user location:

```typescript
const geoRoutes = [
  {
    name: 'geo-routing',
    type: 'localization',
    processor: 'COMMON_GROUP_PROCESSOR',
    routes: [
      {
        name: 'eu-compliance',
        type: 'gdpr',
        processor: 'COMMON_SUB_PROCESSOR',
        meta: {
          match: {
            list: [
              {
                origin: { source: 'country', sourceType: 'edge_info' },
                criteria: { source: 'EU', sourceType: 'literal' },
                operator: 'in'
              }
            ]
          },
          responseRewrites: [
            {
              type: 'header',
              field: 'x-privacy-policy',
              value: { source: 'gdpr-compliant', sourceType: 'literal' },
              operation: 'set'
            }
          ]
        }
      }
    ]
  }
];
```

## ⚙️ Advanced Configuration

### 🔗 Middleware Integration

Unieo supports a comprehensive middleware system with custom middleware registration:

#### 📝 Creating Custom Middleware

First, create your custom middleware following the `MiddlewareGen` pattern:

```typescript
import type { MiddlewareGen, BaseMiddlewareOption, RouteContext, MiddlewareNext } from 'unieo';

// Define your middleware options interface
interface AuthMiddlewareOption extends BaseMiddlewareOption {
  secret: string;
  headerName?: string;
}

// Create the middleware generator
const AuthMiddleware: MiddlewareGen<AuthMiddlewareOption> = (opt) => {
  return async (ctx: RouteContext, next: MiddlewareNext) => {
    const { secret, headerName = 'authorization' } = opt;
    
    // Get auth header from request
    const authHeader = ctx.request.headers.get(headerName);
    
    if (!authHeader || !authHeader.includes(secret)) {
      // Set unauthorized response
      const response = new Response('Unauthorized', {
        status: 401,
        headers: { 'content-type': 'text/plain' }
      });
      ctx.setResponse(response);
      return; // Don't call next() to short-circuit the middleware chain
    }
    
    // Add custom header to indicate auth success
    ctx.request = new Request(ctx.request, {
      headers: {
        ...Object.fromEntries(ctx.request.headers),
        'x-auth-verified': 'true'
      }
    });
    
    await next(); // Continue to next middleware
  };
};

// Rate limiting middleware example
interface RateLimitMiddlewareOption extends BaseMiddlewareOption {
  limit: number;
  window: number; // in milliseconds
}

const RateLimitMiddleware: MiddlewareGen<RateLimitMiddlewareOption> = (opt) => {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();
  
  return async (ctx: RouteContext, next: MiddlewareNext) => {
    const { limit, window } = opt;
    const clientIP = ctx.request.headers.get('cf-connecting-ip') || 'unknown';
    const now = Date.now();
    
    // Get or initialize request count for this IP
    let clientData = requestCounts.get(clientIP);
    if (!clientData || now > clientData.resetTime) {
      clientData = { count: 0, resetTime: now + window };
      requestCounts.set(clientIP, clientData);
    }
    
    clientData.count++;
    
    if (clientData.count > limit) {
      const response = new Response('Rate limit exceeded', {
        status: 429,
        headers: {
          'content-type': 'text/plain',
          'retry-after': Math.ceil((clientData.resetTime - now) / 1000).toString()
        }
      });
      ctx.setResponse(response);
      return;
    }
    
    await next();
  };
};
```

#### 🔧 Registering Custom Middleware

Register your custom middleware when creating the Route instance:

```typescript
import { Route } from 'unieo';

const route = new Route({
  event,
  logger: console, // Custom logger
  httpClient: {    // Custom HTTP client
    request: async (request, options) => {
      // Custom fetch logic
      return fetch(request, options);
    }
  },
  // Register custom middleware
  middlewares: [
    ['Auth', AuthMiddleware],
    ['RateLimit', RateLimitMiddleware],
    // Add more custom middleware here
  ]
});
```

#### 📋 Using Custom Middleware in Routes

Now you can use your custom middleware in route configurations:

```typescript
// Routes with custom middleware configuration
const routesWithMiddleware = [
  {
    name: 'api-with-middleware',
    type: 'api',
    processor: 'COMMON_GROUP_PROCESSOR',
    routes: [
      {
        name: 'protected-endpoint',
        type: 'protected',
        processor: 'COMMON_SUB_PROCESSOR',
        meta: {
          requestRewrites: [
            {
              type: 'middleware',
              value: {
                source: [
                  ['Auth', { secret: 'your-secret-key', headerName: 'x-api-key' }],
                  ['RateLimit', { limit: 100, window: 60000 }], // 100 requests per minute
                  ['DefaultFetch', {}] // Always include DefaultFetch as the last middleware
                ],
                sourceType: 'literal'
              },
              operation: 'set'
            }
          ]
        }
      }
    ]
  }
];
```

### 🧠 Complex Matching Logic

Create sophisticated matching conditions:

```typescript
const complexRoutes = [
  {
    name: 'complex-matching',
    type: 'advanced',
    processor: 'COMMON_GROUP_PROCESSOR',
    routes: [
      {
        name: 'multi-condition-route',
        type: 'conditional',
        processor: 'COMMON_SUB_PROCESSOR',
        meta: {
          match: {
            list: [
              {
                // Match specific user agent
                origin: { source: 'user-agent', sourceType: 'request_header' },
                criteria: { source: 'bot|crawler', sourceType: 'literal' },
                operator: 'regexp'
              },
              {
                // Match specific time range
                origin: { source: 'hour', sourceType: 'edge_info' },
                criteria: { source: '9', sourceType: 'literal' },
                operator: 'gte'
              },
              {
                // Match specific path
                origin: { source: 'path', sourceType: 'url' },
                criteria: { source: '/api/', sourceType: 'literal' },
                operator: 'prefix'
              }
            ],
            operator: 'and' // All conditions must match
          }
        }
      }
    ]
  }
];
```

## 📖 Route Configuration Reference

### 📂 GroupRouteConfig

```typescript
interface GroupRouteConfig {
  name: string;                    // Unique identifier for the route group
  type: string;                    // Route type for categorization
  processor: GroupProcessorType;   // Processor type to handle the group
  routes: SubRouteConfig[];        // Array of sub-routes
  status?: RouteStatus;            // ONLINE | OFFLINE
  meta?: object;                   // Additional metadata
  args?: Record<string, unknown>;  // Processor arguments
}
```

### 📄 SubRouteConfig

```typescript
interface SubRouteConfig {
  name: string;                  // Unique identifier for the sub-route
  type: string;                  // Route type for categorization
  processor: SubProcessorType;   // Processor type to handle the route
  status?: RouteStatus;          // ONLINE | OFFLINE
  meta?: {
    match?: MatchConfig;         // Matching conditions
    redirects?: RedirectConfig[];     // Redirect rules
    requestRewrites?: RequestRewriteConfig[];   // Request modifications
    responseRewrites?: ResponseRewriteConfig[]; // Response modifications
  };
  args?: Record<string, unknown>; // Processor arguments
}
```

## 🧩 Extending Unieo

**Note: The extension system is currently under development. 🚧 The following represents the planned architecture.**

### 🔧 Custom Processors

```typescript
// Custom Group Processor (planned)
class CustomGroupProcessor extends BaseGroupProcessor {
  static processorType = 'CUSTOM_GROUP_PROCESSOR';
  
  async checkMatch(): Promise<boolean> {
    // Custom matching logic
    return true;
  }
}

// Custom Sub Processor (planned)
class CustomSubProcessor extends BaseSubProcessor {
  static processorType = 'CUSTOM_SUB_PROCESSOR';
  
  async beforeRequest(): Promise<void> {
    // Custom request processing
  }
  
  async beforeResponse(): Promise<void> {
    // Custom response processing
  }
}
```

### 🏗️ Custom Route Class

```typescript
// Extended Route class (planned)
class CustomRoute extends Route {
  constructor(data: RouteRawData) {
    super(data);
    // Register custom processors
    this.registerCustomProcessors();
  }
  
  private registerCustomProcessors() {
    // Registration logic (under development)
  }
}
```

## 🤝 Contributing

We welcome contributions! 🎉 Please see our [Contributing Guide](.github/CONTRIBUTING.md) for details on how to get started.

## 📜 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- 🌐 [WinterTC](https://wintertc.org/) - Web-interoperable Server Runtimes Technical Committee standards
- 🌍 [Cloudflare Workers](https://workers.cloudflare.com/) - Deploy serverless code instantly across the globe
- ⚡ [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions) - Edge-side server functions
- 🗺️ [Aliyun EdgeRoutine](https://help.aliyun.com/zh/edge-security-acceleration/dcdn/user-guide/what-is-er) - Write JavaScript code and deploy and execute it on Alibaba Cloud points of presence (POPs) worldwide
- 🛣️ [path-to-regexp](https://github.com/pillarjs/path-to-regexp) - Express-style path matching
