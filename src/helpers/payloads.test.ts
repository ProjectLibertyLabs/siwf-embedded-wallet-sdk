import { describe, it, expect } from "vitest";
import {
  createSignedAddProviderPayload,
  createSignedClaimHandlePayload,
  createSignedGraphKeyPayload,
} from "./payloads";
import {
  SiwfResponsePayloadAddProvider,
  SiwfResponsePayloadClaimHandle,
  SiwfResponsePayloadItemActions,
} from "../siwf-types";
import { SignatureFn } from "../types";

describe("createSignedAddProviderPayload", () => {
  it("returns the correct payload", async () => {
    const userAddress = "0x1234";
    const signatureFn: SignatureFn = async (_request) => "fake-signature";

    const payload: SiwfResponsePayloadAddProvider =
      await createSignedAddProviderPayload(userAddress, signatureFn, {
        authorizedMsaId: "1",
        schemaIds: [8, 9, 10, 15],
        expiration: 100,
      });

    expect(payload).toMatchSnapshot();
  });
});

describe("createSignedClaimHandlePayload", () => {
  it("returns the correct payload", async () => {
    const userAddress = "0x1234";
    const baseHandle = "Alice";
    const signatureFn: SignatureFn = async (_request) => "fake-signature";

    const payload: SiwfResponsePayloadClaimHandle =
      await createSignedClaimHandlePayload(userAddress, signatureFn, {
        baseHandle,
        expiration: 100,
      });

    expect(payload).toMatchSnapshot();
  });
});

describe("createSignedGraphKeyPayload", () => {
  it("returns the correct payload", async () => {
    const userAddress = "0x1234";
    const signatureFn: SignatureFn = async () => "fake-signature-for-graph";

    const payload: SiwfResponsePayloadItemActions =
      await createSignedGraphKeyPayload(userAddress, signatureFn, {
        schemaId: 7,
        targetHash: 0,
        expiration: 100,
        actions: [
          {
            type: "addItem",
            payloadHex:
              "0x40a6836ea489047852d3f0297f8fe8ad6779793af4e9c6274c230c207b9b825026",
          },
        ],
      });

    expect(payload).toMatchSnapshot();
  });
});
