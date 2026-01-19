import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));

// 通用配置：适用于 packages 和所有基础文件
export default defineConfig([
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.next/**',
            '**/coverage/**',
            '**/.turbo/**',
            '**/eslint.config.*',
            '**/next.config.*',
            'apps/**', // 忽略 apps，让它们使用自己的配置
        ],
    },
    // 基础规则和 Prettier
    eslint.configs.recommended,
    prettier,
    // TypeScript 配置：仅适用于 packages
    {
        files: ['packages/**/*.ts'],
        extends: [...tseslint.configs.recommended],
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: ['*.mjs', '*.js', '*.cjs'],
                },
                tsconfigRootDir,
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
]);
