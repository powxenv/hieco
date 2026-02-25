# Agent Instructions

This file contains instructions for AI agents working on this project.

## Critical Rules

**Every time a user asks a question or requests code changes, you MUST use the following tools:**

- Web search (via exa mcp tools):
  - `exa_web_search_exa` - General web search
  - `exa_crawling_exa` - Fetch full content from a specific URL
  - `exa_people_search_exa` - Find professional profiles
  - `exa_company_research_exa` - Research company information
  - `exa_deep_researcher_start` / `exa_deep_researcher_check` - AI-powered deep research
  - `exa_web_search_advanced_exa` - Advanced search with filters
  - `exa_get_code_context_exa` - Find code examples and documentation
  - `webfetch` - Fetch URL content (markdown/text/html)
  - `codesearch` - Search for programming solutions
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

## Quality Check

Before committing or completing any task, run the quality check script:

```bash
bun run lint && bun run typecheck && bun run fmt
```

This runs linting, type checking, and formatting in sequence.

To run quality checks for a specific package:

```bash
bun run lint:mirror-js && bun run typecheck:mirror-js && bun run fmt:mirror-js
bun run lint:mirror-react && bun run typecheck:mirror-react && bun run fmt:mirror-react
bun run lint:mirror-solid && bun run typecheck:mirror-solid && bun run fmt:mirror-solid
bun run lint:mirror-preact && bun run typecheck:mirror-preact && bun run fmt:mirror-preact
bun run lint:mirror-shared && bun run typecheck:mirror-shared && bun run fmt:mirror-shared
```

