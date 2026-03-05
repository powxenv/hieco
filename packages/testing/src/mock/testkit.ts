import type { Snapshot } from "../types/hiero.js";
import type { Fixtures } from "../fixtures/sdk/index.js";
import { MockHieroClient } from "./client.js";
import { createFixtures } from "../fixtures/sdk/index.js";

export interface TestKit {
  readonly client: MockHieroClient;
  readonly fixtures: Fixtures;
  snapshot: () => Snapshot;
  restore: (snapshot: Snapshot) => void;
  reset: () => void;
}

export function createTestKit(): TestKit {
  const client = new MockHieroClient();
  const fixtures = createFixtures(client);

  return {
    client,
    fixtures,

    snapshot: () => {
      return client.snapshot.capture(client);
    },

    restore: (snapshot: Snapshot) => {
      client.snapshot.restore(client, snapshot);
    },

    reset: () => {
      client.reset();
    },
  };
}
