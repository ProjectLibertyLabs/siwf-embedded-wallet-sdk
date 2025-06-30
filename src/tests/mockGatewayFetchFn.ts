import { GatewayFetchFn } from "../types";
import { AccountResponse, GatewaySiwfResponse } from "../gateway-types";

export const mockGatewayFetchFactory = (
  hasAccountResponse: AccountResponse | null,
  providerAccountResponse: AccountResponse | null,
  gatewaySiwfResponse: GatewaySiwfResponse,
  providerControlKey: string,
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
            return hasAccountResponse;
          },
        } as Response;
    }

    return new Response("Error", {
      status: 404,
    });
  };
};
