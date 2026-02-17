import { DispatcherRunner } from '../dispatcher-runner';

/**
 * Embedding client - routes requests through DispatcherRunner
 * TODO: Implement with proper types when SDK defines EmbeddingRequest/EmbeddingResponse
 */
export class EmbeddingClient {
  constructor(_dispatcherRunner: DispatcherRunner) {}

  /**
   * Generate embeddings for input text(s)
   * TODO: Implement when SDK types are ready
   */
  async embed(_request: unknown): Promise<unknown> {
    throw new Error('EmbeddingClient.embed is not implemented yet');
  }
}
