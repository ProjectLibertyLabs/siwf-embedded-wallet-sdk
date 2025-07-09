import { describe, expect, it } from "vitest";
import {
  byteToBase64URL,
  codepointToUTF8,
  stringToBase64URL,
  stringToUTF8,
} from "./base64url";

describe("stringToBase64URL", () => {
  it("encodes a simple string correctly", () => {
    const result = stringToBase64URL("hi");
    expect(result).toBe("aGk");
  });

  it("encodes unicode characters", () => {
    const result = stringToBase64URL("✓");
    expect(result).toBe("4pyT");
  });

  it("returns an empty string for empty input", () => {
    expect(stringToBase64URL("")).toBe("");
  });
});

describe("byteToBase64URL", () => {
  it("emits correct characters for a simple byte", () => {
    const state = { queue: 0, queuedBits: 0 };
    const output: string[] = [];

    byteToBase64URL(0b010000, state, (char) => output.push(char)); // Should emit 'Q'
    byteToBase64URL(null, state, (char) => output.push(char)); // Flush remaining bits

    expect(output.length).toBeGreaterThan(0);
    expect(typeof output[0]).toBe("string");
  });
});

describe("codepointToUTF8", () => {
  it("converts ASCII codepoint to UTF-8", () => {
    const bytes: number[] = [];
    codepointToUTF8(0x41, (b) => bytes.push(b)); // 'A'
    expect(bytes).toEqual([0x41]);
  });

  it("converts 2-byte UTF-8 codepoint (e.g., ¢) correctly", () => {
    const bytes: number[] = [];
    codepointToUTF8("¢".codePointAt(0)!, (b) => bytes.push(b));
    expect(bytes).toEqual([0xc2, 0xa2]); // UTF-8 encoding for U+00A2
  });

  it("converts multi-byte codepoint (e.g., ✓) to UTF-8", () => {
    const bytes: number[] = [];
    codepointToUTF8("✓".codePointAt(0)!, (b) => bytes.push(b));
    expect(bytes).toEqual([0xe2, 0x9c, 0x93]);
  });

  it("converts 4-byte UTF-8 codepoint (e.g., 𝄞) correctly", () => {
    const bytes: number[] = [];
    codepointToUTF8("𝄞".codePointAt(0)!, (b) => bytes.push(b));
    expect(bytes).toEqual([0xf0, 0x9d, 0x84, 0x9e]); // UTF-8 for U+1D11E
  });

  it("throws on invalid codepoint", () => {
    expect(() => codepointToUTF8(0x110000, () => {})).toThrow(
      /Unrecognized Unicode codepoint/,
    );
  });
});

describe("stringToUTF8", () => {
  it("converts a simple string to UTF-8 bytes", () => {
    const bytes: number[] = [];
    stringToUTF8("A", (b) => bytes.push(b));
    expect(bytes).toEqual([0x41]);
  });

  it("handles surrogate pairs correctly (e.g., 😊)", () => {
    const bytes: number[] = [];
    stringToUTF8("😊", (b) => bytes.push(b)); // U+1F60A

    // UTF-8 encoding of U+1F60A is: F0 9F 98 8A
    expect(bytes).toEqual([0xf0, 0x9f, 0x98, 0x8a]);
  });
});
