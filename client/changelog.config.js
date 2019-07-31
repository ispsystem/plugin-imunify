module.exports = {
  disableEmoji: false,
  list: ['feat', 'refactor', 'fix', 'docs', 'test', 'perf', 'review', 'chore', 'style', 'wip', 'ci', 'release', 'lint', 'merge', 'mv'],
  maxMessageLength: 80,
  minMessageLength: 3,
  questions: ['type', 'scope', 'subject', 'body', 'breaking', 'issues'],
  scopes: ['', 'antivirus-card', 'antivirus-menu', 'antivirus-widget'],
  types: {
    feat: {
      description: 'A new feature',
      emoji: '🌟',
      value: 'feat',
    },
    refactor: {
      description: 'A code change that neither fixes a bug or adds a feature',
      emoji: '💡',
      value: 'refactor',
    },
    fix: {
      description: 'A bug fix',
      emoji: '🐛',
      value: 'fix',
    },
    review: {
      description: 'Updating code due to code review changes',
      emoji: '👌',
      value: 'review',
    },
    chore: {
      description: 'Build process or auxiliary tool changes',
      emoji: '🔧',
      value: 'chore',
    },
    perf: {
      description: 'A code change that improves performance',
      emoji: '⚡️',
      value: 'perf',
    },
    test: {
      description: 'Adding missing tests',
      emoji: '👷',
      value: 'test',
    },
    docs: {
      description: 'Documentation only changes',
      emoji: '📚',
      value: 'docs',
    },
    style: {
      description: 'Markup, white-space, formatting, missing semi-colons...',
      emoji: '🎨',
      value: 'style',
    },
    wip: {
      description: 'Work in progress',
      emoji: '🚧',
      value: 'wip',
    },
    ci: {
      description: 'CI related changes',
      emoji: '🎡',
      value: 'ci',
    },
    release: {
      description: 'Releasing / Version tags',
      emoji: '🔖',
      value: 'release',
    },
    lint: {
      description: 'Change linter rules',
      emoji: '🚨',
      value: 'lint',
    },
    merge: {
      description: 'Merging branches',
      emoji: '🔀',
      value: 'merge',
    },
    mv: {
      description: 'Moving or renaming files',
      emoji: '🚚',
      value: 'mv',
    },
  },
};
