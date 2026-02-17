import { DispatcherRunner } from '../dispatcher-runner';

/**
 * Speech client - routes requests through DispatcherRunner
 * TODO: Implement with proper types when SDK defines SpeechRequest/SpeechResponse
 */
export class SpeechClient {
  constructor(_dispatcherRunner: DispatcherRunner) {}

  /**
   * Transcribe audio to text
   * TODO: Implement when SDK types are ready
   */
  async transcribe(_request: unknown): Promise<unknown> {
    throw new Error('SpeechClient.transcribe is not implemented yet');
  }

  /**
   * Synthesize text to audio
   * TODO: Implement when SDK types are ready
   */
  async synthesize(_request: unknown): Promise<unknown> {
    throw new Error('SpeechClient.synthesize is not implemented yet');
  }
}
