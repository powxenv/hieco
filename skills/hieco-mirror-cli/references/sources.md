# Package Sources

Use this file when an agent needs authoritative package locations for docs, npm pages, or installed package files.

## `@hieco/mirror-cli`

- GitHub package docs: [packages/mirror-cli on GitHub](https://github.com/powxenv/hieco/tree/main/packages/mirror-cli)
- GitHub repository: [powxenv/hieco](https://github.com/powxenv/hieco)
- npm package page: [@hieco/mirror-cli on npm](https://www.npmjs.com/package/@hieco/mirror-cli)
- npm registry status: unpublished as of 2026-03-08, registry URL returned `404`
- Installed package root: `node_modules/@hieco/mirror-cli`
- Installed docs: `node_modules/@hieco/mirror-cli/README.md`
- Installed package metadata: `node_modules/@hieco/mirror-cli/package.json`
- Installed runtime entry: `node_modules/@hieco/mirror-cli/dist/index.js`

## Binary Contract

- Installed binary name: `hieco`
- `package.json` `bin` mapping: `"hieco": "./dist/index.js"`
- Package help entrypoint: `hieco --help`

## Agent Reading Order

1. Read the installed `README.md` for the narrative docs and command examples.
2. Read the installed `package.json` for the binary name and package metadata.
3. Read `dist/index.js` when you need the exact command registration, argument list, or option names.
4. Use the GitHub package page when examples or package context are easier to read in the repository.
