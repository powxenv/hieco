# Package Sources

Use this file when an agent needs authoritative package locations for docs, npm pages, or installed type files.

## `@hieco/realtime`

- GitHub package docs: [packages/realtime on GitHub](https://github.com/powxenv/hieco/tree/main/packages/realtime)
- GitHub repository: [powxenv/hieco](https://github.com/powxenv/hieco)
- npm package page: [@hieco/realtime on npm](https://www.npmjs.com/package/@hieco/realtime)
- Installed package root: `node_modules/@hieco/realtime`
- Installed docs: `node_modules/@hieco/realtime/README.md`
- Installed types: `node_modules/@hieco/realtime/dist/index.d.ts`
- Installed runtime entry: `node_modules/@hieco/realtime/dist/index.js`

## `@hieco/realtime-react`

- GitHub package docs: [packages/realtime-react on GitHub](https://github.com/powxenv/hieco/tree/main/packages/realtime-react)
- GitHub repository: [powxenv/hieco](https://github.com/powxenv/hieco)
- npm package page: [@hieco/realtime-react on npm](https://www.npmjs.com/package/@hieco/realtime-react)
- Installed package root: `node_modules/@hieco/realtime-react`
- Installed docs: `node_modules/@hieco/realtime-react/README.md`
- Installed types: `node_modules/@hieco/realtime-react/dist/index.d.ts`
- Installed runtime entry: `node_modules/@hieco/realtime-react/dist/index.js`

## Agent Reading Order

1. Read the installed `README.md` for lifecycle patterns and examples.
2. Read `dist/index.d.ts` for exact client, pool, provider, and hook signatures.
3. Read `package.json` when the task depends on export conditions or peer dependencies.
4. Use the GitHub package docs when the repository examples are easier to summarize there.
