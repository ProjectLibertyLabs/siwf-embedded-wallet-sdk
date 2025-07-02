import { AccountResponse, GatewaySiwfResponse } from "./gateway-types.js";
import { decodeSignedRequest } from "@projectlibertylabs/siwf";
import { getGatewayChainInfo } from "./helpers/gateway.js";
import { GatewayFetchFn, MsaCreationCallbackFn, SignatureFn } from "./types.js";
import { GatewayFetchError } from "./error-types";
import { processLogin } from "./processsLogin";
import { processSignUp } from "./processSignUp";

export async function startSiwf(
  accountId: string,
  signatureFn: SignatureFn,
  gatewayFetchFn: GatewayFetchFn,
  encodedSiwfSignedRequest: string,
  signUpHandle?: string,
  signUpEmail?: string,
  msaCreationCallbackFn?: MsaCreationCallbackFn,
): Promise<GatewaySiwfResponse> {
  const decodedSiwfSignedRequest = decodeSignedRequest(
    encodedSiwfSignedRequest,
  );
  const providerAddress =
    decodedSiwfSignedRequest.requestedSignatures.publicKey.encodedValue;

  const callBackUri =
    decodedSiwfSignedRequest.requestedSignatures.payload.callback;

  const [userAccount, providerAccount, chainInfo] = await Promise.all([
    getAccountForAccountId(gatewayFetchFn, accountId),
    getAccountForAccountId(gatewayFetchFn, providerAddress),
    getGatewayChainInfo(gatewayFetchFn),
  ]);

  if (providerAccount === null) {
    throw new Error("Unable to find provider account!");
  }

  if (!userAccount) {
    // Validate incoming values
    if (!signUpEmail)
      throw new Error("signUpEmail missing for non-existent account.");
    if (!signUpHandle)
      throw new Error("signUpHandle missing for non-existent account.");

    return await processSignUp(
      accountId,
      signatureFn,
      gatewayFetchFn,
      decodedSiwfSignedRequest,
      providerAccount,
      chainInfo,
      signUpHandle,
      msaCreationCallbackFn,
    );
  } else {
    return await processLogin(
      accountId,
      signatureFn,
      gatewayFetchFn,
      callBackUri,
      chainInfo,
    );
  }
}

/**
 * Fetches a user's account information (if present) from Gateway Services
 *
 * @param gatewayFetchFn Callback for performing request to gateway services
 * @param accountId - the public key of the user who wishes to sign in
 * @returns An 'account response' when the user's account exists, and `null` otherwise
 * @throws `GatewayFetchError` when the request fails
 */
export async function getAccountForAccountId(
  gatewayFetchFn: GatewayFetchFn,
  accountId: string,
): Promise<AccountResponse | null> {
  const response = await gatewayFetchFn(
    "GET",
    `/v1/accounts/account/${accountId}`,
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
