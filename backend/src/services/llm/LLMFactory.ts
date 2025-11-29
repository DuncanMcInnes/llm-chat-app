import { LLMProvider } from './LLMProvider';
import { OpenAIService } from './OpenAIService';
import { AnthropicService } from './AnthropicService';
import { GeminiService } from './GeminiService';
import { LLMProvider as ProviderType } from '../../types';
import { config } from '../../config';

/**
 * Factory class for creating LLM provider instances
 * Implements the Factory pattern to abstract provider creation
 */
export class LLMFactory {
  private static providers: Map<ProviderType, LLMProvider> = new Map();

  /**
   * Initialize all providers from configuration
   * Should be called once at application startup
   */
  static initialize(): void {
    // Initialize OpenAI
    if (config.llm.openai?.apiKey) {
      this.providers.set('openai', new OpenAIService(
        config.llm.openai.apiKey,
        config.llm.openai.defaultModel
      ));
    }

    // Initialize Anthropic
    if (config.llm.anthropic?.apiKey) {
      this.providers.set('anthropic', new AnthropicService(
        config.llm.anthropic.apiKey,
        config.llm.anthropic.defaultModel
      ));
    }

    // Initialize Gemini
    if (config.llm.gemini?.apiKey) {
      this.providers.set('gemini', new GeminiService(
        config.llm.gemini.apiKey,
        config.llm.gemini.defaultModel
      ));
    }
  }

  /**
   * Get a provider instance by name
   * @param providerName The name of the provider
   * @returns The provider instance or null if not available
   */
  static getProvider(providerName: ProviderType): LLMProvider | null {
    return this.providers.get(providerName) || null;
  }

  /**
   * Get all available providers
   * @returns Array of provider names that are initialized and available
   */
  static getAvailableProviders(): ProviderType[] {
    return Array.from(this.providers.entries())
      .filter(([_, provider]) => provider.isAvailable())
      .map(([name, _]) => name);
  }

  /**
   * Check if a provider is available
   * @param providerName The name of the provider
   * @returns true if the provider is available
   */
  static isProviderAvailable(providerName: ProviderType): boolean {
    const provider = this.providers.get(providerName);
    return provider !== undefined && provider.isAvailable();
  }
}

