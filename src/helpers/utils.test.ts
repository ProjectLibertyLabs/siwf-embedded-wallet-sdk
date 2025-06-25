import { describe, it, expect } from "vitest";
import { convertSS58AddressToEthereum } from "./utils";

describe("convertSS58AddressToEthereum", () => {
  it("succeeds", async () => {
    const controlKey = "f6d1YDa4agkaQ5Kqq8ZKwCf2Ew8UFz9ot2JNrBwHsFkhdtHEn";
    const input = { controlKey: controlKey, foo: "bar" };

    const result = convertSS58AddressToEthereum(input);

    const expected = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";
    expect(result).toStrictEqual({ controlKey: expected, foo: "bar" });
  });
});
