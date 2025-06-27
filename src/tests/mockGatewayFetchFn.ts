import {
  mockNewUserAccountResponse,
  mockNewUserGatewaySiwfResponse,
  mockProviderAccountResponse,
  mockProviderControlKey,
  mockReturningUserAccountResponse,
  mockReturningUserControlKey,
} from "./consts";

export const mockGatewayFetch = async (
  method: "GET" | "POST",
  path: string,
  _body?: unknown,
): Promise<Response> => {
  if (path === "/v2/accounts/siwf") {
    return {
      ok: true,
      status: 200,
      json: async () => mockNewUserGatewaySiwfResponse,
    } as Response;
  }

  if (path.startsWith("/v1/accounts/account/")) {
    if (method === "GET")
      return {
        ok: true,
        status: 200,
        json: async (address: string) => {
          // if getting provider account
          if (address === mockProviderControlKey)
            return mockProviderAccountResponse;
          // if getting returning user account
          if (address === mockReturningUserControlKey)
            return mockReturningUserAccountResponse;
          // if getting new user account
          if (address === mockReturningUserControlKey)
            return mockNewUserAccountResponse;
        },
      } as Response;
  }

  // Default: return error response
  return {
    ok: false,
    status: 500,
    json: async () => ({ message: "Internal Server Error" }),
  } as Response;
};
