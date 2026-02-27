import { http, HttpResponse, type HttpHandler } from "msw";
import type { NetworkType } from "../types/config.js";
import type { AccountInfo, Transaction, TokenInfo, AccountBalance } from "@hieco/mirror-js";
import { NETWORK_URLS } from "./constants.js";

const buildUrl = (network: NetworkType, path: string): string =>
  `${NETWORK_URLS[network]}/api/v1${path}`;

const createListHandler = <T>(
  network: NetworkType,
  endpoint: string,
  items: readonly T[],
  key: string,
): HttpHandler =>
  http.get(buildUrl(network, endpoint), () => {
    return HttpResponse.json({
      [key]: items.slice(0, 25),
      links: { next: null },
    });
  });

export const createAccountHandler = (network: NetworkType, account: AccountInfo): HttpHandler =>
  http.get(buildUrl(network, "/accounts/:id"), ({ params }) => {
    if (params.id === account.account) {
      return HttpResponse.json(account);
    }
    return HttpResponse.json({ error: "not_found" }, { status: 404 as const });
  });

export const createAccountsListHandler = (
  network: NetworkType,
  accounts: readonly AccountInfo[],
): HttpHandler => createListHandler(network, "/accounts", accounts, "accounts");

export const createTransactionHandler = (
  network: NetworkType,
  transaction: Transaction,
): HttpHandler =>
  http.get(buildUrl(network, "/transactions/:id"), ({ params }) => {
    if (params.id === transaction.transaction_id) {
      return HttpResponse.json(transaction);
    }
    return HttpResponse.json({ error: "not_found" }, { status: 404 as const });
  });

export const createTransactionsListHandler = (
  network: NetworkType,
  transactions: readonly Transaction[],
): HttpHandler => createListHandler(network, "/transactions", transactions, "transactions");

export const createTokenHandler = (network: NetworkType, token: TokenInfo): HttpHandler =>
  http.get(buildUrl(network, "/tokens/:id"), ({ params }) => {
    if (params.id === token.token_id) {
      return HttpResponse.json(token);
    }
    return HttpResponse.json({ error: "not_found" }, { status: 404 as const });
  });

export const createTokensListHandler = (
  network: NetworkType,
  tokens: readonly TokenInfo[],
): HttpHandler => createListHandler(network, "/tokens", tokens, "tokens");

export const createBalanceHandler = (network: NetworkType, balance: AccountBalance): HttpHandler =>
  http.get(buildUrl(network, "/balances/:id"), ({ params }) => {
    if (params.id === balance.account) {
      return HttpResponse.json({
        balances: [balance],
        timestamp: Date.now().toString(),
      });
    }
    return HttpResponse.json({ error: "not_found" }, { status: 404 as const });
  });

export const createBalancesListHandler = (
  network: NetworkType,
  balances: readonly AccountBalance[],
): HttpHandler =>
  http.get(buildUrl(network, "/balances"), () => {
    return HttpResponse.json({
      balances: balances.slice(0, 25),
      timestamp: Date.now().toString(),
      links: { next: null },
    });
  });

export interface FixtureHandlersOptions {
  readonly network: NetworkType;
  readonly accounts?: readonly AccountInfo[];
  readonly transactions?: readonly Transaction[];
  readonly tokens?: readonly TokenInfo[];
  readonly balances?: readonly AccountBalance[];
}

export const createFixtureHandlers = (options: FixtureHandlersOptions): HttpHandler[] => {
  const handlers: HttpHandler[] = [];

  if (options.accounts) {
    for (const account of options.accounts) {
      handlers.push(createAccountHandler(options.network, account));
    }
    handlers.push(createAccountsListHandler(options.network, options.accounts));
  }

  if (options.transactions) {
    for (const transaction of options.transactions) {
      handlers.push(createTransactionHandler(options.network, transaction));
    }
    handlers.push(createTransactionsListHandler(options.network, options.transactions));
  }

  if (options.tokens) {
    for (const token of options.tokens) {
      handlers.push(createTokenHandler(options.network, token));
    }
    handlers.push(createTokensListHandler(options.network, options.tokens));
  }

  if (options.balances) {
    for (const balance of options.balances) {
      handlers.push(createBalanceHandler(options.network, balance));
    }
    handlers.push(createBalancesListHandler(options.network, options.balances));
  }

  return handlers;
};
