import { GatewayFetchFn, MsaCreationCallbackFn } from "../types"
import { AccountResponse, GatewaySiwfResponse } from "../gateway-types.js";
import { GatewayFetchError } from "../error-types.js";
import { stringToBase64URL } from "src/base64url";
import { SiwfResponse } from "src/siwf-types";

/**
 * Fetches a user's account information (if present) from Gateway Services
 *
 * @param gatewayFetchFn Callback for performing request to gateway services
 * @param userAddress - the public key of the user who wishes to sign in
 * @returns An 'account response' when the user's account exists, and `null` otherwise
 * @throws `GatewayFetchError` when the request fails
 */
export async function getGatewayAccount(
  gatewayFetchFn: GatewayFetchFn,
  userAddress: string,
): Promise<AccountResponse | null> {
  const response = await gatewayFetchFn(
    "GET",
    `/v1/accounts/account/${userAddress}`,
  );

  if (response.ok) {
    return (await response.json()) as AccountResponse;
  } else {
    switch (response.status) {
      case 404:
        return null; // The user does not (yet) exist on chain
      default:
        throw new GatewayFetchError(
          "Failed GatewayFetchFn for GET Account",
          response,
        );
    }
  }
}

export async function postGatewaySiwf(
  gatewayFetchFn: GatewayFetchFn,
  siwfResponse: SiwfResponse,
): Promise<GatewaySiwfResponse> {
  const response = await gatewayFetchFn(
    "POST",
    "/v2/accounts/siwf",
    { authorizationPayload: stringToBase64URL(JSON.stringify(siwfResponse)) }
  );

  if (response.ok) {
    const parsedResponse = response.json();
    return parsedResponse;
  } else {
    throw new GatewayFetchError(
      "Failed GatewayFetchFn for POST siwf",
      response,
    )
  };
}

export async function poll<T>(
  fn: () => Promise<T>,
  delaySeconds: number, // Time between requests
  timeoutSeconds: number,
  epochMillisSupplier: () => number = Date.now
): Promise<T> {
  let attempt = 0;
  const startEpochMillis = epochMillisSupplier()
  const timeoutEpochMillies = startEpochMillis + (timeoutSeconds * 1000)

  while (epochMillisSupplier() < timeoutEpochMillies) {
    attempt++

    try {
      const result = await fn()
      return result
    } catch (e: unknown) {
      console.log(`[poll] Attempt ${attempt} failed: ${e}`)
    }

    await new Promise((r) => setTimeout(r, delaySeconds * 1000));
  }

  throw new Error(`Operation timed out after ${attempt} attempts over ${timeoutSeconds} seconds.`)
}

export async function pollForAccount(
  gatewayFetchFn: GatewayFetchFn,
  userAddress: string,
  msaCreationCallbackFn: MsaCreationCallbackFn,
  requestDelaySeconds: number = 5,
  timeoutSeconds: number = 600
) {
  const response = await poll(
    async () => {
      const account = await getGatewayAccount(gatewayFetchFn, userAddress);
      if (account === null) {
        throw Error("Account does not (yet) exist.")
      } else {
        return account
      }
    },
    requestDelaySeconds,
    timeoutSeconds,
  )

  msaCreationCallbackFn(response);
}
