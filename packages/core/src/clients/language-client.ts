import type { LanguageRequest, LanguageResponse, LanguageStreamPart, Provider } from '@synax-ai/sdk';
import { DispatcherRunner } from '../dispatcher-runner';

export class LanguageClient {
  constructor(private readonly dispatcherRunner: DispatcherRunner) {}

  async generate(request: LanguageRequest): Promise<LanguageResponse> {
    return this.dispatcherRunner.dispatch(request.model, 'language', async (provider, model) => {
      return this.executeGenerate(provider, model, request);
    });
  }

  async *stream(request: LanguageRequest): AsyncGenerator<LanguageStreamPart, void, unknown> {
    yield* this.dispatcherRunner.dispatchStream(request.model, 'language', (provider, model) => {
      return this.executeStream(provider, model, request);
    });
  }

  private async executeGenerate(
    provider: Provider,
    model: string,
    request: LanguageRequest,
  ): Promise<LanguageResponse> {
    if (!provider.language) throw new Error(`Provider '${provider.id}' does not support language capability`);
    return provider.language.generate({ ...request, model });
  }

  private async *executeStream(
    provider: Provider,
    model: string,
    request: LanguageRequest,
  ): AsyncGenerator<LanguageStreamPart, void, unknown> {
    if (!provider.language) throw new Error(`Provider '${provider.id}' does not support language capability`);
    yield* provider.language.stream({ ...request, model });
  }
}
