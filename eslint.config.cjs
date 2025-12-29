const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-plugin-prettier');

module.exports = [
    js.configs.recommended,

    ...tseslint.configs.recommended,

    {
        plugins: {
            prettier,
        },
        rules: {
            'prettier/prettier': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/explicit-function-return-type': 'off',
        },
    },

    {
        ignores: ['dist/**', 'node_modules/**'],
    },
];
