import { describe, it, expect, vi } from "vitest";
import {
  generateGraphKeyCredential,
  generateGraphKeyPairAndCredential,
  generateRecoverySecretCredential,
} from "./crypto";
import { isHexString } from "./utils";
import { VerifiedRecoverySecret } from "@projectlibertylabs/siwf";
import { mockAccountId } from "../../test-mocks/consts";

describe("generateGraphKeyPairAndCredential", () => {
  it("returns hex strings", async () => {
    const { graphKeyPair, graphKeyCredential } =
      generateGraphKeyPairAndCredential(mockAccountId);
    const isHexStringPrivateKey = isHexString(graphKeyPair.privateKey);
    const isHexStringPublicKey = isHexString(graphKeyPair.publicKey);

    expect(isHexString(graphKeyPair.privateKey)).toStrictEqual(true);
    expect(graphKeyPair.privateKey.length).toStrictEqual(66); // 64 characters of data plus `0x` prefix
    expect(isHexStringPrivateKey).toBeTruthy();

    expect(isHexString(graphKeyPair.publicKey)).toStrictEqual(true);
    expect(graphKeyPair.publicKey.length).toStrictEqual(66); // 64 characters of data plus `0x` prefix
    expect(isHexStringPublicKey).toBeTruthy();

    expect(graphKeyCredential).toBeDefined(); // The next test takes a deeper dive into this value
  });
});

describe("generateGraphKeyCredential", () => {
  it("returns a valid credential", () => {
    const fakeKeyPair = {
      publicKey: new Uint8Array([1, 2, 3, 4]),
      secretKey: new Uint8Array([5, 6, 7, 8]),
    };

    const credential = generateGraphKeyCredential(mockAccountId, fakeKeyPair);

    expect(credential["@context"]).toContain(
      "https://www.w3.org/ns/credentials/v2",
    );
    expect(credential.type).toEqual([
      "VerifiedGraphKeyCredential",
      "VerifiableCredential",
    ]);

    // Assert that validFrom is a valid ISO string
    expect(() => new Date(credential.validFrom!)).not.toThrow();
    expect(new Date(credential.validFrom!).toISOString()).toBe(
      credential.validFrom,
    ); // Confirm it's a valid ISO string

    expect(credential.credentialSchema.id).toContain(
      "https://schemas.frequencyaccess.com",
    );
    expect(credential.credentialSubject).toMatchObject({
      id: credential.issuer,
      encodedPublicKeyValue: fakeKeyPair.publicKey.toString(),
      encodedPrivateKeyValue: fakeKeyPair.secretKey.toString(),
      encoding: "base16",
      format: "bare",
      type: "X25519",
      keyType: "dsnp.public-key-key-agreement",
    });
  });
});

describe("generateRecoverySecretCredential", () => {
  it("generates a valid recovery secret credential", () => {
    const accountId = "0xabc123";
    const recoverySecret = "s3cr3t-code";

    const result = generateRecoverySecretCredential(accountId, recoverySecret);

    expect(result).toMatchObject({
      "@context": [
        "https://www.w3.org/ns/credentials/v2",
        "https://www.w3.org/ns/credentials/undefined-terms/v2",
      ],
      type: ["VerifiedRecoverySecretCredential", "VerifiableCredential"],
      issuer: `did:ethr:${accountId}`,
      credentialSchema: {
        type: "JsonSchema",
        id: VerifiedRecoverySecret.id,
      },
      credentialSubject: {
        id: `did:ethr:${accountId}`,
        recoverySecret,
      },
    });

    // Assert that validFrom is a valid ISO string
    expect(() => new Date(result.validFrom!)).not.toThrow();
    expect(new Date(result.validFrom!).toISOString()).toBe(result.validFrom); // Confirm it's a valid ISO string
  });
});
