# Contributing to Hiecom

Thank you for your interest in contributing to Hiecom! We welcome contributions from everyone.

## Table of Contents

- [Ways to Contribute](#ways-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Code Style & Conventions](#code-style--conventions)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Ways to Contribute

We welcome many types of contributions:

- **Bug fixes** - Found a bug? We'd appreciate a fix!
- **New features** - Have an idea? Open an issue first to discuss.
- **Documentation** - Improving docs helps everyone.
- **Tests** - More test coverage is always welcome.
- **Bug reports** - Detailed bug reports help us fix issues faster.
- **Feature requests** - We value your ideas for improvements.

## Development Setup

### Prerequisites

- **Bun** >= 1.3.9 - [Install Bun](https://bun.sh)
- **Node.js** >= 18.0.0

### Clone & Install

```bash
git clone https://github.com/powxenv/hiecom.git
cd hiecom
bun install
```

### Development Commands

```bash
# Format all packages
bun run fmt

# Lint all packages
bun run lint

# Type check all packages
bun run typecheck

# Build all packages
bun run build

# Run tests
bun run test
```

### Package-Specific Commands

```bash
# Work on specific package
bun run fmt:mirror-js
bun run lint:mirror-react
bun run typecheck:realtime
bun run build:testing
```

## Project Structure

```
hiecom/
├── packages/
│   ├── mirror-js/          # Core REST API client (framework-agnostic)
│   ├── mirror-react/       # React hooks with TanStack Query
│   ├── mirror-preact/      # Preact hooks with TanStack Query
│   ├── mirror-solid/       # SolidJS hooks with TanStack Query
│   ├── mirror-shared/      # Shared utilities (internal)
│   ├── realtime/           # WebSocket client for HIP-694 Relay
│   ├── realtime-react/     # React hooks for realtime
│   ├── testing/            # Testing utilities with MSW fixtures
│   └── types/              # Shared TypeScript types (internal)
├── apps/                   # Applications
└── examples/               # Example usage
```

### Internal vs Published Packages

- **Published**: `mirror-js`, `mirror-react`, `mirror-preact`, `mirror-solid`, `realtime`, `realtime-react`, `testing`
- **Internal**: `types`, `mirror-shared` (not published, used only within monorepo)

## Code Style & Conventions

### Formatting

We use **oxfmt** for code formatting:

```bash
bun run fmt          # Format all files
bun run fmt:check    # Check formatting
```

### Linting

We use **oxlint** with TypeScript-aware rules:

```bash
bun run lint         # Lint all files
bun run lint:fix     # Fix linting issues
```

### Type Checking

We use **tsgo** for fast type checking:

```bash
bun run typecheck    # Type check all packages
```

### Code Conventions

- **No comments** - Code should be self-explanatory through naming and structure
- **Functional style** - Prefer pure functions, immutable data
- **Type-safe** - Leverage TypeScript, avoid `any`
- **Explicit imports** - Always import from specific paths, not barrel files for exports

### Example

```typescript
// Good
const getUserBalance = (accountId: string): Promise<bigint> => {
  return api.getBalance(accountId);
};

// Bad
// Get user balance
const get = (id: any) => api.balance(id);
```

## Commit Guidelines

### Commit Message Format

We follow conventional commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Build process or tooling changes

### Examples

```bash
feat(mirror-js): add support for account balance queries
fix(realtime): handle reconnection on network loss
docs(readme): update installation instructions
refactor(types): extract common result types
```

## Pull Request Process

### Before Opening a PR

1. **Check existing issues** - Link to related issues in your PR
2. **Create an issue first** (for large changes) - Discuss before implementing
3. **Branch naming** - Use descriptive names: `feat/add-balance-support`, `fix/reconnection-logic`

### PR Checklist

- [ ] Code follows project conventions
- [ ] `bun run lint` passes
- [ ] `bun run typecheck` passes
- [ ] `bun run fmt` applied
- [ ] Tests added/updated (if applicable)
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow conventional format

### PR Description Template

```markdown
## Summary
Brief description of changes

## Type
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Changes
- List key changes

## Testing
- How was this tested?

## Related Issues
Closes #issue-number
```

## Testing

### Running Tests

```bash
# Run all tests
bun run test

# Run specific package tests
bun run test:testing
```

### Writing Tests

- Tests are located in `__tests__` or `*.test.ts` files
- Use **Bun** built-in test runner
- Mock external dependencies (API calls, WebSocket)
- Test utilities are in `@hiecom/testing`

### Example

```typescript
import { describe, it, expect } from "bun:test";
import { mockAccount } from "@hiecom/testing";

describe("Account API", () => {
  it("returns account balance", async () => {
    const account = mockAccount.build({ balance: 1000 });
    expect(account.balance.balance).toBe(1000);
  });
});
```

## Getting Help

- **GitHub Issues** - For bugs and feature requests
- **Discussions** - For questions and ideas
- **Existing Issues** - Check before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
