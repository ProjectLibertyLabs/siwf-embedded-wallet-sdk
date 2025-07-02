import { GatewayFetchFn } from "../src/types/param-types";
import {
  AccountResponse,
  ChainInfoResponse,
  GatewaySiwfResponse,
} from "../src/types/response-types";

export const mockGatewayFetchFactory = (
  hasAccountResponse: AccountResponse | null,
  providerAccountResponse: AccountResponse | null,
  gatewaySiwfResponse: GatewaySiwfResponse,
  chainInfoResponse: ChainInfoResponse,
  providerControlKey: string,
  finalResponse: { response: AccountResponse | null } = { response: null },
): GatewayFetchFn => {
  return async (method, path) => {
    if (path === "/v2/accounts/siwf") {
      return {
        ok: true,
        status: 200,
        json: async () => gatewaySiwfResponse,
      } as Response;
    }

    if (path.startsWith("/v1/accounts/account/")) {
      if (method === "GET")
        return {
          ok: true,
          status: 200,
          json: async () => {
            if (path.includes(providerControlKey))
              return providerAccountResponse;
            return finalResponse.response || hasAccountResponse;
          },
        } as Response;
    }

    if (path.startsWith("/v1/frequency/blockinfo")) {
      if (method === "GET")
        return {
          ok: true,
          status: 200,
          json: async () => chainInfoResponse,
        } as Response;
    }

    return new Response(`Error: ${path} not found`, {
      status: 404,
    });
  };
};
