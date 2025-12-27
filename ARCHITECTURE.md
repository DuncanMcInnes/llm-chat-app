# LLM Chat App - Architecture & Dependencies

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend (React + Vite)"
        App[App.tsx]
        ChatInterface[ChatInterface.tsx]
        ProviderSelector[ProviderSelector.tsx]
        MessageList[MessageList.tsx]
        MessageInput[MessageInput.tsx]
        useChat[useChat Hook]
        APIService[api.ts Service]
        FrontendTypes[types/index.ts]
    end

    subgraph "Backend (Express + TypeScript)"
        Server[server.ts]
        ChatRoutes[routes/chat.ts]
        ChatService[services/chatService.ts]
        Config[config/index.ts]
        BackendTypes[types/index.ts]
    end

    subgraph "LLM Abstraction Layer"
        LLMFactory[LLMFactory]
        LLMProvider[LLMProvider Interface]
        OpenAIService[OpenAIService]
        AnthropicService[AnthropicService]
        GeminiService[GeminiService]
    end

    subgraph "External APIs"
        OpenAIAPI[OpenAI API]
        AnthropicAPI[Anthropic API]
        GeminiAPI[Google Gemini API]
    end

    subgraph "Infrastructure"
        DockerCompose[docker-compose.yml]
        BackendDocker[backend/Dockerfile]
        FrontendDocker[frontend/Dockerfile]
        Nginx[nginx.conf]
    end

    %% Frontend dependencies
    App --> ChatInterface
    ChatInterface --> ProviderSelector
    ChatInterface --> MessageList
    ChatInterface --> MessageInput
    ChatInterface --> useChat
    useChat --> APIService
    useChat --> FrontendTypes
    APIService --> FrontendTypes

    %% Backend dependencies
    Server --> Config
    Server --> LLMFactory
    Server --> ChatRoutes
    ChatRoutes --> ChatService
    ChatRoutes --> BackendTypes
    ChatService --> LLMFactory
    ChatService --> BackendTypes

    %% LLM Layer dependencies
    LLMFactory --> LLMProvider
    LLMFactory --> OpenAIService
    LLMFactory --> AnthropicService
    LLMFactory --> GeminiService
    LLMFactory --> Config
    OpenAIService --> LLMProvider
    AnthropicService --> LLMProvider
    GeminiService --> LLMProvider
    OpenAIService --> BackendTypes
    AnthropicService --> BackendTypes
    GeminiService --> BackendTypes

    %% External API connections
    OpenAIService --> OpenAIAPI
    AnthropicService --> AnthropicAPI
    GeminiService --> GeminiAPI

    %% API communication
    APIService -.HTTP Request.-> ChatRoutes
    ChatRoutes -.HTTP Response.-> APIService

    %% Infrastructure
    DockerCompose --> BackendDocker
    DockerCompose --> FrontendDocker
    FrontendDocker --> Nginx

    style App fill:#e1f5ff
    style Server fill:#ffe1f5
    style LLMFactory fill:#fff5e1
    style LLMProvider fill:#e1ffe1
    style DockerCompose fill:#f0f0f0
```

## Module Dependency Graph

```mermaid
graph LR
    subgraph "Backend Modules"
        direction TB
        S[server.ts]
        CR[routes/chat.ts]
        CS[services/chatService.ts]
        LF[services/llm/LLMFactory.ts]
        LP[services/llm/LLMProvider.ts]
        OAI[services/llm/OpenAIService.ts]
        ANT[services/llm/AnthropicService.ts]
        GEM[services/llm/GeminiService.ts]
        CFG[config/index.ts]
        BT[types/index.ts]
    end

    subgraph "Frontend Modules"
        direction TB
        APP[App.tsx]
        CI[components/ChatInterface.tsx]
        PS[components/ProviderSelector.tsx]
        ML[components/MessageList.tsx]
        MI[components/MessageInput.tsx]
        UC[hooks/useChat.ts]
        API[services/api.ts]
        FT[types/index.ts]
    end

    %% Backend dependencies
    S --> CFG
    S --> LF
    S --> CR
    CR --> CS
    CR --> BT
    CS --> LF
    CS --> BT
    LF --> LP
    LF --> OAI
    LF --> ANT
    LF --> GEM
    LF --> CFG
    LF --> BT
    OAI --> LP
    OAI --> BT
    ANT --> LP
    ANT --> BT
    GEM --> LP
    GEM --> BT

    %% Frontend dependencies
    APP --> CI
    CI --> PS
    CI --> ML
    CI --> MI
    CI --> UC
    UC --> API
    UC --> FT
    API --> FT

    style S fill:#ffcccc
    style APP fill:#ccffcc
    style LF fill:#ffffcc
    style LP fill:#ccccff
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant UI as ChatInterface
    participant Hook as useChat Hook
    participant API as api.ts
    participant Backend as Express Server
    participant Route as chat.ts Route
    participant Service as ChatService
    participant Factory as LLMFactory
    participant Provider as LLM Provider
    participant External as External API

    User->>UI: Type message & send
    UI->>Hook: sendMessage()
    Hook->>API: sendChat(request)
    API->>Backend: POST /api/chat
    Backend->>Route: Handle request
    Route->>Service: processChat(request)
    Service->>Factory: getProvider(name)
    Factory->>Provider: Return provider instance
    Service->>Provider: chat(messages, model)
    Provider->>External: API call
    External-->>Provider: Response
    Provider-->>Service: ChatResult
    Service-->>Route: ChatResponse
    Route-->>Backend: JSON response
    Backend-->>API: HTTP 200
    API-->>Hook: ChatResponse
    Hook->>Hook: Update state
    Hook-->>UI: New messages
    UI-->>User: Display response
```

## LLM Provider Abstraction Pattern

```mermaid
classDiagram
    class LLMProvider {
        <<interface>>
        +chat(messages, model?) Promise~ChatResult~
        +isAvailable() boolean
        +getDefaultModel() string
    }

    class OpenAIService {
        -client: OpenAI
        -defaultModel: string
        +chat(messages, model?) Promise~ChatResult~
        +isAvailable() boolean
        +getDefaultModel() string
    }

    class AnthropicService {
        -client: Anthropic
        -defaultModel: string
        +chat(messages, model?) Promise~ChatResult~
        +isAvailable() boolean
        +getDefaultModel() string
    }

    class GeminiService {
        -client: GoogleGenerativeAI
        -defaultModel: string
        +chat(messages, model?) Promise~ChatResult~
        +isAvailable() boolean
        +getDefaultModel() string
    }

    class LLMFactory {
        -providers: Map~ProviderType, LLMProvider~
        +initialize() void
        +getProvider(name) LLMProvider
        +getAvailableProviders() ProviderType[]
        +isProviderAvailable(name) boolean
    }

    class ChatService {
        +processChat(request) Promise~ChatResponse~
        +getAvailableProviders() ProviderInfo[]
    }

    LLMProvider <|.. OpenAIService
    LLMProvider <|.. AnthropicService
    LLMProvider <|.. GeminiService
    LLMFactory --> LLMProvider : creates
    ChatService --> LLMFactory : uses
```

## Docker Architecture

```mermaid
graph TB
    subgraph "Docker Compose"
        subgraph "Backend Container"
            BackendApp[Node.js App]
            BackendPort[Port 3001]
        end
        
        subgraph "Frontend Container"
            NginxServer[Nginx Server]
            StaticFiles[Static Files]
            FrontendPort[Port 3000]
        end
        
        Network[Docker Network]
    end

    subgraph "External"
        Browser[Web Browser]
        OpenAI[OpenAI API]
        Anthropic[Anthropic API]
        Gemini[Gemini API]
    end

    Browser -->|HTTP| FrontendPort
    FrontendPort --> NginxServer
    NginxServer -->|/api/*| BackendPort
    NginxServer --> StaticFiles
    BackendPort --> BackendApp
    BackendApp -->|API Calls| OpenAI
    BackendApp -->|API Calls| Anthropic
    BackendApp -->|API Calls| Gemini
    BackendApp -.->|Internal| Network
    NginxServer -.->|Internal| Network

    style BackendApp fill:#ffcccc
    style NginxServer fill:#ccffcc
    style Network fill:#ffffcc
```

## Technology Stack

```mermaid
graph TB
    subgraph "Frontend Stack"
        React["React 18"]
        TypeScript["TypeScript"]
        Vite["Vite"]
        CSS["CSS"]
    end

    subgraph "Backend Stack"
        Express["Express.js"]
        NodeJS["Node.js"]
        TSBackend["TypeScript"]
        Zod["Zod Validation"]
    end

    subgraph "LLM SDKs"
        OpenAISDK["openai SDK"]
        AnthropicSDK["@anthropic-ai/sdk"]
        GeminiSDK["@google/generative-ai"]
    end

    subgraph "Infrastructure"
        Docker["Docker"]
        DockerCompose["Docker Compose"]
        Nginx["Nginx"]
    end

    React --> TypeScript
    React --> Vite
    Express --> NodeJS
    Express --> TSBackend
    Express --> Zod
    OpenAISDK --> Express
    AnthropicSDK --> Express
    GeminiSDK --> Express
    Docker --> DockerCompose
    Docker --> Nginx

    style React fill:#61dafb
    style Express fill:#000000,color:#ffffff
    style Docker fill:#0db7ed
```

