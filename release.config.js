/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: process.env.SEMANTIC_RELEASE_RC === 'true' 
    ? [
        { name: 'main', prerelease: 'rc', channel: 'rc' },
        // must remain one branch to release while main branch is rc
        'beta',
      ]
    // use default branches
    : undefined,
  repositoryUrl: 'https://github.com/unieojs/unieo',
  plugins: [
    '@semantic-release/commit-analyzer',
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            { type: 'feat', section: '🚀 Features' },
            { type: 'fix', section: '🐛 Bug Fixes' },
            { type: 'perf', section: '⚡ Performance Improvements' },
            { type: 'revert', section: '⏪ Reverts' },
            { type: 'docs', section: '📚 Documentation', hidden: false },
            { type: 'style', section: '💎 Styles', hidden: true },
            { type: 'chore', section: '🔧 Miscellaneous Chores', hidden: true },
            { type: 'refactor', section: '♻️ Code Refactoring', hidden: false },
            { type: 'test', section: '✅ Tests', hidden: true },
            { type: 'build', section: '📦 Build System', hidden: true },
            { type: 'ci', section: '🔄 Continuous Integration', hidden: true }
          ]
        },
        writerOpts: {
          commitsSort: ['subject', 'scope']
        }
      }
    ],
    '@semantic-release/npm',
    [
      "@semantic-release/github",
      {
        "assets": ["dist/**"]
      }
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md'
      }
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ]
  ]
}; 
