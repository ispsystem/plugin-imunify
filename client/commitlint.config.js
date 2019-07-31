module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 80],
    'type-enum': [
      2,
      'always',
      ['feat', 'refactor', 'fix', 'docs', 'test', 'perf', 'review', 'chore', 'style', 'wip', 'ci', 'release', 'lint', 'merge', 'mv'],
    ],
  },
};
