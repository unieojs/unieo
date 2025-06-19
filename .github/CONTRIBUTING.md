# Contributing to Unieo

Thank you for your interest in contributing to Unieo! We welcome all types of contributions, including but not limited to:

- 🐛 Bug reports
- ✨ Feature suggestions
- 📝 Documentation improvements
- 🧪 Test cases
- 💻 Code contributions

## Getting Started

Before you begin contributing, please:

1. Read our [Code of Conduct](CODE_OF_CONDUCT.md)
2. Understand the [Developer Certificate of Origin (DCO)](https://developercertificate.org/) requirement - **all commits must be signed off**
3. Check existing [Issues](https://github.com/unieojs/Unieo/issues) and [Pull Requests](https://github.com/unieojs/Unieo/pulls)
4. Understand the project's technical architecture and code style

## Development Environment Setup

### Requirements

- Node.js >= 18.19.0
- We recommend using npm as the package manager

### Local Development

1. Fork this repository
2. Clone to local:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Unieo.git
   cd Unieo
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run tests:
   ```bash
   npm test
   ```

5. Build the project:
   ```bash
   npm run build
   ```

### Development Scripts

- `npm run build` - Build the project (ESM + CJS)
- `npm run lint` - Code style check
- `npm run lint:fix` - Auto-fix code style issues
- `npm run type-check` - TypeScript type checking
- `npm test` - Run tests
- `npm run cov` - Generate test coverage report
- `npm run ci` - Complete CI pipeline

## Code Contribution Workflow

### 1. Create an Issue

For major features or breaking changes, please create an Issue first to discuss:

- Clearly describe the problem or feature request
- Provide relevant context information
- For bugs, provide reproduction steps

### 2. Create a Branch

Create a feature branch based on the `main` branch:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Code Development

#### TypeScript Code Standards

- **Strict Type Checking**: Enable TypeScript strict mode, avoid using `any` type
- **Naming Conventions**:
  - Variables and functions use `camelCase`
  - Classes and interfaces use `PascalCase`
  - Constants use `UPPER_SNAKE_CASE`
  - File names use `kebab-case` or `PascalCase`
- **Comment Standards**:
  - Use clear comments to explain complex logic
  - Use JSDoc format for public APIs
  - Provide usage examples for complex type definitions

#### Code Style

- Follow the project's ESLint configuration
- Use 2-space indentation
- No trailing whitespace
- Keep one empty line at the end of files

#### Architecture Principles

- Follow SOLID principles
- Maintain high cohesion and low coupling
- Prefer composition over inheritance
- Ensure code testability

### 4. Write Tests

- Write corresponding test cases for new features
- Ensure existing tests are not broken
- Maintain reasonable test coverage
- Place test files in the `test/` directory, maintaining the same structure as source code

### 5. Commit Code

#### Developer Certificate of Origin (DCO)

All commits **MUST** be signed off with the Developer Certificate of Origin (DCO). This is a legal requirement to ensure you have the right to contribute your code.

**How to sign off commits:**

1. **Manual sign-off for each commit:**
   ```bash
   git commit -s -m "feat: add new feature"
   ```

2. **Configure automatic sign-off:**
   ```bash
   git config user.name "Your Name"
   git config user.email "your.email@example.com"
   git config commit.gpgsign true  # Optional: GPG signing
   ```

3. **Sign off existing commits retroactively:**
   ```bash
   # For the last commit
   git commit --amend --signoff
   
   # For multiple commits (rebase and sign off)
   git rebase --signoff HEAD~n  # where n is the number of commits
   ```

**What is DCO?**

The DCO is a statement that you have the right to contribute the code and that you understand the licensing implications. Please read the full [DCO text](https://developercertificate.org/) for complete details. When you sign off a commit, you're confirming:

- The contribution was created by you, or you have permission to submit it
- You understand and agree that the contribution will be public
- You understand the contribution is licensed under the project's license

**Commit sign-off format:**

Each commit message must end with a "Signed-off-by" line:
```
feat(core): implement new feature

This commit adds support for custom processors.

Signed-off-by: Your Name <your.email@example.com>
```

**⚠️ Important:** Pull requests with unsigned commits will be rejected. Make sure all your commits are properly signed off before submitting a PR.

#### Commit Message Format

**⚠️ CRITICAL REQUIREMENT: This project uses automated semantic versioning. All commits MUST follow [Conventional Commits](https://www.conventionalcommits.org/) specification exactly, as commit messages directly determine version numbers and release notes.**

**Format:**
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

Signed-off-by: Your Name <your.email@example.com>
```

**Commit Types and Version Impact:**

| Type | Version Impact | Description | Example |
|------|---------------|-------------|---------|
| `feat` | **Minor** (0.X.0) | New feature | `feat(api): add user authentication` |
| `fix` | **Patch** (0.0.X) | Bug fix | `fix(router): resolve path matching issue` |
| `perf` | **Patch** (0.0.X) | Performance improvement | `perf(core): optimize route lookup` |
| `BREAKING CHANGE` | **Major** (X.0.0) | Breaking change | `feat!: redesign public API` |
| `docs` | No version change | Documentation only | `docs: update API reference` |
| `style` | No version change | Code formatting | `style: fix ESLint warnings` |
| `refactor` | No version change | Code refactoring | `refactor(utils): simplify helper functions` |
| `test` | No version change | Adding tests | `test(core): add unit tests for Match` |
| `chore` | No version change | Build/tooling changes | `chore: update dependencies` |
| `ci` | No version change | CI configuration | `ci: add workflow for releases` |
| `build` | No version change | Build system changes | `build: configure webpack` |
| `revert` | Depends on reverted commit | Revert previous commit | `revert: feat(api): add user auth` |

**Breaking Changes:**
For breaking changes, use one of these approaches:
1. Add `!` after type: `feat!: redesign router API`
2. Add `BREAKING CHANGE:` in footer:
   ```
   feat(api): add new authentication method
   
   BREAKING CHANGE: The old auth method is no longer supported.
   Migration guide: replace auth.login() with auth.authenticate()
   ```

**Scope Guidelines:**
- `api`: Public API changes
- `core`: Core router functionality  
- `executor`: Route executors
- `processor`: Route processors
- `utils`: Utility functions
- `types`: TypeScript type definitions
- `docs`: Documentation
- `test`: Testing related
- `ci`: CI/CD related
- `build`: Build system related

**Commit Message Examples:**

✅ **Good Examples:**
```bash
feat(core): add support for custom route processors
fix(executor): handle undefined response headers correctly
perf(router): optimize route matching algorithm by 40%
docs(api): add examples for custom middleware usage
refactor(utils): extract common helper functions
test(processor): add comprehensive unit tests
chore(deps): update semantic-release to v24.2.0

# Breaking change example
feat(api)!: redesign Route constructor signature

BREAKING CHANGE: Route constructor now requires options object instead of individual parameters.

Before: new Route(event, config)
After: new Route({ event, config })

Signed-off-by: John Doe <john@example.com>
```

❌ **Bad Examples:**
```bash
Update files                    # Missing type
fixed bug                       # Missing scope, wrong tense  
Add new feature for users       # Missing type and proper format
WIP: working on router          # WIP commits should not be in main branch
feat add router support         # Missing colon
fix(core) resolve issue         # Missing colon
```

**Automated Validation:**
- This project uses `commitlint` to automatically validate commit messages
- Invalid commit messages will be rejected
- The CI pipeline checks all commits for proper formatting
- Version numbers are automatically generated based on commit types

**Tools to Help:**
- Use `git commit` with `-s` flag for automatic sign-off
- Consider using tools like [Commitizen](https://github.com/commitizen/cz-cli) for guided commit creation
- Install `commitlint` locally: `npm install -g @commitlint/cli @commitlint/config-conventional`

### 6. Create Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a Pull Request on GitHub

3. PR title and description should be clear:
   - Title should briefly describe the changes
   - Description should detail:
     - Motivation and purpose of changes
     - Main changes made
     - Testing status
     - Any breaking changes
     - Related issue numbers

4. Ensure all checks pass:
   - **DCO sign-off check**: All commits must be signed off
   - Code style checks
   - TypeScript type checks
   - All tests pass
   - Test coverage meets requirements

## Documentation Contributions

Documentation improvements are equally important:

- Fix errors or outdated information in documentation
- Improve clarity of existing documentation
- Add examples and use cases
- Translate documentation to other languages

## Bug Reports

When submitting bug reports, please include:

- **Clear Title**: Briefly describe the issue
- **Environment Information**:
  - Node.js version
  - Unieo version
  - Operating system
  - Related dependency versions
- **Reproduction Steps**: Detailed step-by-step instructions
- **Expected Behavior**: Describe what should happen
- **Actual Behavior**: Describe what actually happened
- **Minimal Example**: Provide minimal code that reproduces the issue
- **Relevant Logs**: Error messages, stack traces, etc.

## Feature Requests

When submitting feature requests, please:

- Clearly describe the needed functionality
- Explain why this feature is needed
- Provide use cases and examples
- Consider alternative solutions
- Discuss impact on existing APIs

## Release Process

This project uses automated semantic versioning and publishing via [semantic-release](https://semantic-release.gitbook.io/semantic-release).

### For Maintainers

**Manual Release Trigger:**
1. Go to GitHub Actions → "Release" workflow
2. Click "Run workflow"
3. Select branch (main/beta/alpha/next) and prerelease option
4. The automation handles everything else

**Automated Steps:**
- Version calculation based on commit types
- CHANGELOG.md generation
- Git tag creation  
- GitHub Release with release notes (📋 with emoji categories)
- NPM package publishing
- Documentation updates

**Branch Strategy:**
- `main`: Stable releases (1.0.0, 1.1.0, 2.0.0) or Release Candidates (1.0.0-rc.1)
- `beta`: Beta prereleases (1.0.0-beta.1)
- `alpha`: Alpha prereleases (1.0.0-alpha.1)  
- `next`: Next prereleases (1.0.0-next.1)

**Prerelease Options:**
- From `main` branch: Creates Release Candidates (rc) - stable but not final
- From other branches: Creates branch-specific prereleases

**Requirements:**
- All commits must follow conventional commit format
- NPM_TOKEN must be configured in GitHub Secrets
- Only maintainers can trigger releases

## Getting Help

If you have any questions, you can get help through:

- Create a [GitHub Issue](https://github.com/unieojs/Unieo/issues)
- Check existing [documentation](README.md)
- Participate in [Discussions](https://github.com/unieojs/Unieo/discussions)

## Acknowledgments

Thanks to all developers who contribute to the Unieo project! Your contributions make this project better.

---

Thank you again for your contribution! 🎉 
