import { formatEther } from "viem"

const WEI_PER_GWEI = 1_000_000_000n
const WEI_PER_MICRO_ETH = 1_000_000_000_000n

function normalizeEthText(value: string) {
  return value.replace(/\s*ETH$/i, "").replace(/,/g, "").trim()
}

function parseTinyWei(amount: string) {
  const [whole, fraction = ""] = amount.split(".")

  if (whole !== "0" || !fraction) {
    return null
  }

  const weiText = fraction.padEnd(18, "0").slice(0, 18)

  if (!/^\d+$/.test(weiText)) {
    return null
  }

  const wei = BigInt(weiText)
  return wei > 0n ? wei : null
}

function formatTinyWei(wei: bigint) {
  if (wei >= WEI_PER_GWEI) {
    const whole = wei / WEI_PER_GWEI
    const remainder = wei % WEI_PER_GWEI

    if (remainder === 0n) {
      return `${whole.toLocaleString()} gwei`
    }

    const decimal = remainder.toString().padStart(9, "0").replace(/0+$/, "").slice(0, 4)
    return `${whole.toLocaleString()}.${decimal} gwei`
  }

  return `${wei.toLocaleString()} wei`
}

export function formatCompactEthAmount(value: bigint | string) {
  const amount = typeof value === "bigint" ? formatEther(value) : normalizeEthText(value)

  if (!amount || amount === "0") {
    return "0 ETH"
  }

  if (!/^\d+(\.\d+)?$/.test(amount)) {
    return String(value)
  }

  const tinyWei = typeof value === "bigint" && value > 0n && value < WEI_PER_MICRO_ETH
    ? value
    : parseTinyWei(amount)

  if (tinyWei !== null && tinyWei > 0n && tinyWei < WEI_PER_MICRO_ETH) {
    return formatTinyWei(tinyWei)
  }

  const numericAmount = Number(amount)

  if (!Number.isFinite(numericAmount)) {
    return `${amount} ETH`
  }

  const maximumFractionDigits = numericAmount >= 1 ? 4 : 6
  return `${numericAmount.toLocaleString(undefined, { maximumFractionDigits })} ETH`
}
