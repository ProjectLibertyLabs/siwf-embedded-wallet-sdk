import { GatewayFetchFn } from "../types";
import { AccountResponse } from "../gateway-types.js";
import { GatewayFetchError } from "../error-types.js";

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
