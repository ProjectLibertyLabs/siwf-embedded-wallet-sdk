import * as nacl from "tweetnacl"
import { HexString } from '@frequency-chain/ethereum-utils';
import { u8aToHex } from "@polkadot/util";

export function generateGraphKeyPair(): { privateKey: HexString, publicKey: HexString } {
  const keyPair = nacl.box.keyPair()

  return { privateKey: u8aToHex(keyPair.secretKey), publicKey: u8aToHex(keyPair.publicKey) }
}
