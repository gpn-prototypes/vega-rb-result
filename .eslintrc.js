const localePrettierConfig = require('./.prettierrc');

module.exports = {
  extends: [require.resolve('@gpn-prototypes/frontend-configs/.eslintrc')],
  rules: {
    'comma-dangle': 'off',
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'prettier/prettier': ['error', localePrettierConfig],
  },
  overrides: [
    {
      files: ['./src/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
      settings: {
        'import/resolver': {
          typescript: {},
        },
      },
    },
  ],
};
