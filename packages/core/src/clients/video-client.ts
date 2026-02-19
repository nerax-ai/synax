import { DispatcherRunner } from '../dispatcher-runner';

/**
 * Video client - routes requests through DispatcherRunner
 * TODO: Implement with proper types when SDK defines VideoRequest/VideoResponse
 */
export class VideoClient {
  constructor(_dispatcherRunner: DispatcherRunner) {}

  /**
   * Generate video
   * TODO: Implement when SDK types are ready
   */
  async generate(_request: unknown): Promise<unknown> {
    throw new Error('VideoClient.generate is not implemented yet');
  }
}
