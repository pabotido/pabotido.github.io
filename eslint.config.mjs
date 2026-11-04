import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/.cache/**', '**/dist/**', '**/.next/**', '**/out/**', '**/node_modules/**', '**/next-env.d.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['apps/api/jest.config.js', 'apps/api/jest.integration.config.js'], languageOptions: { sourceType: 'commonjs', globals: { module: 'readonly', require: 'readonly' } }, rules: { '@typescript-eslint/no-require-imports': 'off' } },
);
