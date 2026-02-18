import type { LanguageRequest, LanguageResponse, LanguageStreamPart, Provider } from '@synax/sdk';
import { DispatcherRunner } from '../dispatcher-runner';

/**
 * Language client - routes all requests through DispatcherRunner
 */
export class LanguageClient {
  constructor(private readonly dispatcherRunner: DispatcherRunner) {}

  /**
   * Generate response (non-streaming)
   * Routes through DispatcherRunner for failover support
   */
  async generate(request: LanguageRequest): Promise<LanguageResponse> {
    return this.dispatcherRunner.dispatch(request.model, 'language', async (provider, model) => {
      return this.executeGenerate(provider, model, request);
    });
  }

  /**
   * Stream response
   * Routes through DispatcherRunner with failover support
   * The entire stream is treated as one unit - if it fails, next candidate is tried
   */
  async *stream(request: LanguageRequest): AsyncGenerator<LanguageStreamPart, void, unknown> {
    yield* this.dispatcherRunner.dispatchStream(request.model, 'language', (provider, model) => {
      return this.executeStream(provider, model, request);
    });
  }

  /**
   * Execute generate on provider
   */
  private async executeGenerate(
    provider: Provider,
    model: string,
    request: LanguageRequest,
  ): Promise<LanguageResponse> {
    const capability = provider.language;

    if (!capability) {
      throw new Error(`Provider '${provider.id}' does not support language capability`);
    }

    return capability.generate({ ...request, model });
  }

  /**
   * Execute stream on provider
   */
  private async *executeStream(
    provider: Provider,
    model: string,
    request: LanguageRequest,
  ): AsyncGenerator<LanguageStreamPart, void, unknown> {
    const capability = provider.language;

    if (!capability) {
      throw new Error(`Provider '${provider.id}' does not support language capability`);
    }

    yield* capability.stream({ ...request, model });
  }
}
