# @hieco/utils

`@hieco/utils` is the shared internal toolbox behind the Hieco package family.

It is not a standalone product package and should not be installed directly in external apps. It is where shared types, network helpers, validation utilities, query keys, and error helpers live so the public packages stay aligned.

## Why This Package Exists

Good ecosystems feel consistent because the small rules are shared. This package centralizes those rules for:

- API and pagination types
- Hedera entity validation
- built-in network configuration
- Mirror query key factories
- invalidation helpers used by framework wrappers
- shared error and result utilities

## Who Should Use It

This package is for Hieco maintainers and sibling workspace packages.

If you are consuming Hieco from outside the monorepo, you usually want one of the public packages instead.

## What Lives Here

Shared exports include:

- API result and error types
- entity and network helpers
- Mirror query key factories
- invalidation helpers used by the framework packages

## Packaging Notes

Even though the package is private to the workspace, it follows the same packaging rules as the public packages:

- build output lives in `dist`
- the package exports browser-friendly ESM
- package manifests declare explicit runtime conditions

That keeps internal behavior consistent across SDK, wallet, Mirror, and realtime packages.

## Related Packages

- [`@hieco/mirror`](../mirror/README.md)
- [`@hieco/sdk`](../sdk/README.md)
- [`@hieco/realtime`](../realtime/README.md)
