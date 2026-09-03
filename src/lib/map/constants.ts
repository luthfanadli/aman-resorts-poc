export const MAP_SOURCE = {
  googleImagery: 'google-imagery',
  cartoPositron: 'carto-positron',
  openStreetMap: 'openstreetmap',
  cartoDark: 'carto-dark',
  parcels: 'parcels',
  buildings: 'buildings',
} as const

export const MAP_LAYER = {
  googleImagery: 'basemap-google-imagery',
  cartoPositron: 'basemap-carto-positron',
  openStreetMap: 'basemap-openstreetmap',
  cartoDark: 'basemap-carto-dark',
  parcelFill: 'parcel-fill',
  parcelOutline: 'parcel-outline',
  parcelSelected: 'parcel-selected',
  buildingFill: 'building-fill',
  buildingOutline: 'building-outline',
} as const

export const GOOGLE_IMAGERY_TILES = [
  'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
  'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
  'https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
  'https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
]

export const CARTO_POSITRON_TILES = [
  'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
]

export const OPENSTREETMAP_TILES = [
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
]

export const CARTO_DARK_TILES = [
  'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
]

export const BASEMAP_OPTIONS = [
  {
    id: 'googleImagery',
    label: 'Google Imagery',
    layerId: MAP_LAYER.googleImagery,
    previewUrl: 'https://mt0.google.com/vt/lyrs=s&x=107495&y=68638&z=17',
  },
  {
    id: 'positron',
    label: 'CartoDB Positron (Light)',
    layerId: MAP_LAYER.cartoPositron,
    previewUrl: 'https://basemaps.cartocdn.com/light_all/1/1/1@2x.png',
  },
  {
    id: 'openStreetMap',
    label: 'OpenStreetMap',
    layerId: MAP_LAYER.openStreetMap,
    previewUrl: 'https://tile.openstreetmap.org/17/107495/68638.png',
  },
  {
    id: 'darkmatter',
    label: 'CartoDB Darkmatter (Dark)',
    layerId: MAP_LAYER.cartoDark,
    previewUrl: 'https://basemaps.cartocdn.com/dark_all/1/1/1@2x.png',
  },
] as const

export type BasemapId = (typeof BASEMAP_OPTIONS)[number]['id']

export const PARCEL_COLOR = '#d6b454'
export const BUILDING_COLOR = '#9b6b54'
