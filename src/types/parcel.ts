export interface ParcelProperties {
  OBJECTID: number
  KECAMATAN: string | null
  KELURAHAN: string | null
  TIPEHAK: string | null
  NIB: string | null
  LUASTERTUL: number | null
  LUASPETA: number | null
  Tahap: number | null
  TIPE: string | null
  NOMOR: number | null
  NIBNIBEL: string | null
  NAMA: string | null
  ASALHAK: string | null
  DAFTAR: string | null
  BERAKHIR: string | null
}

export interface ParcelFeature {
  type: 'Feature'
  id: number
  properties: ParcelProperties
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
}

export interface ParcelCollection {
  type: 'FeatureCollection'
  features: ParcelFeature[]
}

export interface BuildingFeature {
  type: 'Feature'
  id?: number | string
  properties: Record<string, unknown>
  geometry: {
    type: 'MultiPolygon'
    coordinates: number[][][][]
  }
}

export interface BuildingCollection {
  type: 'FeatureCollection'
  features: BuildingFeature[]
}

export interface MapRenderStats {
  sourceFeatures: number
  renderedFeatures: number
}

export interface ParcelMapApi {
  fitAll: () => void
  focusParcel: (parcelId: number) => void
}
