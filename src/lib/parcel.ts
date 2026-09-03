import type { ParcelProperties } from '../types/parcel'

export function formatArea(value: number | null | undefined) {
  if (value === null || value === undefined) return '—'
  return `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value)} m²`
}

export function parcelLabel(properties: ParcelProperties) {
  return properties.NIB
    ? `NIB ${properties.NIB}`
    : `Bidang ${properties.OBJECTID}`
}
