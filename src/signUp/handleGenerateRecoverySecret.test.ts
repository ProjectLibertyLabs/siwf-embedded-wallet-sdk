import { describe, it, expect, vi, beforeEach } from "vitest";
import { requestContainsCredentialType } from "../helpers/utils";
import {
  generateRecoverySecret,
  getRecoveryCommitment,
  ContactType,
} from "@frequency-chain/recovery-sdk";
import { createRecoverySecretPayloadAndCredential } from "../helpers/payloads";
import { SiwfSignedRequest } from "@projectlibertylabs/siwf";
import { handleGenerateRecoverySecret } from "./handleGenerateRecoverySecret";
import { mockAccountId } from "../../test-mocks/consts";

vi.mock("../helpers/utils", () => ({
  requestContainsCredentialType: vi.fn(),
}));

vi.mock("@frequency-chain/recovery-sdk", () => ({
  generateRecoverySecret: vi.fn(() => "mock-secret"),
  getRecoveryCommitment: vi.fn(() => "mock-commitment"),
  ContactType: { EMAIL: "email" },
}));

vi.mock("../helpers/payloads", () => ({
  createRecoverySecretPayloadAndCredential: vi.fn(async () => ({
    recoverySecretCredential: { mock: "credential" },
    recoverySecretPayload: { payload: "mock-payload" },
  })),
}));

describe("handleGenerateRecoverySecret", () => {
  const expiration = 999999;
  const signatureFn = vi.fn();
  const decodedSiwfSignedRequest = {} as SiwfSignedRequest;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns recovery secret data if email is provided and request contains the correct credential", async () => {
    (requestContainsCredentialType as any).mockReturnValue(true);

    const result = await handleGenerateRecoverySecret(
      "john.doe@example.com",
      decodedSiwfSignedRequest,
      expiration,
      mockAccountId,
      signatureFn,
    );

    expect(requestContainsCredentialType).toHaveBeenCalledWith(
      decodedSiwfSignedRequest,
      "VerifiedRecoverySecretCredential",
    );
    expect(generateRecoverySecret).toHaveBeenCalled();
    expect(getRecoveryCommitment).toHaveBeenCalledWith(
      "mock-secret",
      ContactType.EMAIL,
      "john.doe@example.com",
    );
    expect(createRecoverySecretPayloadAndCredential).toHaveBeenCalledWith(
      mockAccountId,
      "mock-secret",
      signatureFn,
      {
        recoveryCommitmentHex: "mock-commitment",
        expiration,
      },
    );

    expect(result).toEqual({
      recoverySecretCredential: { mock: "credential" },
      recoverySecretPayload: { payload: "mock-payload" },
      recoverySecret: "mock-secret",
    });
  });

  it("returns null if recovery credential type not requested", async () => {
    (requestContainsCredentialType as any).mockReturnValue(false);

    const result = await handleGenerateRecoverySecret(
      "john.doe@example.com",
      decodedSiwfSignedRequest,
      expiration,
      mockAccountId,
      signatureFn,
    );

    expect(result).toBeNull();
    expect(generateRecoverySecret).not.toHaveBeenCalled();
  });

  it("returns null if email is not provided", async () => {
    (requestContainsCredentialType as any).mockReturnValue(true);

    const result = await handleGenerateRecoverySecret(
      "",
      decodedSiwfSignedRequest,
      expiration,
      mockAccountId,
      signatureFn,
    );

    expect(result).toBeNull();
    expect(generateRecoverySecret).not.toHaveBeenCalled();
  });
});
