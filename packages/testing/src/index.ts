// Server (Mock Mirror Node API)
export * from "./server/setup.js";
export * from "./server/constants.js";
export * from "./server/handlers.js";

// Fixtures (test data)
export * from "./fixtures/index.js";
export * as fixtures from "./fixtures/index.js";

// Mock client & testkit
export * from "./mock/index.js";

// Matchers (core implementations, not framework-specific)
export * from "./matchers/core/index.js";

// Utilities
export * from "./utils/index.js";

// Types
export * from "./types/config.js";
export * from "./types/hiero.js";
export * from "./types/matcher.js";

// Legacy exports for backward compatibility
export { mockBlock } from "./fixtures/mirror/block.js";
export { state } from "./fixtures/mirror/state.js";
export { stakingAccountBuilder, mockStakedAccount } from "./fixtures/mirror/staking.js";
