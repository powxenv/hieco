export const packageOptions = [
  "Hieco Mirror",
  "Hieco Mirror CLI",
  "Hieco Mirror MCP",
  "Hieco Mirror Preact",
  "Hieco Mirror React",
  "Hieco Mirror Solid",
  "Hieco React",
  "Hieco Realtime",
  "Hieco Realtime React",
  "Hieco SDK",
  "Hieco Wallet",
  "Hieco Wallet React",
  "Hiero SDK",
] as const;

export const useCaseOptions = [
  "Payments",
  "Tokenized Loyalty",
  "NFT Marketplace",
  "Gaming",
  "Wallet Infrastructure",
  "Onchain Identity",
  "DAO Tools",
  "DeFi",
  "Social",
  "Real World Assets",
  "Supply Chain",
  "Developer Tools",
] as const;

export type PackageOption = (typeof packageOptions)[number];
export type UseCaseOption = (typeof useCaseOptions)[number];

export function isPackageOption(value: string): value is PackageOption {
  return packageOptions.some((option) => option === value);
}

export function isUseCaseOption(value: string): value is UseCaseOption {
  return useCaseOptions.some((option) => option === value);
}
