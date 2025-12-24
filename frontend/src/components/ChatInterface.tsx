import { useChat } from '../hooks/useChat';
import { ProviderSelector } from './ProviderSelector';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export function ChatInterface() {
  const {
    provider,
    providers,
    messages,
    input,
    isLoading,
    error,
    setProvider,
    setInput,
    sendMessage,
    reset,
  } = useChat();

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div>
          <h1>LLM Chat Interface</h1>
          <p className="chat-subtitle">
            Talk to GPT, Claude, or Gemini through a unified interface.
          </p>
        </div>
        <ProviderSelector providers={providers} value={provider} onChange={setProvider} />
      </header>

      <main className="chat-main">
        <MessageList messages={messages} isLoading={isLoading} />
      </main>

      {error && <div className="chat-error">Error: {error}</div>}

      <footer className="chat-footer">
        <MessageInput
          value={input}
          onChange={setInput}
          onSend={sendMessage}
          disabled={isLoading || providers.length === 0}
        />
        <button type="button" className="reset-button" onClick={reset} disabled={messages.length === 0}>
          Clear
        </button>
      </footer>
    </div>
  );
}


