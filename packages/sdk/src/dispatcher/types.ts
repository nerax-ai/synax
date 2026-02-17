import type { Provider } from '../provider';
import type { Logger, Metrics, CapabilityType } from '../common';

/**
 * Context provided to Dispatcher during dispatch
 */
export interface DispatcherContext {
  /** Unique request ID */
  requestId: string;
  /** Capability being invoked */
  capability: CapabilityType;
  /** Required model (if specified in group/model format) */
  requiredModel?: string;
  /** Request-level shared state */
  state: Record<string, unknown>;
  /** Logger instance */
  logger: Logger;
  /** Metrics instance */
  metrics?: Metrics;
}

/**
 * Runtime group member with Provider instance
 */
export interface GroupMember {
  providerId: string;
  provider: Provider;
  modelId?: string;
  options?: Record<string, unknown>;
}

/**
 * Execute callback - created by Client with request captured in closure
 */
export type ExecuteCallback<T = unknown> = (provider: Provider, model: string, signal?: AbortSignal) => Promise<T>;

/**
 * Stream execute callback - returns async generator
 * The entire stream is treated as one unit for failover purposes
 */
export type StreamExecuteCallback<T = unknown> = (
  provider: Provider,
  model: string,
  signal?: AbortSignal,
) => AsyncGenerator<T, void, unknown>;

/**
 * Dispatcher - Execution Strategy
 *
 * Controls HOW to call candidate providers. Not just a selector,
 * but a full execution strategy that can implement:
 * - Failover (sequential retry)
 * - Race/Hedging (parallel, first wins)
 * - Round-robin (load balancing)
 * - Canary (percentage-based routing)
 */
export interface Dispatcher {
  readonly name: string;

  /**
   * Execute the request using candidate providers (non-streaming)
   *
   * @param context - Dispatch context with request metadata
   * @param candidates - Candidate members with resolved provider instances
   * @param execute - Callback to execute a provider
   * @returns The final response
   */
  dispatch<T>(context: DispatcherContext, candidates: GroupMember[], execute: ExecuteCallback<T>): Promise<T>;

  /**
   * Execute a streaming request using candidate providers
   *
   * For streaming, failover happens at the stream level:
   * - If a stream fails mid-way, switch to next candidate
   * - The entire stream is treated as one unit
   *
   * @param context - Dispatch context with request metadata
   * @param candidates - Candidate members with resolved provider instances
   * @param execute - Callback to execute a provider and return async generator
   * @returns Async generator yielding stream chunks
   */
  dispatchStream<T>(
    context: DispatcherContext,
    candidates: GroupMember[],
    execute: StreamExecuteCallback<T>,
  ): AsyncGenerator<T, void, unknown>;
}

/**
 * Dispatcher factory function
 */
export type DispatcherFactory = () => Dispatcher;
