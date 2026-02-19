export type CapabilityType = 'language' | 'embedding' | 'image' | 'speech' | 'video';

export type { Logger } from '@nerax-ai/logger';

export interface Metrics {
  getLatency(providerId: string): number;
  getErrorRate(providerId: string): number;
  isHealthy(providerId: string): boolean;
  recordResult(providerId: string, latency: number, success: boolean): void;
}
