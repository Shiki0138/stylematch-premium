import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactNative from 'eslint-plugin-react-native';
import eslintConfigPrettier from 'eslint-config-prettier';

const reactRecommended = react.configs.flat.recommended;
const reactHooksRecommended = reactHooks.configs.recommended;

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['node_modules/**', 'expo-bundle.js'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-native': reactNative,
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      ...reactRecommended.languageOptions,
      parser: tsParser,
      parserOptions: {
        ...(reactRecommended.languageOptions?.parserOptions ?? {}),
        ecmaFeatures: {
          ...(reactRecommended.languageOptions?.parserOptions?.ecmaFeatures ?? {}),
          jsx: true,
        },
        allowJs: true,
        sourceType: 'module',
      },
      globals: {
        __DEV__: true,
        global: false,
        fetch: false,
        console: false,
        setTimeout: false,
        clearTimeout: false,
        AbortController: false,
        AbortSignal: false,
        process: false,
        window: false,
        document: false,
        FileReader: false,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactRecommended.rules,
      ...reactHooksRecommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-unused-styles': 'warn',
    },
  },
  eslintConfigPrettier,
];
