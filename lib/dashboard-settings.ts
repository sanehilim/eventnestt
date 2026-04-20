export type DashboardSettings = {
  defaultPrivate: boolean
  requireInviteCode: boolean
  requireWhitelist: boolean
  hidePricing: boolean
  autoEncryptMetadata: boolean
  notifications: boolean
}

export const defaultDashboardSettings: DashboardSettings = {
  defaultPrivate: true,
  requireInviteCode: true,
  requireWhitelist: false,
  hidePricing: true,
  autoEncryptMetadata: true,
  notifications: true,
}

export function getDashboardSettingsStorageKey(address?: string) {
  return `eventnest:dashboard-settings:${address?.toLowerCase() || "guest"}`
}

export function readDashboardSettings(address?: string): DashboardSettings {
  if (typeof window === "undefined") {
    return defaultDashboardSettings
  }

  try {
    const stored = window.localStorage.getItem(getDashboardSettingsStorageKey(address))
    if (!stored) {
      return defaultDashboardSettings
    }

    const parsed = JSON.parse(stored)
    return {
      ...defaultDashboardSettings,
      ...(parsed && typeof parsed === "object" ? parsed : {}),
    }
  } catch {
    return defaultDashboardSettings
  }
}

export function saveDashboardSettings(settings: DashboardSettings, address?: string) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(
    getDashboardSettingsStorageKey(address),
    JSON.stringify(settings),
  )
}
