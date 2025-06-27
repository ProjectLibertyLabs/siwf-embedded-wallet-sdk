export const mockGatewayFetch = async (
  method: "GET" | "POST",
  path: string,
  _body?: unknown,
): Promise<Response> => {
  if (path === "/v2/accounts/siwf") {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        msaId: "290",
        controlKey: "0xINVALID_KEY",
      }),
    } as Response;
  }

  if (path.startsWith("/v1/accounts/account/")) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        someData: "value",
      }),
    } as Response;
  }

  // Default: return error response
  return {
    ok: false,
    status: 500,
    json: async () => ({ message: "Internal Server Error" }),
  } as Response;
};
