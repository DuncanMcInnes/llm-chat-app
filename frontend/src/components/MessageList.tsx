import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (messages.length === 0 && !isLoading) {
    return <div className="message-list empty">Start chatting to see responses here.</div>;
  }

  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <div key={index} className={`message message-${msg.role}`}>
          <div className="message-role">
            {msg.role === 'user' ? 'You' : 'Assistant'}
            {msg.role === 'assistant' && msg.model && (
              <span className="message-model"> ({msg.model})</span>
            )}
          </div>
          <div className="message-content">{msg.content}</div>
        </div>
      ))}
      {isLoading && (
        <div className="message message-assistant loading">
          <div className="message-role">Assistant</div>
          <div className="message-content">Thinking…</div>
        </div>
      )}
    </div>
  );
}


