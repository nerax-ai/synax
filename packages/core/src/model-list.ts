import type { Provider, AnyModel, GroupConfig, GroupMemberConfig } from '@synax-ai/sdk';

/**
 * List all available models (group-level and specific models)
 */
export function listModels(groups: Map<string, GroupConfig>, providers: Map<string, Provider>): AnyModel[] {
  const models: AnyModel[] = [];

  for (const [groupId, group] of groups) {
    const memberModels: AnyModel[] = [];

    for (const member of group.members) {
      const model = getMemberModel(groupId, member, providers);
      if (model) {
        memberModels.push(model);
        models.push(model);
      }
    }

    if (memberModels.length > 0) {
      const groupModel = aggregateGroupModel(groupId, memberModels);
      models.unshift(groupModel);
    }
  }

  return models;
}

function getMemberModel(groupId: string, member: GroupMemberConfig, providers: Map<string, Provider>): AnyModel | null {
  const modelId = member.model ?? member.default;
  if (!modelId) return null;

  const provider = providers.get(member.provider);
  const providerModel = provider?.models?.find((m) => m.id === modelId);

  return {
    limits: { context: 128000, output: 4096 },
    ...(providerModel ?? {}),
    type: providerModel?.type ?? 'language',
    id: `${groupId}/${modelId}`,
    name: providerModel?.name ?? modelId,
  };
}

function aggregateGroupModel(groupId: string, memberModels: AnyModel[]): AnyModel {
  const maxContext = Math.max(...memberModels.map((m) => m.limits?.context ?? 0));
  const maxOutput = Math.max(...memberModels.map((m) => m.limits?.output ?? 0));

  const capabilities = memberModels.reduce(
    (acc, m) => ({
      tools: acc.tools || m.capabilities?.tools,
      streaming: acc.streaming || m.capabilities?.streaming,
      reasoning: acc.reasoning || m.capabilities?.reasoning,
      temperature: acc.temperature || m.capabilities?.temperature,
      jsonSchema: acc.jsonSchema || m.capabilities?.jsonSchema,
      attachment: acc.attachment || m.capabilities?.attachment,
    }),
    {} as NonNullable<AnyModel['capabilities']>,
  );

  return {
    type: 'language',
    id: groupId,
    name: groupId,
    limits: { context: maxContext, output: maxOutput },
    capabilities,
  } as AnyModel;
}
