# Best Practices

Canonical docs:

- [`@hieco/sdk` README](https://github.com/powxenv/hieco/tree/main/packages/sdk)
- [`@hieco/react` README](https://github.com/powxenv/hieco/tree/main/packages/react)

## Package Choice

- Prefer `@hieco/react` for React component code.
- Prefer `@hieco/sdk` for server logic, jobs, workers, and framework server entry points.

## Runtime Boundaries

- Keep `hieco.fromEnv()` in server-only code.
- In the browser, use a wallet `Signer`.
- Treat the signer as late-bound session state, not static boot-time configuration.

## Fluent SDK Usage

- Use `.now()` when the task is immediate execution.
- Use `.tx()` when the user needs a transaction descriptor without submitting it.
- Use `.queue()` when the user needs deferred or batch-oriented execution.
- Handle `Result<T>` explicitly with `result.ok` or `unwrap(...)`.

## React Usage

- Start from `HiecoProvider`.
- Keep hooks in components and runtime wiring in providers.
- Use a wallet `Signer` to feed `HiecoProvider signer={signer}` instead of embedding server credentials.
- Prefer the highest-level domain hook that matches the task instead of manually wiring `useHiecoClient()` unless the user needs low-level access.

## Wallet Integration

- `@hieco/react` should receive the resolved signer.
- If the task is mainly about wallet connection, switch to the wallet skill.
- Treat `@hieco/react/appkit` as a legacy compatibility bridge, not the default path for new apps.

## Documentation Style For Answers

- Start from the package the user should install.
- Give a runnable-looking example first.
- Add framework-specific details only when the user mentions a framework.
