# Agent Instructions

This file contains instructions for AI agents working on this project.

## Critical Rules

**Every time a user asks a question or requests code changes, you MUST use the following tools:**

- Web search (via tavily mcp tools):
  - `tavily_tavily_search` - Web search with filters
  - `tavily_tavily_extract` - Extract content from URLs
  - `tavily_tavily_crawl` - Crawl website with depth control
  - `tavily_tavily_map` - Map website structure
  - `tavily_tavily_research` - AI-powered deep research
- Context7 documentation:
  - `context7_resolve-library-id` - Resolve package name to Context7 library ID
  - `context7_query-docs` - Query official documentation with examples
- Code search:
  - `grep` - Search file contents with regex
  - `grep_searchGitHub` - Search real-world code from GitHub repositories

**Never assume or hallucinate.** Only use external tools when necessary.

When encountering errors or unfamiliar APIs:

1. **For installed libraries in node_modules:**
   - Check the library source code directly in `node_modules/<package-name>`
   - Read the README, types, or source files to understand usage
   - Do NOT use MCP servers for libraries that are already installed

2. **For external libraries or new dependencies:**
   - Only search the internet when you genuinely need external information
   - Use MCP tools for official documentation when unavailable locally
   - Never guess syntax, parameters, or behavior

**Do NOT search the internet for:**

- Basic programming concepts
- Common language features
- Information available in the codebase
- Things you can determine by reading the code or types

## Tool Requirements

For **internal development only**, use **bun** and **bunx** exclusively.
Do **NOT** use npm, npx, pnpm, or yarn for internal development.

For **documentation** or **packages distributed to users**:
- Always provide support for **npm, pnpm, yarn, and bun**
- Include both **npx** and **bunx** as runnners
- Do not assume users will use bun

For any package intended to be published to npm:

- The `files` field must include publish artifacts only, centered on `dist`
- Do **NOT** add `src` to `files` to work around local workspace resolution
- Public package entry fields such as `main`, `module`, `types`, `typings`, and `exports` must point to built files in `dist`
- If local workspace development breaks, fix the build or package metadata correctly; do not publish source files as a shortcut
- Do **NOT** use TypeScript `paths`, Vite aliases, direct file imports, or similar shortcuts to point one workspace package at another
- Workspace packages must resolve each other through Bun workspaces, package manifests, and normal package imports only

## Code Quality Tools

All packages **MUST** use these tools:

- **Linter**: `oxlint` (from `oxlint` package)
- **Formatter**: `oxfmt` (from `oxlint` package)
- **Typecheck**: `tsgo` (from `@typescript/native-preview` package)

**DO NOT use** `tsc` from the `typescript` package for type checking.

## Plan Mode

When operating in Plan Mode:

- Produce concise, execution-focused plans.
- Clarity is required; verbosity is not.
- Do not include explanations, prose, or filler.
- Output only concrete steps.
- Every plan **MUST** end with a section titled **"Unresolved Questions"**.
- Include only questions that materially block execution.
- If there are no blockers, explicitly write:

  **Unresolved Questions: None.**

Failure to follow this structure is not allowed.

## Code Style & Generation Rules

All generated code must follow these rules:

- Code must be self-explanatory.
- Do not use comments.
- Intent must be expressed through naming, structure, and composition only.

Strict consistency is required across:

- File structure
- Module boundaries
- Naming conventions
- Architectural patterns

Before writing any code:

- Explore the existing project.
- Understand the directory layout, conventions, abstractions, and dependency patterns.

## Type Safety Requirements

All code must be **100% type safe** without exceptions:

- **NEVER use `any`** - Use `unknown` with proper type guards instead
- **NEVER use unsafe type casting** - Use type guards, discriminated unions, or generics
- **NEVER use `@ts-ignore` or `@ts-expect-error`** unless absolutely necessary and documented
- **ALWAYS use explicit types** for function parameters and return types
- **ALWAYS prefer strict null checks**
- **ALWAYS use discriminated unions** for union types with different shapes
- **ALWAYS validate external data** (API responses, user input) with runtime type checking (zod, valibot, etc.)
- **ALWAYS ensure end-to-end type safety** from API to UI components

## Software Engineering Principles

Apply these principles in all code:

### SOLID

- **S**ingle Responsibility: Each module/class/function does one thing well
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes must be substitutable for their base types
- **I**nterface Segregation: Prefer small, focused interfaces
- **D**ependency Inversion: Depend on abstractions, not concrete implementations

### KISS (Keep It Simple, Stupid)

- Write simple, readable code
- Avoid unnecessary complexity
- Solve the problem directly, not abstractly

### YAGNI (You Aren't Gonna Need It)

- Don't add functionality until it's actually needed
- Avoid premature abstraction
- Refactor when necessity arises

### DRY (Don't Repeat Yourself)

- Extract duplicated logic into reusable functions/modules
- Use shared utilities for common operations
- Avoid code duplication across packages

## Shared Utilities

**DO NOT modify files in `@apps/web/src/components/ui/`**. This directory contains shadcn UI components and should not be edited directly.

Before creating utilities in any package:

1. **Check existing shared packages:**

- `@hieco/utils` - Common types and Mirror Node utilities

2. **Prevent duplication:**
   - Search existing codebase before creating new utilities
   - Reuse existing utilities from shared packages

3. **Create shared packages when:**
   - Utility is used across 2+ packages
   - Domain-specific logic should be isolated
   - Type definitions are shared between packages

## Quality Check

Before committing or completing any task, run the quality check script:

```bash
bun run lint && bun run typecheck && bun run fmt
```

This runs linting, type checking, and formatting in sequence.

To run quality checks for a specific package:

```bash
bun run lint:mirror-cli && bun run typecheck:mirror-cli && bun run fmt:mirror-cli
bun run lint:mirror && bun run typecheck:mirror && bun run fmt:mirror
bun run lint:mirror-react && bun run typecheck:mirror-react && bun run fmt:mirror-react
bun run lint:mirror-preact && bun run typecheck:mirror-preact && bun run fmt:mirror-preact
bun run lint:mirror-solid && bun run typecheck:mirror-solid && bun run fmt:mirror-solid
bun run lint:realtime && bun run typecheck:realtime && bun run fmt:realtime
bun run lint:realtime-react && bun run typecheck:realtime-react && bun run fmt:realtime-react
bun run lint:testing && bun run typecheck:testing && bun run fmt:testing
bun run lint:types && bun run typecheck:types && bun run fmt:types && bun --filter '@hiecom/types' test
bun run lint:mirror-shared && bun run typecheck:mirror-shared && bun run fmt:mirror-shared && bun --filter '@hiecom/mirror-shared' test
```
