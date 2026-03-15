import { FileConfigStore } from '@synax-ai/server';
import { getStorage } from '@nerax-ai/storage';
import { join } from 'path';

export function getConfigStore() {
  const storage = getStorage('synax');
  return new FileConfigStore(join(storage.config.path, 'synax.json'));
}
