# Changesets

Add a changeset when a pull request changes the behavior, API, or package metadata of a publishable package.

```bash
bun run changeset
```

Apply queued version updates:

```bash
bun run release:version
```

Publish changed packages after the version commit is merged:

```bash
bun run release
```
