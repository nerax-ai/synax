import type { GroupConfig } from '@synax-ai/sdk';

export interface ResolvedGroup {
  groupId: string;
  group: GroupConfig;
  requiredModel?: string;
}

/**
 * Resolve model ID to group configuration.
 * Patterns:
 * - "group-id" → group decides model (uses default)
 * - "group-id/model-id" → specific model within group
 */
export function resolveModel(groups: Map<string, GroupConfig>, modelId: string): ResolvedGroup {
  const slashIdx = modelId.indexOf('/');

  if (slashIdx === -1) {
    const group = groups.get(modelId);
    if (!group) throw new Error(`Group '${modelId}' not found`);
    return { groupId: modelId, group };
  }

  const groupId = modelId.slice(0, slashIdx);
  const requiredModel = modelId.slice(slashIdx + 1);
  const group = groups.get(groupId);
  if (!group) throw new Error(`Group '${groupId}' not found`);
  return { groupId, group, requiredModel };
}
