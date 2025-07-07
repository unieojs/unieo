# 🏗️ Unieo 系统架构图

## 整体架构概览

```mermaid
graph TB
    %% Entry Layer
    subgraph "🚪 Entry Layer"
        Route[Route Class]
    end

    %% Context Layer  
    subgraph "🌐 Context Layer"
        RouteContext[RouteContext]
        ERPerformance[ERPerformance]
        MiddlewareManager[MiddlewareManager]
        RouteHelper[RouteHelper]
    end

    %% Factory Layer
    subgraph "🏭 Factory Layer" 
        ProcessorFactory[ProcessorFactory]
        ExecutorFactory[ExecutorFactory] 
        MetaFactory[MetaFactory]
    end

    %% Processor Layer
    subgraph "⚙️ Processor Layer"
        RouteProcessor[RouteProcessor]
        GroupProcessor[GroupProcessor]
        SubProcessor[SubProcessor]
        BaseProcessor[BaseProcessor]
    end

    %% Executor Layer
    subgraph "🔧 Executor Layer"
        CommonRouteExecutor[CommonRouteExecutor]
        RouteExecutor[RouteExecutor]
        RedirectExecutor[RedirectExecutor]
        RequestRewriteExecutor[RequestRewriteExecutor]
        ResponseRewriteExecutor[ResponseRewriteExecutor]
        BaseExecutor[BaseExecutor]
    end

    %% Meta Layer
    subgraph "📋 Meta Layer"
        BaseMeta[BaseMeta]
        RedirectMeta[RedirectMeta]
        RequestRewriteMeta[RequestRewriteMeta] 
        ResponseRewriteMeta[ResponseRewriteMeta]
    end

    %% Core Logic Layer
    subgraph "💡 Core Logic Layer"
        Match[Match System]
        Redirect[Redirect Logic]
        RequestRewrite[RequestRewrite Logic]
        ResponseRewrite[ResponseRewrite Logic]
    end

    %% Value System
    subgraph "💎 Value System"
        Value[Value Processing]
        SourceProcessor[SourceProcessor]
        ValueProcessor[ValueProcessor]
    end

    %% Middleware System
    subgraph "🔗 Middleware System"
        DefaultFetch[DefaultFetch]
        ErrorFallback[ErrorFallback]
        CustomMiddleware[Custom Middleware]
    end

    %% Data Flow
    Route --> RouteContext
    Route --> ProcessorFactory
    ProcessorFactory --> RouteProcessor
    RouteProcessor --> GroupProcessor
    GroupProcessor --> SubProcessor
    SubProcessor --> MetaFactory
    MetaFactory --> BaseMeta
    BaseMeta --> RedirectMeta
    BaseMeta --> RequestRewriteMeta
    BaseMeta --> ResponseRewriteMeta

    CommonRouteExecutor --> ExecutorFactory
    ExecutorFactory --> BaseExecutor
    BaseExecutor --> RedirectExecutor
    BaseExecutor --> RequestRewriteExecutor
    BaseExecutor --> ResponseRewriteExecutor

    RouteContext --> MiddlewareManager
    MiddlewareManager --> DefaultFetch
    MiddlewareManager --> ErrorFallback
    MiddlewareManager --> CustomMiddleware

    RedirectMeta --> Redirect
    RequestRewriteMeta --> RequestRewrite
    ResponseRewriteMeta --> ResponseRewrite

    Redirect --> Match
    RequestRewrite --> Match
    RequestRewrite --> Value
    ResponseRewrite --> Value

    Value --> SourceProcessor
    Value --> ValueProcessor

    %% Inheritance relationships
    BaseProcessor -.-> GroupProcessor
    BaseProcessor -.-> SubProcessor
    RouteExecutor -.-> CommonRouteExecutor
    BaseExecutor -.-> RedirectExecutor
    BaseExecutor -.-> RequestRewriteExecutor  
    BaseExecutor -.-> ResponseRewriteExecutor
```

## 执行流程图

```mermaid
sequenceDiagram
    participant User
    participant Route
    participant ProcessorFactory
    participant RouteProcessor
    participant CommonRouteExecutor
    participant ExecutorFactory
    participant GroupProcessor
    participant SubProcessor
    participant MetaFactory
    participant Meta
    participant MiddlewareManager

    User->>Route: execute(routes)
    Route->>ProcessorFactory: createRouteProcessor(ctx, routeConfig)
    ProcessorFactory->>RouteProcessor: new RouteProcessor(groupProcessors)
    Route->>CommonRouteExecutor: new CommonRouteExecutor(processor, ctx)
    
    CommonRouteExecutor->>CommonRouteExecutor: redirect()
    CommonRouteExecutor->>ExecutorFactory: create(REDIRECT, options)
    ExecutorFactory->>RedirectExecutor: new RedirectExecutor()
    RedirectExecutor->>GroupProcessor: checkMatch() & needProcess()
    GroupProcessor->>SubProcessor: process(REDIRECT)
    SubProcessor->>MetaFactory: create(redirects, data)
    MetaFactory->>Meta: new RedirectMeta()
    Meta-->>SubProcessor: process result
    
    alt no redirect response
        CommonRouteExecutor->>CommonRouteExecutor: requestRewrite()
        CommonRouteExecutor->>ExecutorFactory: create(REQUEST_REWRITE, options)
        ExecutorFactory->>RequestRewriteExecutor: new RequestRewriteExecutor()
        RequestRewriteExecutor->>SubProcessor: process(REQUEST_REWRITE)
        SubProcessor->>MetaFactory: create(requestRewrites, data)
        MetaFactory->>Meta: new RequestRewriteMeta()
        
        CommonRouteExecutor->>CommonRouteExecutor: request()
        CommonRouteExecutor->>MiddlewareManager: run(ctx)
        MiddlewareManager-->>CommonRouteExecutor: response
        
        CommonRouteExecutor->>CommonRouteExecutor: responseRewrite()
        CommonRouteExecutor->>ExecutorFactory: create(RESPONSE_REWRITE, options)
        ExecutorFactory->>ResponseRewriteExecutor: new ResponseRewriteExecutor()
        ResponseRewriteExecutor->>SubProcessor: process(RESPONSE_REWRITE)
        SubProcessor->>MetaFactory: create(responseRewrites, data)
        MetaFactory->>Meta: new ResponseRewriteMeta()
    end
    
    CommonRouteExecutor-->>Route: final response
    Route-->>User: response
```

## 关键设计模式

### 1. 工厂模式 (Factory Pattern)
- **ProcessorFactory**: 创建和管理 Processor 实例
- **ExecutorFactory**: 创建和管理 Executor 实例  
- **MetaFactory**: 创建和管理 Meta 实例

### 2. 策略模式 (Strategy Pattern)
- **Meta Strategy**: 不同的 Meta 类型(redirects, requestRewrites, responseRewrites)对应不同的处理策略
- **Executor Strategy**: 不同的 Executor 类型对应不同的执行策略

### 3. 责任链模式 (Chain of Responsibility)
- **Processor Chain**: RouteProcessor → GroupProcessor → SubProcessor
- **Executor Chain**: CommonRouteExecutor → SpecificExecutor → Meta → CoreLogic

### 4. 组合模式 (Composite Pattern)
- **Route Configuration**: GroupRoute 包含多个 SubRoute，形成树状结构
- **Match System**: 支持嵌套的匹配条件

## 核心特性

### 🔄 可扩展性
- 通过工厂模式支持动态注册新的 Processor、Executor、Meta 类型
- 支持自定义中间件注册
- 基于接口的设计支持用户扩展

### 🛡️ 类型安全
- 全面的 TypeScript 泛型支持
- 严格的类型检查和推导
- 编译时类型安全保证

### ⚡ 性能优化
- 工厂实例缓存机制
- 延迟初始化
- 内置性能监控 (ERPerformance)

### 🔧 模块化设计
- 清晰的职责分离
- 低耦合高内聚
- 支持独立测试和替换组件

## Meta 层架构详解

```mermaid
graph LR
    subgraph "Meta Configuration"
        RawMeta[Raw Meta Config] 
        RawRedirect[redirects: RawRedirect[]]
        RawRequestRewrite[requestRewrites: RawRequestRewrite[]]
        RawResponseRewrite[responseRewrites: RawResponseRewrite[]]
    end

    subgraph "Meta Factory System"
        MetaFactory[MetaFactory]
        MetaConstructor[MetaConstructor]
        MetaRegistry[Static Meta Registry]
    end

    subgraph "Meta Implementations"
        RedirectMeta[RedirectMeta]
        RequestRewriteMeta[RequestRewriteMeta]
        ResponseRewriteMeta[ResponseRewriteMeta]
    end

    subgraph "Core Logic"
        RedirectLogic[Redirect Logic]
        RequestRewriteLogic[RequestRewrite Logic] 
        ResponseRewriteLogic[ResponseRewrite Logic]
        MatchSystem[Match System]
        ValueSystem[Value System]
    end

    RawMeta --> MetaFactory
    MetaFactory --> MetaConstructor
    MetaConstructor --> RedirectMeta
    MetaConstructor --> RequestRewriteMeta
    MetaConstructor --> ResponseRewriteMeta

    RedirectMeta --> RedirectLogic
    RequestRewriteMeta --> RequestRewriteLogic
    ResponseRewriteMeta --> ResponseRewriteLogic

    RedirectLogic --> MatchSystem
    RequestRewriteLogic --> MatchSystem
    RequestRewriteLogic --> ValueSystem
    ResponseRewriteLogic --> ValueSystem
```

## 价值系统架构

```mermaid
graph TB
    subgraph "Value Configuration"
        ValueRawData[ValueRawData]
        Source[source: unknown]
        SourceType[sourceType: string]
        ValueType[valueType?: ValueType]
    end

    subgraph "Source Processing"
        SourceProcessorManager[SourceProcessorManager]
        LiteralSource[LiteralSourceProcessor]
        RequestHeaderSource[RequestHeaderSourceProcessor]
        ResponseHeaderSource[ResponseHeaderSourceProcessor]
        UrlSource[UrlSourceProcessor]
        CookieSource[CookieSourceProcessor]
        QuerySource[QuerySourceProcessor]
        FetchSource[FetchSourceProcessor]
    end

    subgraph "Value Processing"
        ValueProcessorManager[ValueProcessorManager]
        JsonValue[JsonValueProcessor]
        StringValue[StringValueProcessor]
        NumberValue[NumberValueProcessor]
        BooleanValue[BooleanValueProcessor]
        MatchValue[MatchValueProcessor]
    end

    ValueRawData --> SourceProcessorManager
    SourceProcessorManager --> LiteralSource
    SourceProcessorManager --> RequestHeaderSource
    SourceProcessorManager --> ResponseHeaderSource
    SourceProcessorManager --> UrlSource
    SourceProcessorManager --> CookieSource
    SourceProcessorManager --> QuerySource
    SourceProcessorManager --> FetchSource

    SourceProcessorManager --> ValueProcessorManager
    ValueProcessorManager --> JsonValue
    ValueProcessorManager --> StringValue
    ValueProcessorManager --> NumberValue
    ValueProcessorManager --> BooleanValue
    ValueProcessorManager --> MatchValue
```

此架构图展示了 Unieo 的完整系统设计，突出了其模块化、可扩展和类型安全的特性。