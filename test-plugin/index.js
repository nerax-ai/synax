export const manifest = {
  id: 'test-schema-plugin',
  name: 'Test Schema Plugin',
  version: '1.0.0'
};

export function setup(ctx) {
  const schema = {
    fields: [
      { name: 'apiKey', type: 'string', description: 'API Key', required: true },
      { name: 'baseURL', type: 'string', description: 'Base URL', default: 'https://api.example.com' },
      { name: 'timeout', type: 'number', description: 'Timeout (ms)', default: 30000 },
      { name: 'debug', type: 'boolean', description: 'Enable debug', default: false }
    ]
  };

  ctx.register('provider', 'test-provider', (options) => ({
    id: options.id,
    name: 'Test Provider',
    models: [],
    async chat() { throw new Error('Not implemented'); }
  }), { schema });
}
