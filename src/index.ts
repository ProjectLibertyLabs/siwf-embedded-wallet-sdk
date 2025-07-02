import { AccountResponse, GatewaySiwfResponse } from "./types/response-types";
import { decodeSignedRequest } from "@projectlibertylabs/siwf";
import { getGatewayChainInfo } from "./helpers/gateway.js";
import {
  Address,
  GatewayFetchFn,
  MsaCreationCallbackFn,
  SignatureFn,
} from "./types/param-types";
import { GatewayFetchError } from "./types/error-types";
import { processLogin } from "./helpers/processsLogin";
import { processSignUp } from "./helpers/processSignUp";

/**
 * Executes signIn or signUp on Frequency Gateway based on whether the accountId is associated with an existing account or not.
 *
 * @param accountId - the public key of the user who wishes to sign in
 * @param signatureFn - Callback - Connects your embedded wallet to the SDK
 * @param gatewayFetchFn - Callback - Connects the SDK to your instance of the Frequency Gateway Account Service
 * @param encodedSiwfSignedRequest - Encoded SIWF signed request string
 * @param signUpHandle - (New Users Only) Handle to register
 * @param signUpEmail (New Users Only) User's email for recovery setup
 * @param msaCreationCallbackFn - Callback - Called when the MSA Id is claimed
 * @returns 'GatewaySiwfResponse' on login or sign up
 * @throws `GatewayFetchError` or `Error` when the request fails
 */
export async function startSiwf(
  accountId: Address,
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
