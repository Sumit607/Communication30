const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  { ignores: ['.expo/**', 'dist/**', 'coverage/**', 'drizzle/**'] },
  {
    files: ['src/app/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@google/genai', '@google/genai/*', '**/services/gemini/**'],
              message:
                'Keep SDK and prompt details inside the Gemini adapter; use an injected feature service interface.',
            },
          ],
        },
      ],
    },
  },
]);
