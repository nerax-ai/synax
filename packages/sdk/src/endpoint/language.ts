import type { LanguageRequest, LanguageResponse, LanguageStreamPart } from '../protocol';

export interface EndpointLanguageClient {
  generate(request: LanguageRequest): Promise<LanguageResponse>;
  stream(request: LanguageRequest): AsyncGenerator<LanguageStreamPart, void, unknown>;
}
