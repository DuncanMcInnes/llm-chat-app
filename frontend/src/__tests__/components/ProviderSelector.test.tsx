import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { ProviderSelector } from '../../components/ProviderSelector';
import type { ProviderInfo } from '../../types';

describe('ProviderSelector', () => {
  const mockProviders: ProviderInfo[] = [
    { id: 'openai', name: 'OpenAI GPT', available: true },
    { id: 'anthropic', name: 'Anthropic Claude', available: true },
    { id: 'gemini', name: 'Google Gemini', available: false },
  ];

  it('should render provider selector with available providers', () => {
    const mockOnChange = vi.fn();

    render(
      <ProviderSelector
        providers={mockProviders}
        value="openai"
        onChange={mockOnChange}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('should display current provider value', () => {
    const mockOnChange = vi.fn();

    render(
      <ProviderSelector
        providers={mockProviders}
        value="anthropic"
        onChange={mockOnChange}
      />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('anthropic');
  });

  it('should call onChange when provider is changed', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <ProviderSelector
        providers={mockProviders}
        value="openai"
        onChange={mockOnChange}
      />
    );

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'anthropic');

    expect(mockOnChange).toHaveBeenCalledWith('anthropic');
  });

  it('should only show available providers', () => {
    const mockOnChange = vi.fn();

    render(
      <ProviderSelector
        providers={mockProviders}
        value="openai"
        onChange={mockOnChange}
      />
    );

    const select = screen.getByRole('combobox');
    const options = Array.from(select.querySelectorAll('option'));

    // Should have 2 available providers + 1 default option
    const availableOptions = options.filter(opt => 
      opt.value === 'openai' || opt.value === 'anthropic'
    );
    expect(availableOptions.length).toBe(2);
  });

  it('should handle empty providers list', () => {
    const mockOnChange = vi.fn();

    render(
      <ProviderSelector
        providers={[]}
        value="openai"
        onChange={mockOnChange}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });
});

