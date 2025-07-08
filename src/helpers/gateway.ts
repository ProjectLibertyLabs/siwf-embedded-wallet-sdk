import { GatewayFetchFn, MsaCreationCallbackFn } from "../types/param-types";
import {
  ChainInfoResponse,
  GatewaySiwfResponse,
} from "../types/response-types";
import { GatewayFetchError } from "../types/error-types";
import { stringToBase64URL } from "./base64url";
import { getAccountForAccountId } from "../index";
import { SiwfResponse } from "@projectlibertylabs/siwf";

/**
 * Fetches the chain info (with current block number) via Gateway
 */
export async function getGatewayChainInfo(
  gatewayFetchFn: GatewayFetchFn,
): Promise<ChainInfoResponse> {
  const response = await gatewayFetchFn("GET", `/v1/frequency/blockinfo`);

  if (response.ok) {
    return (await response.json()) as ChainInfoResponse;
  } else {
    throw new GatewayFetchError(
      "Failed GatewayFetchFn for GET BlockInfo",
      response,
    );
  }
}

export async function postGatewaySiwf(
  gatewayFetchFn: GatewayFetchFn,
  siwfResponse: SiwfResponse,
): Promise<GatewaySiwfResponse> {
  const response = await gatewayFetchFn("POST", "/v2/accounts/siwf", {
    authorizationPayload: stringToBase64URL(JSON.stringify(siwfResponse)),
  });

  if (response.ok) {
    return response.json();
  } else {
    throw new GatewayFetchError(
      "Failed GatewayFetchFn for POST siwf",
      response,
    );
  }
}

export async function poll<T>(
  fn: () => Promise<T>,
  delaySeconds: number, // Time between requests
  timeoutSeconds: number,
  epochMillisSupplier: () => number = Date.now,
): Promise<T> {
  let attempt = 0;
  const startEpochMillis = epochMillisSupplier();
  const timeoutEpochMillis = startEpochMillis + timeoutSeconds * 1000;

  while (epochMillisSupplier() < timeoutEpochMillis) {
    attempt++;

    try {
      return await fn();
    } catch (e: unknown) {
      console.log(`[poll] Attempt ${attempt} failed: ${e}`);
    }

    await new Promise((r) => setTimeout(r, delaySeconds * 1000));
  }

  throw new Error(
    `Operation timed out after ${attempt} attempts over ${timeoutSeconds} seconds.`,
  );
}

export async function pollForAccount(
  gatewayFetchFn: GatewayFetchFn,
  accountId: string,
  msaCreationCallbackFn: MsaCreationCallbackFn,
  requestDelaySeconds: number = 5,
  timeoutSeconds: number = 600, // 10 minutes
) {
  const response = await poll(
    async () => {
      const account = await getAccountForAccountId(gatewayFetchFn, accountId);
      if (account === null) {
        throw Error("Account does not (yet) exist.");
      } else {
        return account;
      }
    },
    requestDelaySeconds,
    timeoutSeconds,
  );

  msaCreationCallbackFn(response);
}
