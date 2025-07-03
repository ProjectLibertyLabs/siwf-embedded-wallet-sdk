import { describe, expect, it } from "vitest";
import { TEST_SIGNATURE_FN } from "../../test-mocks/test-signature-fn";
import {
  createLoginSiwfResponse,
  CreateLoginSiwfResponseArguments,
} from "./siwf";
import { SiwfResponse } from "@projectlibertylabs/siwf";

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
