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
} from '@synax-ai/sdk';
import { resolveModel } from './model-resolver';

export interface DispatcherRunnerDeps {
  providers: Map<string, Provider>;
  groups: Map<string, GroupConfig>;
  dispatchers: Map<string, Dispatcher>;
  logger: Logger;
  metrics?: Metrics;
}

export class DispatcherRunner {
  constructor(private deps: DispatcherRunnerDeps) {}

  async dispatch<T>(modelId: string, capability: CapabilityType, execute: ExecuteCallback<T>): Promise<T> {
    const { context, filteredCandidates, dispatcher } = this.prepareDispatch(modelId, capability);
    return dispatcher.dispatch(context, filteredCandidates, execute);
  }

  async *dispatchStream<T>(
    modelId: string,
    capability: CapabilityType,
    execute: StreamExecuteCallback<T>,
  ): AsyncGenerator<T, void, unknown> {
    const { context, filteredCandidates, dispatcher } = this.prepareDispatch(modelId, capability);
    yield* dispatcher.dispatchStream(context, filteredCandidates, execute);
  }

  private prepareDispatch(modelId: string, capability: CapabilityType) {
    const { groupId, group, requiredModel } = resolveModel(this.deps.groups, modelId);
    const { logger, metrics, dispatchers, providers } = this.deps;

    const candidates = this.buildCandidates(group, providers, logger);
    if (candidates.length === 0) throw new Error(`No valid providers in group: ${groupId}`);

    const context: DispatcherContext = {
      requestId: crypto.randomUUID(),
      capability,
      requiredModel,
      state: {},
      logger,
      metrics,
    };

    let filteredCandidates = candidates;
    if (requiredModel) {
      filteredCandidates = candidates.filter((m) => !m.modelId || m.modelId === requiredModel);
      if (filteredCandidates.length === 0)
        throw new Error(`No providers in group ${groupId} support model: ${requiredModel}`);
    }

    const dispatcherRef = group.use ?? dispatchers.keys().next().value;
    const dispatcher = dispatchers.get(dispatcherRef!);
    if (!dispatcher) throw new Error(`Dispatcher not found: ${dispatcherRef} for group ${groupId}`);

    logger.info(`[${capability}] Dispatching group ${groupId} using: ${dispatcherRef}`);
    return { context, filteredCandidates, dispatcher };
  }

  private buildCandidates(group: GroupConfig, providers: Map<string, Provider>, logger: Logger): GroupMember[] {
    const candidates: GroupMember[] = [];
    for (const m of group.members) {
      const provider = providers.get(m.provider);
      if (!provider) {
        logger.warn(`Provider not found: ${m.provider}, skipping`);
        continue;
      }
      candidates.push({ providerId: m.provider, provider, modelId: m.model, options: m.options });
    }
    return candidates;
  }
}
