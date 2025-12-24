interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function MessageInput({ value, onChange, onSend, disabled }: MessageInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="message-input">
      <textarea
        rows={3}
        placeholder="Type your message and press Enter to send…"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button type="button" onClick={onSend} disabled={disabled || !value.trim()}>
        Send
      </button>
    </div>
  );
}


