import {
  AccountResponse,
  ChainInfoResponse,
  GatewaySiwfResponse,
} from "../gateway-types";
import { mockGatewayNewUserResponse } from "../static-mocks/gateway-new-user";

// Matching mock user addresses
export const mockUserAddress = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";
export const mockControlKey =
  "5HYRCKHYJN9z5xUtfFkyMj4JUhsAwWyvuU8vKB1FcnYTf9ZQ";

// Provider Mocks
export const mockProviderControlKey =
  "f6cL4wq1HUNx11TcvdABNf9UNXXoyH47mVUwT59tzSFRW8yDH";
export const mockProviderEncodedRequest =
  "eyJyZXF1ZXN0ZWRTaWduYXR1cmVzIjp7InB1YmxpY0tleSI6eyJlbmNvZGVkVmFsdWUiOiJmNmNMNHdxMUhVTngxMVRjdmRBQk5mOVVOWFhveUg0N21WVXdUNTl0elNGUlc4eURIIiwiZW5jb2RpbmciOiJiYXNlNTgiLCJmb3JtYXQiOiJzczU4IiwidHlwZSI6IlNyMjU1MTkifSwic2lnbmF0dXJlIjp7ImFsZ28iOiJTcjI1NTE5IiwiZW5jb2RpbmciOiJiYXNlMTYiLCJlbmNvZGVkVmFsdWUiOiIweDA0MDdjZTgxNGI3Nzg2MWRmOTRkMTZiM2ZjYjMxN2QzN2EwN2FiYzJhN2Y5Y2Q3YzAyY2MyMjUyOWVlN2IzMmQ1Njc5NWY4OGJkNmI0YWQxMDZiNzJiOTFiNjI0NmE3ODM2NzFiY2QyNGNiMDFhYWYwZTkzMTZkYjVlMGNkMDg1In0sInBheWxvYWQiOnsiY2FsbGJhY2siOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJwZXJtaXNzaW9ucyI6WzUsNyw4LDksMTBdfX0sInJlcXVlc3RlZENyZWRlbnRpYWxzIjpbeyJ0eXBlIjoiVmVyaWZpZWRHcmFwaEtleUNyZWRlbnRpYWwiLCJoYXNoIjpbImJjaXFtZHZteGQ1NHp2ZTVraWZ5Y2dzZHRvYWhzNWVjZjRoYWwydHMzZWV4a2dvY3ljNW9jYTJ5Il19LHsiYW55T2YiOlt7InR5cGUiOiJWZXJpZmllZEVtYWlsQWRkcmVzc0NyZWRlbnRpYWwiLCJoYXNoIjpbImJjaXFlNHFvY3poZnRpY2k0ZHpmdmZiZWw3Zm80aDRzcjVncmNvM29vdnd5azZ5NHluZjQ0dHNpIl19LHsidHlwZSI6IlZlcmlmaWVkUGhvbmVOdW1iZXJDcmVkZW50aWFsIiwiaGFzaCI6WyJiY2lxanNwbmJ3cGMzd2p4NGZld2NlazVkYXlzZGpwYmY1eGppbXo1d251NXVqN2UzdnUydXducSJdfV19XX0";

// Returning User Mocks
export const mockProviderAccountResponse: AccountResponse = {
  msaId: "1",
};

export const mockReturningUserAccountResponse: AccountResponse = {
  msaId: "290",
  handle: {
    base_handle: "Bob",
    canonical_base: "Bob",
    suffix: 0,
  },
};

export const mockRetunringUserGatewaySiwfResponse: GatewaySiwfResponse = {
  controlKey: mockControlKey,
  msaId: mockReturningUserAccountResponse.msaId,
};

// New User Mocks
export const mockNewUserAccountResponse = null;

export const mockNewUserGatewaySiwfResponse: GatewaySiwfResponse = {
  ...mockGatewayNewUserResponse(),
  controlKey: mockControlKey,
};

export const mockChainInfoResponse: ChainInfoResponse = {
  blocknumber: 32,
  finalized_blocknumber: 32,
  genesis: "0x4a587bf17a404e3572747add7aab7bbe56e805a5479c6c436f07f36fcc8d3ae1", // From mainnet
  runtime_version: 2,
};
