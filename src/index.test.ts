import { describe, it, expect } from "vitest";
import { startSiwf } from "./index.js";
import { GatewaySiwfResponse } from "../dist/gateway-types";

describe("Basic startSiwf test", () => {
  it("Can do a thing", async () => {
    const resp = await startSiwf(
      "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac",
      async () => "0xdef0",
      async () =>
        ({
          ok: true,
          status: 200,
          json: async (): Promise<GatewaySiwfResponse> => ({
            msaId: "290",
            controlKey: "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac",
          }),
        }) as Response,
      "eyJyZXF1ZXN0ZWRTaWduYXR1cmVzIjp7InB1YmxpY0tleSI6eyJlbmNvZGVkVmFsdWUiOiJmNmNMNHdxMUhVTngxMVRjdmRBQk5mOVVOWFhveUg0N21WVXdUNTl0elNGUlc4eURIIiwiZW5jb2RpbmciOiJiYXNlNTgiLCJmb3JtYXQiOiJzczU4IiwidHlwZSI6IlNyMjU1MTkifSwic2lnbmF0dXJlIjp7ImFsZ28iOiJTcjI1NTE5IiwiZW5jb2RpbmciOiJiYXNlMTYiLCJlbmNvZGVkVmFsdWUiOiIweDA0MDdjZTgxNGI3Nzg2MWRmOTRkMTZiM2ZjYjMxN2QzN2EwN2FiYzJhN2Y5Y2Q3YzAyY2MyMjUyOWVlN2IzMmQ1Njc5NWY4OGJkNmI0YWQxMDZiNzJiOTFiNjI0NmE3ODM2NzFiY2QyNGNiMDFhYWYwZTkzMTZkYjVlMGNkMDg1In0sInBheWxvYWQiOnsiY2FsbGJhY2siOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJwZXJtaXNzaW9ucyI6WzUsNyw4LDksMTBdfX0sInJlcXVlc3RlZENyZWRlbnRpYWxzIjpbeyJ0eXBlIjoiVmVyaWZpZWRHcmFwaEtleUNyZWRlbnRpYWwiLCJoYXNoIjpbImJjaXFtZHZteGQ1NHp2ZTVraWZ5Y2dzZHRvYWhzNWVjZjRoYWwydHMzZWV4a2dvY3ljNW9jYTJ5Il19LHsiYW55T2YiOlt7InR5cGUiOiJWZXJpZmllZEVtYWlsQWRkcmVzc0NyZWRlbnRpYWwiLCJoYXNoIjpbImJjaXFlNHFvY3poZnRpY2k0ZHpmdmZiZWw3Zm80aDRzcjVncmNvM29vdnd5azZ5NHluZjQ0dHNpIl19LHsidHlwZSI6IlZlcmlmaWVkUGhvbmVOdW1iZXJDcmVkZW50aWFsIiwiaGFzaCI6WyJiY2lxanNwbmJ3cGMzd2p4NGZld2NlazVkYXlzZGpwYmY1eGppbXo1d251NXVqN2UzdnUydXducSJdfV19XX0",
      "handle-here",
      "email@example.com",
      () => {},
    );
    expect(resp).toMatchSnapshot();
  });
});
