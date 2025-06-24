import { describe, it, expect } from "vitest";
import { createSignedAddProviderPayload } from "./payloads";
import { SiwfResponsePayloadAddProvider } from "../siwf-types";


describe("createSignedAddProviderPayload", () => {
  it("returns the correct payload", async () => {
    const userAddress = "0x1234"
    const signatureFn = async (_request) => "fake-signature"

    const payload: SiwfResponsePayloadAddProvider = await createSignedAddProviderPayload(
      userAddress,
      signatureFn,
      {
        authorizedMsaId: 1n,
        schemaIds: [8, 9, 10, 15],
        expiration: 100,
      },
    )

    expect(payload).toMatchSnapshot()
  });
});
