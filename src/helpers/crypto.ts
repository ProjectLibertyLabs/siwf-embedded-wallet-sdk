import { x25519 } from '@noble/curves/ed25519.js';
import { bytesToHex } from '@noble/curves/abstract/utils'
import { HexString } from '@frequency-chain/ethereum-utils';


export function generateGraphKeyPair(): { privateKey: HexString, publicKey: HexString } {
  const privateKey = x25519.utils.randomPrivateKey()
  const publicKey = x25519.getPublicKey(privateKey)

  const encodedPrivateKeyValue: HexString = `0x${bytesToHex(privateKey)}`
  const encodedPublicKeyValue: HexString = `0x${bytesToHex(publicKey)}`

  return { privateKey: encodedPrivateKeyValue, publicKey: encodedPublicKeyValue }
}
