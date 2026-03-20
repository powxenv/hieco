# @hieco/utils

`@hieco/utils` is the shared toolbox behind the Hieco package family.

It is the low-level package where shared types, network helpers, validation utilities, query keys, and error helpers live so the rest of the package family stays aligned.

## Why This Package Exists

Good ecosystems feel consistent because the small rules are shared. This package centralizes those rules for:

- API and pagination types
- Hedera entity validation
- built-in network configuration
- Mirror query key factories
- invalidation helpers used by framework wrappers
- shared error and result utilities

## Who Should Use It

Most Hieco consumers will want one of the higher-level packages instead.

This package exists mainly for maintainers, framework wrappers, and advanced consumers that want the low-level shared primitives directly.

## What Lives Here

Shared exports include:

- API result and error types
- entity and network helpers
- Mirror query key factories
- invalidation helpers used by the framework packages

## Packaging Notes

This package follows the same packaging rules as the rest of the public package family:

- build output lives in `dist`
- the package exports browser-friendly ESM
- package manifests declare explicit runtime conditions

That keeps behavior consistent across SDK, wallet, Mirror, and realtime packages.

## Related Packages

- [`@hieco/mirror`](../mirror/README.md)
- [`@hieco/sdk`](../sdk/README.md)
- [`@hieco/realtime`](../realtime/README.md)
