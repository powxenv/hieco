# Package Sources

Use this file when an agent needs authoritative locations for package docs, repository pages, npm pages, or installed type files.

## `@hieco/wallet`

- GitHub package docs: [packages/wallet on GitHub](https://github.com/powxenv/hieco/tree/main/packages/wallet)
- GitHub repository: [powxenv/hieco](https://github.com/powxenv/hieco)
- npm package page: [@hieco/wallet on npm](https://www.npmjs.com/package/@hieco/wallet)
- npm registry status: unpublished as of 2026-03-08, registry URL returned `404`
- Installed package root: `node_modules/@hieco/wallet`
- Installed docs: `node_modules/@hieco/wallet/README.md`
- Installed types: `node_modules/@hieco/wallet/dist/index.d.ts`
- Installed runtime entry: `node_modules/@hieco/wallet/dist/index.js`

## `@hieco/wallet-react`

- GitHub package docs: [packages/wallet-react on GitHub](https://github.com/powxenv/hieco/tree/main/packages/wallet-react)
- GitHub repository: [powxenv/hieco](https://github.com/powxenv/hieco)
- npm package page: [@hieco/wallet-react on npm](https://www.npmjs.com/package/@hieco/wallet-react)
- npm registry status: unpublished as of 2026-03-08, registry URL returned `404`
- Installed package root: `node_modules/@hieco/wallet-react`
- Installed docs: `node_modules/@hieco/wallet-react/README.md`
- Installed types: `node_modules/@hieco/wallet-react/dist/index.d.ts`
- Installed runtime entry: `node_modules/@hieco/wallet-react/dist/index.js`
- Installed UI subpath types: `node_modules/@hieco/wallet-react/dist/ui/index.d.ts`
- Installed UI subpath runtime: `node_modules/@hieco/wallet-react/dist/ui/index.js`

## Agent Reading Order

1. Read the installed `README.md` for narrative docs.
2. Read the installed `dist/index.d.ts` for exact public signatures and exported types.
3. Use the GitHub package page when examples or changelog context are easier to read in the repository.
