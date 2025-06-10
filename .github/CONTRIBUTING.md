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
2. Check existing [Issues](https://github.com/unieojs/Unieo/issues) and [Pull Requests](https://github.com/unieojs/Unieo/pulls)
3. Understand the project's technical architecture and code style

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

4. Ensure CI checks pass:
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
