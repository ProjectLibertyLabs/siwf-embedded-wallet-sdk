import { describe, it, expect } from "vitest";
import {
  convertSS58AddressToEthereum,
  requestContainsCredentialType,
  accountIdToPublicKey,
  toChecksumAddress,
  stripAddress,
} from "./utils";
import { SiwfSignedRequest } from "@projectlibertylabs/siwf";
import { mockAccountId } from "../../test-mocks/consts";
import { u8aToHex } from "@polkadot/util";
import bs58 from "bs58";

describe("convertSS58AddressToEthereum", () => {
  it("succeeds", async () => {
    const controlKey = "f6d1YDa4agkaQ5Kqq8ZKwCf2Ew8UFz9ot2JNrBwHsFkhdtHEn";
    const input = { controlKey: controlKey, foo: "bar" };

    const result = convertSS58AddressToEthereum(input);

    const expected = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";
    expect(result).toStrictEqual({ controlKey: expected, foo: "bar" });
  });
});

describe("accountIdToPublicKey", () => {
  it("succeeds", async () => {
    const accountId = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";

    const result = accountIdToPublicKey(accountId);

    expect(result).toStrictEqual({
      encodedValue: accountId,
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

describe("toChecksumAddress", () => {
  it("If already formatted correctly and given a chain id, should return the chain id + account id", () => {
    const result = toChecksumAddress(mockAccountId, "123");
    // todo: confirm this is the expected value
    expect(result).toStrictEqual(`0xf24ff3a9cf04c71dBc94d0B566F7a27B94566cAc`);
  });
  it("returns just account id if a null chain id is given", () => {
    const result = toChecksumAddress(mockAccountId, null);
    expect(result).toStrictEqual(mockAccountId);
  });
  it("If formatted incorrectly, should convert to checksum", () => {
    const mockAccountIdAsUInt8Array = Uint8Array.from([
      0xf2, 0x4f, 0xf3, 0xa9, 0xcf, 0x04, 0xc7, 0x1d, 0xbc, 0x94, 0xd0, 0xb5,
      0x66, 0xf7, 0xa2, 0x7b, 0x94, 0x56, 0x6c, 0xac,
    ]);
    const result = toChecksumAddress(u8aToHex(mockAccountIdAsUInt8Array));
    expect(result).toStrictEqual(mockAccountId);
  });
  it("throws error if invalid address", () => {
    expect(() => toChecksumAddress("0x1234")).toThrow(
      'Given address "0x1234" is not a valid Ethereum address.',
    );
  });
});

describe("stripAddress", () => {
  it("removes '0x' prefix and lowercases the address", () => {
    expect(stripAddress("0xAbC123")).toBe("abc123");
  });
  it("returns the address lowercased if no '0x' prefix", () => {
    expect(stripAddress("AbC123")).toBe("abc123");
  });
});
