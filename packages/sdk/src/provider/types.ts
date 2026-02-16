import type { LanguageCapability } from './language';
import type { EmbeddingCapability } from './embedding';
import type { ImageCapability } from './image';
import type { SpeechCapability } from './speech';
import type { VideoCapability } from './video';

/**
 * Provider types
 */

/**
 * Provider configuration
 */
export interface ProviderConfig {
  /** Provider ID */
  id: string;
  /** Provider name */
  name?: string;
}

/**
 * Provider interface
 */
export interface Provider {
  /** Provider ID */
  readonly id: string;
  /** Provider name */
  readonly name: string;
  /** Language capability */
  language?: LanguageCapability;
  /** Embedding capability */
  embedding?: EmbeddingCapability;
  /** Image capability */
  image?: ImageCapability;
  /** Speech capability */
  speech?: SpeechCapability;
  /** Video capability */
  video?: VideoCapability;
}

/**
 * Factory function type for creating providers
 */
export type CreateProvider<TConfig extends ProviderConfig = ProviderConfig> = (
  config: TConfig,
) => Provider;
