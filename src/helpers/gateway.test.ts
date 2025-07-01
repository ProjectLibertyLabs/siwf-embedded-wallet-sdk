import { describe, it, expect } from "vitest";
import { GatewayFetchFn, MsaCreationCallbackFn } from "../types";
import {
  AccountResponse,
  ChainInfoResponse,
  GatewaySiwfResponse,
} from "../gateway-types";
import { GatewayFetchError } from "../error-types";
import {
  getGatewayChainInfo,
  poll,
  pollForAccount,
  postGatewaySiwf,
} from "./gateway";
import { decodeSignedRequest, SiwfResponse } from "@projectlibertylabs/siwf";

describe("getGatewayBlockInfo", () => {
  it("returns correct info", async () => {
    const body: ChainInfoResponse = {
      blocknumber: 34,
      finalized_blocknumber: 32,
      genesis: "0x0234",
      runtime_version: 4,
    };
    const fetchFn: GatewayFetchFn = async (_method, _path) => {
      return new Response(JSON.stringify(body), { status: 200 });
    };

    const result = await getGatewayChainInfo(fetchFn);

    expect(result).toStrictEqual(body);
  });
  it("throws when server encounters an error", async () => {
    const fetchFn: GatewayFetchFn = async (_method, _path) => {
      return new Response("{stacktrace: '...'}", { status: 500 });
    };

    try {
      await getGatewayChainInfo(fetchFn);
      expect.fail("No error thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(GatewayFetchError);
      expect((err as GatewayFetchError).response.status).toBe(500);
    }
  });
});

describe("postGatewaySiwf", () => {
  it("submits correctly", async () => {
    const gatewayResponse: GatewaySiwfResponse = {
      controlKey: "f6d1YDa4agkaQ5Kqq8ZKwCf2Ew8UFz9ot2JNrBwHsFkhdtHEn",
      msaId: "314159265358979323846264338",
    };
    const fetchFn: GatewayFetchFn = async (method, path) => {
      expect(method).toStrictEqual("POST");
      expect(path).toStrictEqual("/v2/accounts/siwf");
      return new Response(JSON.stringify(gatewayResponse), { status: 200 });
    };
    const response: SiwfResponse = {
      userPublicKey: {
        encodedValue: "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac",
        encoding: "base16",
        format: "eip-55",
        type: "Secp256k1",
      },
      payloads: [],
    };

    const result = await postGatewaySiwf(fetchFn, response);

    expect(result).toStrictEqual(gatewayResponse);
  });
  it("handles errors correctly", async () => {
    const fetchFn: GatewayFetchFn = async (_method, _path) => {
      return new Response("Missing `payloads`", { status: 405 });
    };
    const body: SiwfResponse = {
      userPublicKey: {
        encodedValue: "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac",
        encoding: "base16",
        format: "eip-55",
        type: "Secp256k1",
      },
      payloads: [],
    };

    try {
      await postGatewaySiwf(fetchFn, body);
      expect.fail("No error thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(GatewayFetchError);
      expect((err as GatewayFetchError).response.status).toBe(405);
    }
  });
});

describe("poll", () => {
  it("returns a successful result immediately", async () => {
    let invocations = 0;
    const mockFn = async () => {
      invocations++;
      return Promise.resolve(true);
    };

    const result = await poll(mockFn, 0, 60);

    expect(result).toStrictEqual(true);
    expect(invocations).toStrictEqual(1);
  });
  it("retries when first attempt fails", async () => {
    let invocations = 0;
    const mockFn = async () => {
      invocations++;

      switch (invocations) {
        case 1:
          throw new Error("Mock failure");
        default:
          return Promise.resolve(true);
      }
    };

    const result = await poll(mockFn, 0, 60);

    expect(result).toStrictEqual(true);
    expect(invocations).toStrictEqual(2);
  });
  it("gives up after the timeout is exceeded", async () => {
    let invocations = 0;
    const mockFn = async () => {
      invocations++;

      throw new Error("Mock failure");
    };
    // Freeze time until after 5 failed attempts
    const mockEpochSupplier = () => {
      if (invocations < 5) {
        return 0;
      } else {
        return 10 * 1000; // Skip ahead 10 seconds
      }
    };

    try {
      await poll(mockFn, 0, 1, mockEpochSupplier);
      expect.fail("No error thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }

    expect(invocations).toStrictEqual(5);
  });
});

describe("pollForAccount", () => {
  it("invokes callback when user exists", async () => {
    const gatewayResponse: AccountResponse = {
      msaId: "47",
      handle: {
        base_handle: "mock-siwf-ew",
        canonical_base: "m0ck-s1wf-ew",
        suffix: 0,
      },
    };
    const mockFetchFn: GatewayFetchFn = async (method, path) => {
      expect(method).toStrictEqual("GET");
      expect(path.startsWith("/v1/accounts/account")).toStrictEqual(true);

      return new Response(JSON.stringify(gatewayResponse), { status: 200 });
    };
    const address = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";
    const callbackFn: MsaCreationCallbackFn = (data) => {
      expect(data).toStrictEqual(gatewayResponse);
    };

    await pollForAccount(mockFetchFn, address, callbackFn);
  });
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
