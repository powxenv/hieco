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

**Never assume or hallucinate.** If uncertain about anything, always use these tools.

When encountering errors or unfamiliar APIs:

1. Stop and search for official documentation
2. Verify all assumptions with sources
3. Never guess syntax, parameters, or behavior

## Tool Requirements

Use **bun** and **bunx** exclusively.
Do **NOT** use npm, npx, pnpm, or yarn under any circumstances.

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

## Shared Utilities

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
