# Package Sources

Use this file when an agent needs authoritative locations for package docs, repository pages, npm pages, or installed type files.

## `@hieco/sdk`

- GitHub package docs: [packages/sdk on GitHub](https://github.com/powxenv/hieco/tree/main/packages/sdk)
- GitHub repository: [powxenv/hieco](https://github.com/powxenv/hieco)
- npm package page: [@hieco/sdk on npm](https://www.npmjs.com/package/@hieco/sdk)
- npm registry status: unpublished as of 2026-03-08, registry URL returned `404`
- Installed package root: `node_modules/@hieco/sdk`
- Installed docs: `node_modules/@hieco/sdk/README.md`
- Installed types: `node_modules/@hieco/sdk/dist/index.d.ts`
- Installed runtime entry: `node_modules/@hieco/sdk/dist/index.js`

## `@hieco/react`

- GitHub package docs: [packages/react on GitHub](https://github.com/powxenv/hieco/tree/main/packages/react)
- GitHub repository: [powxenv/hieco](https://github.com/powxenv/hieco)
- npm package page: [@hieco/react on npm](https://www.npmjs.com/package/@hieco/react)
- npm registry status: unpublished as of 2026-03-08, registry URL returned `404`
- Installed package root: `node_modules/@hieco/react`
- Installed docs: `node_modules/@hieco/react/README.md`
- Installed types: `node_modules/@hieco/react/dist/index.d.ts`
- Installed runtime entry: `node_modules/@hieco/react/dist/index.js`

## `@hieco/react/appkit`

- GitHub package docs: [packages/react on GitHub](https://github.com/powxenv/hieco/tree/main/packages/react)
- GitHub repository: [powxenv/hieco](https://github.com/powxenv/hieco)
- npm package page: [@hieco/react on npm](https://www.npmjs.com/package/@hieco/react)
- npm registry status: unpublished as of 2026-03-08, registry URL returned `404`
- Installed subpath types: `node_modules/@hieco/react/dist/appkit/index.d.ts`
- Installed subpath runtime: `node_modules/@hieco/react/dist/appkit/index.js`

## Agent Reading Order

1. Read the installed `README.md` for narrative docs.
2. Read the installed `dist/index.d.ts` for exact public signatures and exported types.
3. Use the GitHub package page when examples or changelog context are easier to read in the repository.
