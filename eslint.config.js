import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', 'src/**/*', 'scripts/**/*', 'public/**/*', 'api/**/*'],
  },
  firebaseRulesPlugin.configs['flat/recommended'],
];
