import type { GroupConfig } from '@synax-ai/sdk';

/**
 * Resolved group result
 * Only supports group-based routing (no direct provider access)
 */
export interface ResolvedGroup {
  groupId: string;
  group: GroupConfig;
  requiredModel?: string;
}

/**
 * Resolve model ID to group configuration
 * Throws if the model ID doesn't reference a valid group
 *
 * Model ID Patterns:
 * - "group-id" → Group decides model (uses default)
 * - "group-id/model-id" → Specific model within group
 *
 * Direct provider access (provider-id/model-id) is NOT supported.
 */
export function resolveModel(groups: Map<string, GroupConfig>, modelId: string): ResolvedGroup {
  const parts = modelId.split('/');

  // Single part: "group-id"
  if (parts.length === 1) {
    const groupId = parts[0];
    const group = groups.get(groupId);

    if (!group) {
      throw new Error(`Group '${groupId}' not found. Model ID must reference a group.`);
    }

    return { groupId, group };
  }

  // Two parts: "group-id/model-id"
  const [groupId, requiredModel] = parts;
  const group = groups.get(groupId);

  if (!group) {
    throw new Error(`Group '${groupId}' not found. Model ID must reference a group.`);
  }

  return { groupId, group, requiredModel };
}
