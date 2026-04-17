import type { GroupConfig } from '@synax-ai/sdk';

export interface ResolvedGroup {
  groupId: string;
  group: GroupConfig;
  requiredModel?: string;
}

/**
 * Case-insensitive lookup in a Map with string keys.
 */
function getIgnoreCase<V>(map: Map<string, V>, key: string): V | undefined {
  const lower = key.toLowerCase();
  for (const [k, v] of map) {
    if (k.toLowerCase() === lower) return v;
  }
  return undefined;
}

/**
 * Resolve model ID to group configuration (case-insensitive).
 * Patterns:
 * - "group-id" → group decides model (uses default)
 * - "group-id/model-id" → specific model within group
 */
export function resolveModel(groups: Map<string, GroupConfig>, modelId: string): ResolvedGroup {
  const slashIdx = modelId.indexOf('/');

  if (slashIdx === -1) {
    const group = getIgnoreCase(groups, modelId);
    if (!group) throw new Error(`Group '${modelId}' not found`);
    return { groupId: modelId, group };
  }

  const groupId = modelId.slice(0, slashIdx);
  const requiredModel = modelId.slice(slashIdx + 1);
  const group = getIgnoreCase(groups, groupId);
  if (!group) throw new Error(`Group '${groupId}' not found`);
  return { groupId, group, requiredModel };
}
