# @hieco/utils

Shared internal utilities and TypeScript types for hieco packages.

## Groups

- **Types** - API primitives, network types, entity identifiers
- **Mirror Utilities** - Entity ID helpers, query keys, query helpers, type guards, network config

## Usage in This Monorepo

This package is internal and not published. Use workspace references in dependent
packages:

```json
{
  "dependencies": {
    "@hieco/utils": "workspace:*"
  }
}
```

## Usage

```ts
import { NETWORK_CONFIGS, ApiErrorFactory, isValidEntityId, mirrorNodeKeys } from "@hieco/utils";
```

## License

MIT
