import { describe, it, expect } from "vitest";
import { generateGraphKeyPair } from "./crypto";
import { isHexString } from "./utils";

describe("generateGraphKeyPair", () => {
  it("returns hex strings", async () => {
    const result = generateGraphKeyPair()

    expect(isHexString(result.privateKey)).toStrictEqual(true)
    expect(result.privateKey.length).toStrictEqual(66) // 64 characters of data plus `0x` prefix
    expect(isHexString(result.publicKey)).toStrictEqual(true)
    expect(result.publicKey.length).toStrictEqual(66) // 64 characters of data plus `0x` prefix
  });
});