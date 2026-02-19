/**
 * Common infrastructure interfaces
 */

/**
 * Capability types supported by Synax
 */
export type CapabilityType = 'language' | 'embedding' | 'image' | 'speech' | 'video';

export type { Logger } from '@nerax-ai/logger';

export interface Metrics {
  /** Get average latency for a provider (ms) */
  getLatency(providerId: string): number;
  /** Get error rate for a provider (0-1) */
  getErrorRate(providerId: string): number;
  /** Check if a provider is healthy */
  isHealthy(providerId: string): boolean;
  /** Record a request result */
  recordResult(providerId: string, latency: number, success: boolean): void;
}
