import { AccountResponse } from "./response-types";
import { CAIP122, EIP712 } from "./signed-document-types";

//
// accountId param
//
export type Address = string;

//
// signatureFn param
//
// Matches https://docs.metamask.io/wallet/reference/provider-api/#request
export type SignatureFn = (request: CAIP122 | EIP712) => Promise<string>;

//
// gatewayFetchFn param
//
interface GatewayFetchBody {
  authorizationPayload: string;
}

export type GatewayFetchFn = (
  method: "GET" | "POST",
  path:
    | `/v1/accounts/account/${Address}`
    | "/v2/accounts/siwf"
    | "/v1/frequency/blockinfo",
  body?: GatewayFetchBody,
) => Promise<Response>;

//
// msaCreationCallbackFn param
//
export type MsaCreationCallbackFn = (account: AccountResponse) => void;
