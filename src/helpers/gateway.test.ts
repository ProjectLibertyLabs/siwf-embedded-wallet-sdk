import { describe, it, expect } from "vitest";
import { GatewayFetchFn } from "../types";
import { AccountResponse } from "../gateway-types";
import { GatewayFetchError } from "../error-types";
import { getGatewayAccount } from "./gateway";
import { decodeSignedRequest } from "@projectlibertylabs/siwf";

describe("getGatewayAccount", () => {
  it("returns info for an existing user", async () => {
    const body: AccountResponse = { msaId: "2" };
    const fetchFn: GatewayFetchFn = async (_method, _path) => {
      return new Response(JSON.stringify(body), { status: 200 });
    };
    const address = "0x1234";

    const result = await getGatewayAccount(fetchFn, address);

    expect(result).toStrictEqual(body);
  });
  it("returns `null` when user not found", async () => {
    const fetchFn: GatewayFetchFn = async (_method, _path) => {
      return new Response(null, { status: 404 });
    };
    const address = "0x1234";

    const result = await getGatewayAccount(fetchFn, address);

    expect(result).toStrictEqual(null);
  });
  it("throws when request is malformed", async () => {
    const fetchFn: GatewayFetchFn = async (_method, _path) => {
      return new Response(null, { status: 405 });
    };
    const address = "#@41i9=/?&8";

    try {
      await getGatewayAccount(fetchFn, address);
      expect.fail("No error thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(GatewayFetchError);
      expect((err as GatewayFetchError).response.status).toBe(405);
    }
  });
  it("throws when server encounters an error", async () => {
    const fetchFn: GatewayFetchFn = async (_method, _path) => {
      return new Response("{stacktrace: '...'}", { status: 500 });
    };
    const address = "0x1234";

    try {
      await getGatewayAccount(fetchFn, address);
      expect.fail("No error thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(GatewayFetchError);
      expect((err as GatewayFetchError).response.status).toBe(500);
    }
  });

  it("gets a correctly parses encoded signed requests, then gets provider account", async () => {
    const encoded =
      "eyJyZXF1ZXN0ZWRTaWduYXR1cmVzIjp7InB1YmxpY0tleSI6eyJlbmNvZGVkVmFsdWUiOiJmNmNMNHdxMUhVTngxMVRjdmRBQk5mOVVOWFhveUg0N21WVXdUNTl0elNGUlc4eURIIiwiZW5jb2RpbmciOiJiYXNlNTgiLCJmb3JtYXQiOiJzczU4IiwidHlwZSI6IlNyMjU1MTkifSwic2lnbmF0dXJlIjp7ImFsZ28iOiJTcjI1NTE5IiwiZW5jb2RpbmciOiJiYXNlMTYiLCJlbmNvZGVkVmFsdWUiOiIweDA0MDdjZTgxNGI3Nzg2MWRmOTRkMTZiM2ZjYjMxN2QzN2EwN2FiYzJhN2Y5Y2Q3YzAyY2MyMjUyOWVlN2IzMmQ1Njc5NWY4OGJkNmI0YWQxMDZiNzJiOTFiNjI0NmE3ODM2NzFiY2QyNGNiMDFhYWYwZTkzMTZkYjVlMGNkMDg1In0sInBheWxvYWQiOnsiY2FsbGJhY2siOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJwZXJtaXNzaW9ucyI6WzUsNyw4LDksMTBdfX0sInJlcXVlc3RlZENyZWRlbnRpYWxzIjpbeyJ0eXBlIjoiVmVyaWZpZWRHcmFwaEtleUNyZWRlbnRpYWwiLCJoYXNoIjpbImJjaXFtZHZteGQ1NHp2ZTVraWZ5Y2dzZHRvYWhzNWVjZjRoYWwydHMzZWV4a2dvY3ljNW9jYTJ5Il19LHsiYW55T2YiOlt7InR5cGUiOiJWZXJpZmllZEVtYWlsQWRkcmVzc0NyZWRlbnRpYWwiLCJoYXNoIjpbImJjaXFlNHFvY3poZnRpY2k0ZHpmdmZiZWw3Zm80aDRzcjVncmNvM29vdnd5azZ5NHluZjQ0dHNpIl19LHsidHlwZSI6IlZlcmlmaWVkUGhvbmVOdW1iZXJDcmVkZW50aWFsIiwiaGFzaCI6WyJiY2lxanNwbmJ3cGMzd2p4NGZld2NlazVkYXlzZGpwYmY1eGppbXo1d251NXVqN2UzdnUydXducSJdfV19XX0";
    const { requestedSignatures, requestedCredentials, applicationContext } =
      decodeSignedRequest(encoded);

    expect(requestedSignatures).toBeDefined();
    expect(requestedSignatures.publicKey).toBeDefined();
    expect(requestedSignatures.payload).toBeDefined();
    expect(requestedSignatures.signature).toBeDefined();
    expect(requestedCredentials).length.greaterThan(0);
    expect(applicationContext).not.toBeDefined();

    const body: AccountResponse = { msaId: "1" };
    const fetchFn: GatewayFetchFn = async (_method, _path) => {
      return new Response(JSON.stringify(body), { status: 200 });
    };

    const address = requestedSignatures.publicKey.encodedValue;

    try {
      const providerAccount = await getGatewayAccount(fetchFn, address);
      expect(providerAccount).toEqual(body);
    } catch (err) {
      expect(err).toBeInstanceOf(GatewayFetchError);
      expect((err as GatewayFetchError).response.status).toBe(500);
    }
  });
});
