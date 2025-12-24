import type { LLMProviderId, ProviderInfo } from '../types';

interface ProviderSelectorProps {
  providers: ProviderInfo[];
  value: LLMProviderId;
  onChange: (id: LLMProviderId) => void;
}

export function ProviderSelector({ providers, value, onChange }: ProviderSelectorProps) {
  const hasAvailable = providers.some(p => p.available);

  return (
    <div className="provider-selector">
      <label htmlFor="provider">Provider:</label>
      <select
        id="provider"
        value={value}
        onChange={e => onChange(e.target.value as LLMProviderId)}
      >
        {providers.map(provider => (
          <option key={provider.id} value={provider.id} disabled={!provider.available}>
            {provider.name}
            {!provider.available ? ' (unavailable)' : ''}
          </option>
        ))}
      </select>
      {!hasAvailable && (
        <p className="provider-warning">
          No providers available. Check your API keys in <code>.env</code>.
        </p>
      )}
    </div>
  );
}


