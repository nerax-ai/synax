export interface GroupMemberConfig {
  /** Provider instance ID to use */
  provider: string;
  /** Default model when client requests only the group ID */
  default?: string;
  /** Limit to specific model; this member only handles requests for this model */
  model?: string;
  /** Scheduler options (e.g., priority, weight) */
  options?: Record<string, unknown>;
}

export interface GroupConfig {
  id: string;
  name?: string;
  /** Dispatcher plugin to use, defaults to 'default' (sequential failover) */
  use?: string;
  options?: Record<string, unknown>;
  members: GroupMemberConfig[];
}
