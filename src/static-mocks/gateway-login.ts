import { GatewaySiwfResponse } from "src/gateway-types.js";

export function mockGatewayLoginResponse(): GatewaySiwfResponse {
  return {
    controlKey: "f6d1YDa4agkaQ5Kqq8ZKwCf2Ew8UFz9ot2JNrBwHsFkhdtHEn",
    msaId: "314159265358979323846264338",
  };
}
