import { describe, it, expect } from "vitest";
import {
  convertSS58AddressToEthereum,
  requestContainsCredentialType,
  userAddressToPublicKey,
} from "./utils";
import { SiwfSignedRequest } from "@projectlibertylabs/siwf";

describe("convertSS58AddressToEthereum", () => {
  it("succeeds", async () => {
    const controlKey = "f6d1YDa4agkaQ5Kqq8ZKwCf2Ew8UFz9ot2JNrBwHsFkhdtHEn";
    const input = { controlKey: controlKey, foo: "bar" };

    const result = convertSS58AddressToEthereum(input);

    const expected = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";
    expect(result).toStrictEqual({ controlKey: expected, foo: "bar" });
  });
});

describe("userAddressToPublicKey", () => {
  it("succeeds", async () => {
    const userAddress = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";

    const result = userAddressToPublicKey(userAddress);

    expect(result).toStrictEqual({
      encodedValue: userAddress,
      encoding: "base16",
      format: "eip-55",
      type: "Secp256k1",
    });
  });
});

describe("requestContainsCredentialType", () => {
  const dummySignature: SiwfSignedRequest["requestedSignatures"] = {
    publicKey: {
      encodedValue: "0x1a3B4f6",
      encoding: "base16",
      format: "eip-55",
      type: "Secp256k1",
    },
    signature: {
      algo: "SECP256K1",
      encoding: "base16",
      encodedValue: "abc123",
    },
    payload: {
      callback: "url",
      permissions: [1],
    },
  };

  it("returns false if requestedCredentials is undefined", () => {
    const request: SiwfSignedRequest = { requestedSignatures: dummySignature };

    const result = requestContainsCredentialType(request, "email");

    expect(result).toBe(false);
  });

  it("returns true if single credential matches", () => {
    const request: SiwfSignedRequest = {
      requestedSignatures: dummySignature,
      requestedCredentials: [{ type: "email", hash: [] }],
    };

    const result = requestContainsCredentialType(request, "email");

    expect(result).toBe(true);
  });

  it("returns false if single credential does not match", () => {
    const request: SiwfSignedRequest = {
      requestedSignatures: dummySignature,
      requestedCredentials: [{ type: "phone", hash: [] }],
    };

    const result = requestContainsCredentialType(request, "email");

    expect(result).toBe(false);
  });

  it("returns true if credential is in anyOf group", () => {
    const request: SiwfSignedRequest = {
      requestedSignatures: dummySignature,
      requestedCredentials: [
        {
          anyOf: [
            { type: "phone", hash: [] },
            { type: "email", hash: [] },
          ],
        },
      ],
    };

    const result = requestContainsCredentialType(request, "email");

    expect(result).toBe(true);
  });

  it("returns false if none in anyOf group match", () => {
    const request: SiwfSignedRequest = {
      requestedSignatures: dummySignature,
      requestedCredentials: [
        {
          anyOf: [
            { type: "phone", hash: [] },
            { type: "idcard", hash: [] },
          ],
        },
      ],
    };

    const result = requestContainsCredentialType(request, "email");

    expect(result).toBe(false);
  });

  it("handles mixed list: some AnyOfRequired and some SiwfCredential", () => {
    const request: SiwfSignedRequest = {
      requestedSignatures: dummySignature,
      requestedCredentials: [
        {
          anyOf: [
            { type: "username", hash: [] },
            { type: "displayName", hash: [] },
          ],
        },
        { type: "email", hash: [] },
      ],
    };

    const result = requestContainsCredentialType(request, "email");

    expect(result).toBe(true);
  });

  it("returns false when targetType is empty string", () => {
    const request: SiwfSignedRequest = {
      requestedSignatures: dummySignature,
      requestedCredentials: [{ type: "email", hash: [] }],
    };

    const result = requestContainsCredentialType(request, "");

    expect(result).toBe(false);
  });
});
