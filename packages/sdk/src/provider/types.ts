import type { LanguageCapability } from './language';
import type { EmbeddingCapability } from './embedding';
import type { ImageCapability } from './image';
import type { SpeechCapability } from './speech';
import type { VideoCapability } from './video';
import type { AnyModel } from '../protocol';

export interface ProviderConfig {
  /** Unique provider instance ID */
  id: string;
  name?: string;
  /** Provider plugin ID to use, e.g. 'provider-ai-sdk' */
  use: string;
  /** HTTP/HTTPS proxy URL, e.g. http://127.0.0.1:7890 */
  proxy?: string;
  /** Provider-specific options passed to the plugin factory */
  options?: Record<string, unknown>;
  /** Custom model list (overrides or extends models reported by the provider) */
  models?: AnyModel[];
}

export interface Provider {
  readonly id: string;
  readonly name: string;
  /** Models available from this provider */
  readonly models?: AnyModel[];
  language?: LanguageCapability;
  embedding?: EmbeddingCapability;
  image?: ImageCapability;
  speech?: SpeechCapability;
  video?: VideoCapability;
}
