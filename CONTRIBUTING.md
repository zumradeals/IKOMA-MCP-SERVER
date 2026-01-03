# Contributing to IKOMA MCP

Thank you for your interest in contributing to IKOMA MCP! This document provides guidelines for contributing to the project.

## 🤝 How to Contribute

### Reporting Issues

If you find a bug or have a feature request:

1. Check if the issue already exists in [GitHub Issues](https://github.com/zumradeals/ikoma-mcpp/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Your environment (OS, Node.js version, Docker version)

### Submitting Changes

1. **Fork the repository**
   ```bash
   git clone https://github.com/zumradeals/ikoma-mcpp.git
   cd ikoma-mcpp
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Test your changes**
   ```bash
   # Install dependencies
   npm ci
   
   # Run TypeScript compilation
   npm run build
   
   # Run tests (if available)
   npm test
   
   # Test Docker build
   docker-compose build
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: Add new capability for X"
   # or
   git commit -m "fix: Resolve issue with Y"
   ```

   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Provide a clear description of your changes

## 📋 Development Guidelines

### Code Style

- Use TypeScript for all source code
- Follow existing naming conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Project Structure

```
ikoma-mcpp/
├── src/
│   ├── core/           # Core capabilities and logic
│   ├── http/           # HTTP server implementation
│   └── mcp/            # MCP protocol implementation
├── scripts/            # Installation and utility scripts
├── docker-compose.yml  # Docker orchestration
└── Dockerfile          # Container definition
```

### Adding New Capabilities

When adding a new capability:

1. Define it in `src/core/capabilities.ts`
2. Follow the existing capability structure
3. Specify required role level
4. Add input validation schema
5. Implement the capability function
6. Update the tool count in README.md
7. Add tests

Example:

```typescript
{
  name: 'your.capability',
  description: 'Clear description of what it does',
  requiredRole: 'operator',
  schema: z.object({
    param: z.string().describe('Parameter description')
  }),
  handler: async (args, context) => {
    // Implementation
    return { success: true, data: result };
  }
}
```

### Security Considerations

- Never expose shell access
- Always validate and sanitize inputs
- Use path confinement for file operations
- Redact secrets in logs
- Follow principle of least privilege

## 🧪 Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Test Docker build locally
- Verify security constraints are maintained

## 📝 Documentation

- Update README.md for user-facing changes
- Update inline code comments
- Add examples for new features
- Update capability count if adding/removing tools

## 🔍 Code Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited in release notes

## 💡 Questions?

If you have questions about contributing:

- Open a discussion in GitHub Issues
- Check existing documentation
- Review similar merged PRs

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make IKOMA MCP better! 🙏
