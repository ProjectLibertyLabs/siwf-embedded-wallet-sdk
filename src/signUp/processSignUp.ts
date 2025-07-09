import {
  Address,
  GatewayFetchFn,
  MsaCreationCallbackFn,
  SignatureFn,
} from "../types/param-types";
import { SiwfSignedRequest } from "@projectlibertylabs/siwf";
import {
  AccountResponse,
  ChainInfoResponse,
  GatewaySiwfResponse,
} from "../types/response-types";
import { convertSS58AddressToEthereum } from "../helpers/utils";
import { createSignInSiwfResponse } from "../helpers/siwf";
import { pollForAccount, postGatewaySiwf } from "../helpers/gateway";
import { createSignUpPayloads } from "./createSignUpPayloads";

export async function processSignUp(
  accountId: Address,
  signatureFn: SignatureFn,
  gatewayFetchFn: GatewayFetchFn,
  decodedSiwfSignedRequest: SiwfSignedRequest,
  providerAccount: AccountResponse,
  chainInfo: ChainInfoResponse,
  signUpHandle: string,
  signUpEmail: string,
  msaCreationCallbackFn?: MsaCreationCallbackFn,
): Promise<GatewaySiwfResponse> {
  const { payloads, rawCredentials, graphKey, recoverySecret } =
    await createSignUpPayloads(
      chainInfo,
      accountId,
      signatureFn,
      providerAccount,
      decodedSiwfSignedRequest,
      signUpHandle,
      signUpEmail,
    );

  const siwfResponse = await createSignInSiwfResponse(accountId, payloads);

  // Submit to Gateway
  const gatewaySiwfResponse = await postGatewaySiwf(
    gatewayFetchFn,
    siwfResponse,
  );

  // Add secret, graph key and credentials for the complete return value
  const gatewaySiwfResponseWithCredentials: GatewaySiwfResponse = {
    ...gatewaySiwfResponse,
    recoverySecret,
    graphKey,
    rawCredentials,
  };

  // Kick off the msaCallback
  // Don't wait the pollForAccount. Let it complete after the return.
  if (msaCreationCallbackFn) {
    pollForAccount(gatewayFetchFn, accountId, msaCreationCallbackFn);
  }

  return convertSS58AddressToEthereum(gatewaySiwfResponseWithCredentials);
}
