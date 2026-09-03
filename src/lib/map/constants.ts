export const MAP_SOURCE = {
  googleImagery: 'google-imagery',
  humanitarian: 'osm-humanitarian',
  openStreetMap: 'openstreetmap',
  parcels: 'parcels',
  buildings: 'buildings',
} as const

export const MAP_LAYER = {
  googleImagery: 'basemap-google-imagery',
  humanitarian: 'basemap-osm-humanitarian',
  openStreetMap: 'basemap-openstreetmap',
  openFreeMapDark: 'basemap-open-free-map-dark',
  parcelFill: 'parcel-fill',
  parcelOutline: 'parcel-outline',
  parcelSelected: 'parcel-selected',
  buildingFill: 'building-fill',
  buildingOutline: 'building-outline',
  buildingSelected: 'building-selected',
} as const

export const GOOGLE_IMAGERY_TILES = [
  'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
  'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
  'https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
  'https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
]

export const HUMANITARIAN_TILES = [
  'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  'https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  'https://c.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
]

export const OPENSTREETMAP_TILES = [
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
]

export const OPEN_FREE_MAP_DARK_STYLE_URL = 'https://tiles.openfreemap.org/styles/dark'
export const OPEN_FREE_MAP_GLYPHS_URL = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf'
export const OPEN_FREE_MAP_SPRITE_URL = 'https://tiles.openfreemap.org/sprites/ofm_f384/ofm'

export const BASEMAP_OPTIONS = [
  {
    id: 'googleImagery',
    label: 'Google Imagery',
    layerId: MAP_LAYER.googleImagery,
    previewUrl: 'https://mt0.google.com/vt/lyrs=s&x=107495&y=68638&z=17',
  },
  {
    id: 'humanitarian',
    label: 'OSM Humanitarian',
    layerId: MAP_LAYER.humanitarian,
    previewUrl: 'https://a.tile.openstreetmap.fr/hot/17/107495/68638.png',
  },
  {
    id: 'openStreetMap',
    label: 'OpenStreetMap',
    layerId: MAP_LAYER.openStreetMap,
    previewUrl: 'https://tile.openstreetmap.org/17/107495/68638.png',
  },
  {
    id: 'openFreeMapDark',
    label: 'OpenFreeMap Dark',
    layerId: MAP_LAYER.openFreeMapDark,
    previewUrl: '',
  },
] as const

export type BasemapId = (typeof BASEMAP_OPTIONS)[number]['id']

export const PARCEL_COLOR = '#d6b454'
export const BUILDING_COLOR = '#9b6b54'
