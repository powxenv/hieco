# @hieco/utils

`@hieco/utils` is the shared internal toolbox behind the Hieco package family.

It is not a standalone product package. It is the place where shared types, network helpers, validation utilities, and Mirror query helpers live so the public packages can stay consistent.

## Why This Package Exists

Good ecosystems feel consistent because the small rules are shared. This package centralizes those rules for:

- API and pagination types
- Hedera entity validation
- network configuration helpers
- Mirror query keys and invalidation helpers
- shared error normalization

## Who Should Use It

This package is for Hieco maintainers and sibling workspace packages.

If you are consuming Hieco from outside the monorepo, you usually want one of the public packages instead.

## Installation

Add it as a workspace dependency from another package in this repo:

```bash
bun add @hieco/utils --cwd packages/<package-name>
```

## Quick Start

```ts
import {
  ApiErrorFactory,
  NETWORK_CONFIGS,
  isValidEntityId,
  mirrorNodeKeys,
} from "@hieco/utils";

const tokenId = "0.0.2001";
const key = mirrorNodeKeys.token.info("testnet", tokenId);
const error = ApiErrorFactory.notFound("Token not found");

console.log(isValidEntityId(tokenId));
console.log(NETWORK_CONFIGS.testnet.mirrorNode);
console.log(key);
console.log(error);
```

## What Lives Here

Shared exports include:

- API result and error types
- entity and network helpers
- Mirror query key factories
- invalidation helpers used by the framework packages

## Notes

- The package is private to the workspace.
- Public packages depend on it so behavior stays aligned across SDK, Mirror, realtime, and wallet layers.

## Related Packages

- [`@hieco/mirror`](../mirror/README.md)
- [`@hieco/sdk`](../sdk/README.md)
- [`@hieco/realtime`](../realtime/README.md)
