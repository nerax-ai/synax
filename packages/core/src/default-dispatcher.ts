import {
  AllCandidatesFailedError,
  type CandidateError,
  type Dispatcher,
  type DispatcherContext,
  type GroupMember,
  type ExecuteCallback,
  type StreamExecuteCallback,
} from '@synax-ai/sdk';

/** Default dispatcher: tries candidates in order until one succeeds */
export class DefaultDispatcher implements Dispatcher {
  readonly name = 'default';

  async dispatch<T>(context: DispatcherContext, candidates: GroupMember[], execute: ExecuteCallback<T>): Promise<T> {
    const errors: CandidateError[] = [];
    for (let i = 0; i < candidates.length; i++) {
      const member = candidates[i];
      const model = context.requiredModel ?? member.modelId;
      if (!model) continue;
      try {
        context.logger.info(`[Default] Trying ${member.providerId} / ${model}`);
        return await execute(member.provider, model);
      } catch (err) {
        context.logger.warn(`[Default] ${member.providerId} failed: ${(err as Error).message}`);
        errors.push({ providerId: member.providerId, modelId: member.modelId, error: err as Error, attemptIndex: i });
      }
    }
    throw new AllCandidatesFailedError(errors);
  }

  async *dispatchStream<T>(
    context: DispatcherContext,
    candidates: GroupMember[],
    execute: StreamExecuteCallback<T>,
  ): AsyncGenerator<T, void, unknown> {
    const errors: CandidateError[] = [];
    for (let i = 0; i < candidates.length; i++) {
      const member = candidates[i];
      const model = context.requiredModel ?? member.modelId;
      if (!model) continue;
      try {
        context.logger.info(`[Default] Trying stream from ${member.providerId} / ${model}`);
        yield* execute(member.provider, model);
        return;
      } catch (err) {
        context.logger.warn(`[Default] Stream from ${member.providerId} failed: ${(err as Error).message}`);
        errors.push({ providerId: member.providerId, modelId: member.modelId, error: err as Error, attemptIndex: i });
      }
    }
    throw new AllCandidatesFailedError(errors);
  }
}
