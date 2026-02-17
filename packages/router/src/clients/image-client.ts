import { DispatcherRunner } from '../dispatcher-runner';

/**
 * Image client - routes requests through DispatcherRunner
 * TODO: Implement with proper types when SDK defines ImageRequest/ImageResponse
 */
export class ImageClient {
  constructor(_dispatcherRunner: DispatcherRunner) {}

  /**
   * Generate image
   * TODO: Implement when SDK types are ready
   */
  async generate(_request: unknown): Promise<unknown> {
    throw new Error('ImageClient.generate is not implemented yet');
  }
}
