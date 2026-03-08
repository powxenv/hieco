# Best Practices

Canonical docs:

- [`@hieco/mirror` README](https://github.com/powxenv/hieco/tree/main/packages/mirror)
- Framework wrapper READMEs linked from the package selection reference

## Start From The Core Domain

- Use `@hieco/mirror` when the task is not framework-specific.
- In frameworks, still reason from the core domain method first, then map it to the wrapper hook or query function.

## Pagination

- Use one-shot methods for simple lookups.
- Use paginated list methods when the user needs filterable pages.
- Use cursor paginators or infinite hooks when the task needs full traversal or endless-scroll UI behavior.

## Result Handling

- Mirror responses use `ApiResult<T>`.
- Keep success and failure handling explicit.
- Do not assume `data` exists without checking `success`.

## Network Configuration

- Built-in networks work without extra mapping.
- Custom network names must have explicit URLs.
- Wrapper providers fail immediately for unresolved custom networks. Keep examples honest about that.

## Framework Guidance

- React and Preact wrappers expose hook families.
- Solid exposes `create*` query functions instead of React-style hooks.
- Keep examples framework-native instead of forcing a single abstraction across all wrappers.
