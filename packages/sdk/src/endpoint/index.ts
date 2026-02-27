import type { AnyModel } from '../protocol';
import type { EndpointLanguageClient } from './language';
import type { EndpointEmbeddingClient } from './embedding';
import type { EndpointImageClient } from './image';
import type { EndpointSpeechClient } from './speech';
import type { EndpointVideoClient } from './video';

export type { EndpointLanguageClient } from './language';
export type { EndpointEmbeddingClient } from './embedding';
export type { EndpointImageClient } from './image';
export type { EndpointSpeechClient } from './speech';
export type { EndpointVideoClient } from './video';

import type { Logger } from '@nerax-ai/logger';

export interface EndpointContext {
  logger: Logger;
  language: EndpointLanguageClient;
  embedding: EndpointEmbeddingClient;
  image: EndpointImageClient;
  speech: EndpointSpeechClient;
  video: EndpointVideoClient;
  models(): AnyModel[];
}

export type EndpointFactory = (options: Record<string, unknown>) => Endpoint;

export interface Endpoint {
  basePath: string;
  registerRoutes(app: any, ctx: EndpointContext): void;
}

export interface ApiContext {
  models(): AnyModel[];
}

export interface ApiPlugin {
  basePath: string;
  registerRoutes(app: any, ctx: ApiContext): void;
}

export type ApiPluginFactory = (options: Record<string, unknown>) => ApiPlugin;
