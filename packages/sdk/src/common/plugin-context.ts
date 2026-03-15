import type { Schema } from './schema';

export interface PluginRegisterContext {
  register<T>(
    type: string,
    id: string,
    factory: (options: Record<string, unknown>) => T,
    schema?: Schema
  ): void;
}
