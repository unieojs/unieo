/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    // Dynamic main branch configuration based on environment variable
    process.env.SEMANTIC_RELEASE_RC === 'true' 
      ? { name: 'main', prerelease: 'rc' }
      : 'main',
    {
      name: 'next',
      prerelease: true
    },
    {
      name: 'beta',
      prerelease: true
    },
    {
      name: 'alpha',
      prerelease: true
    }
  ],
  plugins: [
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