import type {
  Dispatcher,
  DispatcherContext,
  GroupMember,
  ExecuteCallback,
  StreamExecuteCallback,
  Logger,
  Metrics,
  Provider,
  GroupConfig,
  CapabilityType,
} from '@synax/sdk';
import { resolveModel } from './model-resolver';

/**
 * Dependencies for DispatcherRunner
 */
export interface DispatcherRunnerDeps {
  providers: Map<string, Provider>;
  groups: Map<string, GroupConfig>;
  dispatchers: Map<string, Dispatcher>;
  logger: Logger;
  metrics?: Metrics;
}

/**
 * DispatcherRunner - Handles dispatcher selection and execution
 *
 * This is a standalone object that:
 * 1. Resolves modelId to group and required model
 * 2. Resolves group members to provider instances
 * 3. Selects the appropriate dispatcher
 * 4. Executes the request with failover support
 */
export class DispatcherRunner {
  constructor(private deps: DispatcherRunnerDeps) {}

  /**
   * Dispatch a request through the appropriate dispatcher
   */
  async dispatch<T>(modelId: string, capability: CapabilityType, execute: ExecuteCallback<T>): Promise<T> {
    const { groupId, group, requiredModel } = resolveModel(this.deps.groups, modelId);
    const { logger, metrics, dispatchers, providers } = this.deps;

    // Build candidates with Provider instances
    const candidates = this.buildCandidates(group, providers, logger);

    if (candidates.length === 0) {
      throw new Error(`No valid providers in group: ${groupId}`);
    }

    // Build context
    const context: DispatcherContext = {
      requestId: crypto.randomUUID(),
      capability,
      requiredModel,
      state: {},
      logger,
      metrics: metrics || this.createDefaultMetrics(),
    };

    // Select dispatcher
    let dispatcherRef = group.use;

    // Auto-select if only one dispatcher
    if (!dispatcherRef && dispatchers.size === 1) {
      dispatcherRef = dispatchers.keys().next().value;
    }

    // Filter by required model
    let filteredCandidates = candidates;
    if (requiredModel) {
      filteredCandidates = candidates.filter((m) => !m.modelId || m.modelId === requiredModel);
      if (filteredCandidates.length === 0) {
        throw new Error(`No providers in group ${groupId} support model: ${requiredModel}`);
      }
    }

    // Get dispatcher
    const dispatcher = dispatchers.get(dispatcherRef!);
    if (!dispatcher) {
      throw new Error(`Dispatcher not found: ${dispatcherRef} for group ${groupId}`);
    }

    logger.info(`[${capability}] Dispatching group ${groupId} using: ${dispatcherRef}`);
    return dispatcher.dispatch(context, filteredCandidates, execute);
  }

  /**
   * Dispatch a streaming request through the appropriate dispatcher
   */
  async *dispatchStream<T>(
    modelId: string,
    capability: CapabilityType,
    execute: StreamExecuteCallback<T>,
  ): AsyncGenerator<T, void, unknown> {
    const { groupId, group, requiredModel } = resolveModel(this.deps.groups, modelId);
    const { logger, metrics, dispatchers, providers } = this.deps;

    // Build candidates with Provider instances
    const candidates = this.buildCandidates(group, providers, logger);

    if (candidates.length === 0) {
      throw new Error(`No valid providers in group: ${groupId}`);
    }

    // Build context
    const context: DispatcherContext = {
      requestId: crypto.randomUUID(),
      capability,
      requiredModel,
      state: {},
      logger,
      metrics: metrics || this.createDefaultMetrics(),
    };

    // Select dispatcher
    let dispatcherRef = group.use;

    // Auto-select if only one dispatcher
    if (!dispatcherRef && dispatchers.size === 1) {
      dispatcherRef = dispatchers.keys().next().value;
    }

    // Filter by required model
    let filteredCandidates = candidates;
    if (requiredModel) {
      filteredCandidates = candidates.filter((m) => !m.modelId || m.modelId === requiredModel);
      if (filteredCandidates.length === 0) {
        throw new Error(`No providers in group ${groupId} support model: ${requiredModel}`);
      }
    }

    // Get dispatcher
    const dispatcher = dispatchers.get(dispatcherRef!);
    if (!dispatcher) {
      throw new Error(`Dispatcher not found: ${dispatcherRef} for group ${groupId}`);
    }

    logger.info(`[${capability}] Dispatching stream for group ${groupId} using: ${dispatcherRef}`);
    yield* dispatcher.dispatchStream(context, filteredCandidates, execute);
  }

  /**
   * Build candidates from group config
   */
  private buildCandidates(group: GroupConfig, providers: Map<string, Provider>, logger: Logger): GroupMember[] {
    const candidates: GroupMember[] = [];

    for (const m of group.members) {
      const provider = providers.get(m.provider);
      if (!provider) {
        logger.warn(`Provider not found: ${m.provider}, skipping`);
        continue;
      }
      candidates.push({
        providerId: m.provider,
        provider,
        modelId: m.model,
        options: m.options,
      });
    }

    return candidates;
  }

  /**
   * Create default no-op metrics
   */
  private createDefaultMetrics(): Metrics {
    return {
      getLatency: () => 0,
      getErrorRate: () => 0,
      isHealthy: () => true,
      recordResult: () => {},
    };
  }
}
