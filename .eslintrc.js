module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-console': 'off',
    'no-use-before-define': 'off',
    'no-shadow': [
      'error',
      {
        allow: ['response'],
      },
    ],
  },
};
