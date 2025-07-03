import { describe, it, expect, vi } from "vitest";
import { createSignUpPayloads } from "./createSignUpPayloads";
import { mockAccountId } from "../../test-mocks/consts";
import { SiwfSignedRequest } from "@projectlibertylabs/siwf";
import { SiwfResponseCredential } from "@projectlibertylabs/siwf/types/credential";

describe("createSignUpPayloads", () => {
  const mockChainInfo = { finalized_blocknumber: 100 } as any;
  const mockSignatureFn = vi.fn();
  const mockProviderAccount = { msaId: "42" } as any;

  it("creates all payloads and credentials when graph key and recovery key are requested", async () => {
    const mockDecodedRequest: SiwfSignedRequest = {
      requestedSignatures: {
        publicKey: {
          encodedValue: "f6cL4wq1HUNx11TcvdABNf9UNXXoyH47mVUwT59tzSFRW8yDH",
          encoding: "base58",
          format: "ss58",
          type: "Sr25519",
        },
        signature: {
          algo: "SR25519",
          encoding: "base16",
          encodedValue:
            "0x0407ce814b77861df94d16b3fcb317d37a07abc2a7f9cd7c02cc22529ee7b32d56795f88bd6b4ad106b72b91b6246a783671bcd24cb01aaf0e9316db5e0cd085",
        },
        payload: { callback: "http://localhost:3000", permissions: [123] },
      },
      requestedCredentials: [
        {
          type: "VerifiedGraphKeyCredential",
          hash: ["bciqmdvmxd54zve5kifycgsdtoahs5ecf4hal2ts3eexkgocyc5oca2y"],
        },
        {
          type: "VerifiedRecoverySecretCredential",
          hash: ["bciqpg6qm4rnu2j4v6ghxqqgwkggokwvxs3t2bexbd3obkypkiryylxq"],
        },
      ],
    };

    const result = await createSignUpPayloads(
      mockChainInfo,
      mockAccountId,
      mockSignatureFn,
      mockProviderAccount,
      mockDecodedRequest,
      "JohnDoe",
      "john.doe@example.com",
    );

    // check for expected payloads
    const expectedPayloadTypes = [
      "addProvider",
      "claimHandle",
      "itemActions", // graph key
      "recoveryCommitment",
    ];

    const payloadTypes = result.payloads.map((p) => p.type);

    expectedPayloadTypes.forEach((type) => {
      expect(payloadTypes).toContain(type);
    });

    // check for expected credentials
    const expectedCredentialTypes = [
      ["VerifiedGraphKeyCredential", "VerifiableCredential"],
      ["VerifiedRecoverySecretCredential", "VerifiableCredential"],
    ];

    const credentialTypes = result.rawCredentials.map((c) => c.type);

    expect(credentialTypes).toEqual(expectedCredentialTypes);

    // check for expected graph key
    expect(result.graphKey).toBeDefined();

    // check for expected recovery secret
    expect(result.recoverySecret).toBeDefined();
  });

  it("creates only required payloads when graph key but NOT recovery is requested", async () => {
    const mockDecodedRequest: SiwfSignedRequest = {
      requestedSignatures: {
        publicKey: {
          encodedValue: "f6cL4wq1HUNx11TcvdABNf9UNXXoyH47mVUwT59tzSFRW8yDH",
          encoding: "base58",
          format: "ss58",
          type: "Sr25519",
        },
        signature: {
          algo: "SR25519",
          encoding: "base16",
          encodedValue:
            "0x0407ce814b77861df94d16b3fcb317d37a07abc2a7f9cd7c02cc22529ee7b32d56795f88bd6b4ad106b72b91b6246a783671bcd24cb01aaf0e9316db5e0cd085",
        },
        payload: { callback: "http://localhost:3000", permissions: [123] },
      },
      requestedCredentials: [
        {
          type: "VerifiedGraphKeyCredential",
          hash: ["bciqmdvmxd54zve5kifycgsdtoahs5ecf4hal2ts3eexkgocyc5oca2y"],
        },
      ],
    };

    const result = await createSignUpPayloads(
      mockChainInfo,
      mockAccountId,
      mockSignatureFn,
      mockProviderAccount,
      mockDecodedRequest,
      "JohnDoe",
      "john.doe@example.com",
    );

    // check for expected payloads
    const expectedPayloadTypes = ["addProvider", "claimHandle", "itemActions"];

    const payloadTypes = result.payloads.map((p) => p.type);

    expectedPayloadTypes.forEach((type) => {
      expect(payloadTypes).toContain(type);
    });

    // check for expected credentials
    const expectedCredentialTypes = [
      ["VerifiedGraphKeyCredential", "VerifiableCredential"],
    ];

    const credentialTypes = result.rawCredentials.map((c) => c.type);

    expect(credentialTypes).toEqual(expectedCredentialTypes);

    // check for expected graph key
    expect(result.graphKey).toBeDefined();

    // check for expected recovery secret
    expect(result.recoverySecret).not.toBeDefined();
  });

  it("creates only required payloads when graph key and recovery are NOT requested", async () => {
    const mockDecodedRequest: SiwfSignedRequest = {
      requestedSignatures: {
        publicKey: {
          encodedValue: "f6cL4wq1HUNx11TcvdABNf9UNXXoyH47mVUwT59tzSFRW8yDH",
          encoding: "base58",
          format: "ss58",
          type: "Sr25519",
        },
        signature: {
          algo: "SR25519",
          encoding: "base16",
          encodedValue:
            "0x0407ce814b77861df94d16b3fcb317d37a07abc2a7f9cd7c02cc22529ee7b32d56795f88bd6b4ad106b72b91b6246a783671bcd24cb01aaf0e9316db5e0cd085",
        },
        payload: { callback: "http://localhost:3000", permissions: [123] },
      },
      requestedCredentials: [],
    };

    const result = await createSignUpPayloads(
      mockChainInfo,
      mockAccountId,
      mockSignatureFn,
      mockProviderAccount,
      mockDecodedRequest,
      "JohnDoe",
      "john.doe@example.com",
    );

    // check for expected payloads
    const expectedPayloadTypes = ["addProvider", "claimHandle"];

    const payloadTypes = result.payloads.map((p) => p.type);

    expectedPayloadTypes.forEach((type) => {
      expect(payloadTypes).toContain(type);
    });

    // check for expected credentials
    const expectedCredentialTypes: SiwfResponseCredential["type"][] = [];

    const credentialTypes = result.rawCredentials.map((c) => c.type);

    expect(credentialTypes).toEqual(expectedCredentialTypes);

    // check for expected graph key
    expect(result.graphKey).not.toBeDefined();

    // check for expected recovery secret
    expect(result.recoverySecret).not.toBeDefined();
  });
});
