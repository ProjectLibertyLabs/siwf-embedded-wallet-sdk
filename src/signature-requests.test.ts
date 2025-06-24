import { describe, it, expect } from "vitest";
import {
  getEip712BrowserRequestAddProvider,
  getEip712BrowserRequestClaimHandlePayload,
  getEip712BrowserRequestItemizedSignaturePayloadV2,
  createItemizedAddAction,
} from "@frequency-chain/ethereum-utils";

describe("Generate Mock Data", () => {
  it("Generate the mocks for 712 Add Delegation", async () => {
    const sig = await getEip712BrowserRequestAddProvider(
      "1",
      [8, 9, 10, 15],
      100,
    );
    expect(sig).toMatchSnapshot();
  });

  it("Generate the mocks for 712 Handle Claim", async () => {
    const sig = await getEip712BrowserRequestClaimHandlePayload(
      "mock-handle",
      100,
    );
    expect(sig).toMatchSnapshot();
  });

  it("Generate the mocks for 712 Add Graph Key", async () => {
    const sig = await getEip712BrowserRequestItemizedSignaturePayloadV2(
      7,
      0,
      100,
      [
        createItemizedAddAction(
          "0x40a6836ea489047852d3f0297f8fe8ad6779793af4e9c6274c230c207b9b825026",
        ),
      ],
    );
    expect(sig).toMatchSnapshot();
  });

  it("Generate the mocks for 712 Add Recovery Hash", async () => {});
});
