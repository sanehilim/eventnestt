"use client"

import { Encryptable, assertCorrectEncryptedItemInput } from "@cofhe/sdk"
import { createCofheClient, createCofheConfig } from "@cofhe/sdk/web"
import { arbSepolia, baseSepolia, sepolia } from "@cofhe/sdk/chains"
import { keccak256, padHex, stringToHex, toHex, type PublicClient, type WalletClient } from "viem"

const cofheConfig = createCofheConfig({
  supportedChains: [sepolia, arbSepolia, baseSepolia],
})

const cofheClient = createCofheClient(cofheConfig)

export type ConfidentialDecryptResult = {
  ctHash: `0x${string}`
  accessGranted: boolean
  signature: `0x${string}`
}

export type EncryptedUint128ContractInput = {
  ctHash: bigint
  securityZone: number
  utype: number
  signature: `0x${string}`
}

export function credentialToUint128(secret: string) {
  const hash = keccak256(stringToHex(secret.trim()))
  return BigInt(hash.slice(0, 34))
}

export async function connectCofhe(publicClient: PublicClient, walletClient: WalletClient) {
  await cofheClient.connect(publicClient as never, walletClient as never)
  return cofheClient
}

export async function encryptCredential(secret: string): Promise<EncryptedUint128ContractInput> {
  const [encryptedCredential] = await cofheClient
    .encryptInputs([Encryptable.uint128(credentialToUint128(secret))])
    .execute()

  assertCorrectEncryptedItemInput(encryptedCredential)
  return {
    ctHash: encryptedCredential.ctHash,
    securityZone: encryptedCredential.securityZone,
    utype: encryptedCredential.utype,
    signature: encryptedCredential.signature as `0x${string}`,
  }
}

export async function decryptAccessResult(accessResult: `0x${string}`): Promise<ConfidentialDecryptResult> {
  await cofheClient.permits.getOrCreateSelfPermit()
  const result = await cofheClient
    .decryptForTx(accessResult)
    .withPermit()
    .set404RetryTimeout(20_000)
    .execute()

  return {
    ctHash: typeof result.ctHash === "bigint" ? padHex(toHex(result.ctHash), { size: 32 }) : (result.ctHash as `0x${string}`),
    accessGranted: result.decryptedValue !== 0n,
    signature: result.signature,
  }
}
