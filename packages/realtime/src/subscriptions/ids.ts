export type SubscriptionId = string & { readonly __subscriptionId: unique symbol };

export function createSubscriptionId(id: string): SubscriptionId {
  if (typeof id !== "string" || !id) {
    throw new Error("Invalid subscription ID: must be a non-empty string");
  }
  return id as SubscriptionId;
}
