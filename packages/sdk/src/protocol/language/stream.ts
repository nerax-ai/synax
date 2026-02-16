import { LanguageMessagePart } from './content';
import { FinishReason } from './finish-reason';
import { LanguageTokenUsage } from './usage';
import type { ProviderMetadata } from './types';

/**
 * Incremental change (delta) within a streaming response.
 * Follows the same Part-centric structure as the message.
 */
export interface LanguageStreamChunkDelta {
  /**
   * The role of the author (usually only present in the first chunk).
   */
  role?: string;

  /**
   * Incremental content. Can be a string delta or an array of partial parts.
   */
  content?: string | LanguageMessagePart[];
}

/**
 * Language Stream Chunk.
 * Represents a single packet of data in a streaming LLM response.
 */
export interface LanguageStreamChunk {
  /** Unique ID for the stream session. */
  id: string;

  /** Unix timestamp. */
  created: number;

  /** The model ID. */
  model: string;

  /** List of choice deltas. */
  choices: Array<{
    /** Index of the choice. */
    index: number;
    /** The delta of information in this chunk. */
    delta: LanguageStreamChunkDelta;
    /** Reason for completion (only present in the final chunk). */
    finishReason: FinishReason;
  }>;

  /** Accumulated or incremental usage statistics. */
  usage?: LanguageTokenUsage;

  /** Extra provider-specific metadata. */
  providerMetadata?: ProviderMetadata;
}
