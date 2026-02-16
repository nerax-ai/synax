/**
 * Group Types
 */

/**
 * Group member configuration
 */
export interface GroupMemberConfig {
  /** Target Provider ID (required) */
  provider: string;
  /** Default model, used when client only requests GroupID */
  default?: string;
  /** Limit to specific model, if set, this member only handles requests for this model */
  model?: string;
  /** Scheduler options (e.g., priority, weight) */
  options?: Record<string, unknown>;
}

/**
 * Group configuration
 */
export interface GroupConfig {
  /** Unique Group identifier */
  id: string;
  /** Group name */
  name?: string;
  /** Scheduler plugin to use (e.g., "priority"), defaults to sequential scheduling if not configured */
  use?: string;
  /** Group custom options */
  options?: Record<string, unknown>;
  /** Member list */
  members: GroupMemberConfig[];
}
