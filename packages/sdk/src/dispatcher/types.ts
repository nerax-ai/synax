import type { Provider } from '../provider';
import type { Logger, Metrics, CapabilityType } from '../common';

export interface DispatcherContext {
  /** Unique request ID */
  requestId: string;
  /** Capability being invoked (language, embedding, image, etc.) */
  capability: CapabilityType;
  /** Required model (if specified in group/model format) */
  requiredModel?: string;
  /** Request-level shared state for dispatcher use */
  state: Record<string, unknown>;
  logger: Logger;
  metrics?: Metrics;
}

/** Runtime group member with resolved Provider instance */
export interface GroupMember {
  /** Provider instance ID */
  providerId: string;
  provider: Provider;
  /** Specific model this member is limited to */
  modelId?: string;
  options?: Record<string, unknown>;
}

export type ExecuteCallback<T = unknown> = (provider: Provider, model: string) => Promise<T>;
export type StreamExecuteCallback<T = unknown> = (
  provider: Provider,
  model: string,
) => AsyncGenerator<T, void, unknown>;

/**
 * Dispatcher - Execution Strategy
 * Controls HOW to call candidate providers (failover, race, round-robin, etc.)
 */
export interface Dispatcher {
  readonly name: string;
  dispatch<T>(context: DispatcherContext, candidates: GroupMember[], execute: ExecuteCallback<T>): Promise<T>;
  dispatchStream<T>(
    context: DispatcherContext,
    candidates: GroupMember[],
    execute: StreamExecuteCallback<T>,
  ): AsyncGenerator<T, void, unknown>;
}
