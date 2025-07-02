import { describe, it, expect } from "vitest";
import {
  createSignedAddProviderPayload,
  createSignedClaimHandlePayload,
  createSignedGraphKeyPayload,
} from "./payloads";
import {
  SiwfResponse,
  SiwfResponsePayloadAddProvider,
  SiwfResponsePayloadClaimHandle,
} from "@projectlibertylabs/siwf";
import { TEST_SIGNATURE_FN } from "../../test-mocks/test-signature-fn.js";
import {
  createLoginSiwfResponse,
  CreateLoginSiwfResponseArguments,
} from "./siwf";

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
});

describe("createSignedLogInPayload", () => {
  it("returns the correct payload", async () => {
    const accountId = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";
    const signatureFn = TEST_SIGNATURE_FN;
    const mockLoginPayloadArguments: CreateLoginSiwfResponseArguments = {
      domain: "your-app.com",
      uri: "https://your-app.com/signin/callback",
      version: "1",
      nonce: "N6rLwqyz34oUxJEXJ",
      chainId: "123",
      issuedAt: "2024-10-29T19:17:27.077Z",
    };

    const payload: SiwfResponse = await createLoginSiwfResponse(
      accountId,
      signatureFn,
      mockLoginPayloadArguments,
    );

    expect(payload).toMatchSnapshot();
  });
});
