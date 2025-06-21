import { GatewaySiwfResponse } from "src/gateway-types.js";

export function mockGatewayLoginResponse(): GatewaySiwfResponse {
  return {
    controlKey: "f6cL4wq1HUNx11TcvdABNf9UNXXoyH47mVUwT59tzSFRW8yDH",
    msaId: "314159265358979323846264338",
  };
}
