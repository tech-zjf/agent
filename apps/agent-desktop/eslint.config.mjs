import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig([
    {
        ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts', '*.config.mjs', 'eslint.config.mjs'],
    },
    eslint.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        extends: [...tseslint.configs.recommendedTypeChecked],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                project: ['./tsconfig.json'],
                tsconfigRootDir,
            },
        },
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
]);
