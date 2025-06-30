import { AccountResponse } from "./gateway-types.js";

type Address = string;

// https://chainagnostic.org/CAIPs/caip-122
interface CAIP122 {
  method: "personal_sign";
  params: [
    Address,
    string, // Signing Payload
  ];
}

export interface EIP712Document {
  types: {
    EIP712Domain: { name: string; type: string }[];
    [key: string]: { name: string; type: string }[];
  };
  primaryType: string;
  domain: {
    name: string;
    version: string;
    chainId: string;
    verifyingContract: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: Record<string, any>;
}

// https://eips.ethereum.org/EIPS/eip-712#specification-of-the-eth_signtypeddata-json-rpc
export interface EIP712 {
  method: "eth_signTypedData_v4";
  params: [Address, EIP712Document];
}

// Matches https://docs.metamask.io/wallet/reference/provider-api/#request
export type SignatureFn = (request: CAIP122 | EIP712) => Promise<string>;

interface GatewayFetchBody {
  authorizationPayload: string;
}

export type GatewayFetchPostSiwfFn = (
  method: "POST",
  path: "/v2/accounts/siwf",
  body: GatewayFetchBody,
) => Promise<Response>;

export type GatewayFetchGetAccountFn = (
  method: "GET",
  path: `/v1/accounts/account/${Address}`,
) => Promise<Response>;

export type GatewayFetchFn = (
  method: "GET" | "POST",
  path: `/v1/accounts/account/${Address}` | "/v2/accounts/siwf",
  body?: GatewayFetchBody,
) => Promise<Response>;

export type MockGatewayFetchFn = (
  method: "GET" | "POST",
  path: `/v1/accounts/account/${Address}` | "/v2/accounts/siwf",
  body?: GatewayFetchBody,
) => Promise<{ payload: AccountResponse; response: Response }>;

export type MsaCreationCallbackFn = (account: AccountResponse) => void;
