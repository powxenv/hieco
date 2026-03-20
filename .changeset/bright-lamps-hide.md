---
"@hieco/utils": patch
"@hieco/mirror": patch
"@hieco/mirror-cli": patch
"@hieco/mirror-mcp": patch
"@hieco/mirror-preact": patch
"@hieco/mirror-react": patch
"@hieco/mirror-solid": patch
"@hieco/react": patch
"@hieco/realtime": patch
"@hieco/realtime-react": patch
"@hieco/sdk": patch
"@hieco/wallet": patch
"@hieco/wallet-react": patch
---

Normalize package metadata and release tooling for npm publishing from the monorepo. This makes shared internal dependencies publish-safe, promotes `@hieco/utils` to a public package, and adds the initial Changesets-based release workflow.
