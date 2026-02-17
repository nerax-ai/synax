export * from './language';
export * from './image';
export * from './embedding';
export * from './speech';
export * from './video';

import type { LanguageModel } from './language';

/**
 * Any model type (union type)
 * Currently only includes LanguageModel, other model types will be added later
 */
export type AnyModel = LanguageModel;
