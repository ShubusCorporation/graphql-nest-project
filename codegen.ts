import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './schema.graphql',
  documents: ['test/**/*.ts'],
  generates: {
    'test/generated/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
  // Игнорировать ошибку, если в тестах пока нет gql-тегов
  ignoreNoDocuments: true,
};

export default config;
