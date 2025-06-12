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

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation updates
- `style`: Code formatting (changes that don't affect code execution)
- `refactor`: Refactoring (code changes that neither fix bugs nor add features)
- `test`: Adding tests
- `chore`: Build process or auxiliary tool changes
- `perf`: Performance optimization
- `ci`: CI configuration files and script changes

**Example:**
```
feat(executor): add custom executor support

Add ability to register custom executors for extending router functionality.

Closes #123
```

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

Project maintainers are responsible for version releases:

1. Update version numbers (following [Semantic Versioning](https://semver.org/))
2. Update CHANGELOG.md
3. Create Git tags
4. Publish to npm

## Getting Help

If you have any questions, you can get help through:

- Create a [GitHub Issue](https://github.com/unieojs/Unieo/issues)
- Check existing [documentation](README.md)
- Participate in [Discussions](https://github.com/unieojs/Unieo/discussions)

## Acknowledgments

Thanks to all developers who contribute to the Unieo project! Your contributions make this project better.

---

Thank you again for your contribution! 🎉 
