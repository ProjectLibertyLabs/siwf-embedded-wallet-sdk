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
} from "@projectlibertylabs/siwf";
import { TEST_SIGNATURE_FN } from "../../test-mocks/test-signature-fn.js";

describe("createSignedAddProviderPayload", () => {
  it("returns the correct payload", async () => {
    const accountId = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";
    const signatureFn = TEST_SIGNATURE_FN;

    const payload: SiwfResponsePayloadAddProvider =
      await createSignedAddProviderPayload(accountId, signatureFn, {
        authorizedMsaId: 1,
        schemaIds: [8, 9, 10, 15],
        expiration: 100,
      });

    expect(payload).toMatchSnapshot();
  });
});

describe("createSignedClaimHandlePayload", () => {
  it("returns the correct payload", async () => {
    const accountId = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";
    const baseHandle = "Alice";
    const signatureFn = TEST_SIGNATURE_FN;

    const payload: SiwfResponsePayloadClaimHandle =
      await createSignedClaimHandlePayload(accountId, signatureFn, {
        baseHandle,
        expiration: 100,
      });

    expect(payload).toMatchSnapshot();
  });
});

describe("createSignedGraphKeyPayload", () => {
  it("returns the correct payload", async () => {
    const accountId = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";
    const signatureFn = TEST_SIGNATURE_FN;

    const payload = await createSignedGraphKeyPayload(accountId, signatureFn, {
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

  it("throws when payloadHex is not valid", async () => {
    const accountId = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";
    const signatureFn = TEST_SIGNATURE_FN;

    const payloadArguments: SiwfResponsePayloadItemActions["payload"] = {
      schemaId: 7,
      targetHash: 0,
      expiration: 100,
      actions: [
        {
          type: "addItem",
          payloadHex: "123",
        },
      ],
    };

    await expect(
      createSignedGraphKeyPayload(accountId, signatureFn, payloadArguments),
    ).rejects.toThrow("Expected HexString: 123");
  });
});
