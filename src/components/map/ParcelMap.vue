<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as maplibregl from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import BasemapControl from './BasemapControl.vue'
import {
  BASEMAP_OPTIONS,
  GOOGLE_IMAGERY_TILES,
  HUMANITARIAN_TILES,
  MAP_THEME_COLORS,
  MAP_LAYER,
  MAP_SOURCE,
  OPEN_FREE_MAP_DARK_STYLE_URL,
  OPEN_FREE_MAP_GLYPHS_URL,
  OPEN_FREE_MAP_SPRITE_URL,
  OPENSTREETMAP_TILES,
} from '../../lib/map/constants'
import type { BasemapId } from '../../lib/map/constants'
import { getBuildingFeatureBounds, getCollectionBounds, getFeatureBounds } from '../../lib/map/geometry'
import { formatArea, parcelLabel } from '../../lib/parcel'
import type {
  BuildingCollection,
  MapRenderStats,
  ParcelCollection,
  ParcelFeature,
  ParcelMapApi,
} from '../../types/parcel'
import type { ThemeMode } from '../../types/theme'

const props = defineProps<{
  buildingCollection: BuildingCollection
  buildingFillOpacity: number
  buildingStrokeOpacity: number
  buildingsVisible: boolean
  collection: ParcelCollection
  parcelFillOpacity: number
  parcelStrokeOpacity: number
  parcelsVisible: boolean
  selectedBuildingId: number | null
  selectedParcelId: number | null
  theme: ThemeMode
}>()

const emit = defineEmits<{
  clearSelection: []
  error: [message: string]
  openPanel: []
  ready: []
  selectBuilding: [buildingId: number]
  select: [parcelId: number]
  stats: [stats: MapRenderStats]
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
const sourceReady = ref(false)
const localError = ref('')
const activeBasemap = ref<BasemapId>('googleImagery')

let map: maplibregl.Map | null = null
let popup: maplibregl.Popup | null = null
let resizeObserver: ResizeObserver | null = null
let readyTimer: ReturnType<typeof setTimeout> | null = null
let hoveredId: string | number | undefined
let readyEmitted = false
let openFreeMapDarkLoaded = false
let openFreeMapDarkLayerIds: string[] = []
let suppressPopupClose = false

function cloneParcelCollection() {
  return JSON.parse(JSON.stringify(props.collection)) as ParcelCollection
}

function cloneBuildingCollection() {
  const collection = JSON.parse(JSON.stringify(props.buildingCollection)) as BuildingCollection
  return {
    ...collection,
    features: collection.features.map((feature, index) => ({
      ...feature,
      properties: { ...feature.properties, __mapFeatureId: index },
    })),
  }
}

function syncVisibility() {
  if (!map) return
  for (const layerId of [
    MAP_LAYER.parcelFill,
    MAP_LAYER.parcelOutline,
    MAP_LAYER.parcelSelected,
  ]) {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(
        layerId,
        'visibility',
        props.parcelsVisible ? 'visible' : 'none',
      )
    }
  }
  for (const layerId of [
    MAP_LAYER.buildingFill,
    MAP_LAYER.buildingOutline,
    MAP_LAYER.buildingSelected,
  ]) {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(
        layerId,
        'visibility',
        props.buildingsVisible ? 'visible' : 'none',
      )
    }
  }
}

function syncBasemap() {
  if (!map) return
  for (const basemap of BASEMAP_OPTIONS) {
    const layerIds = basemap.id === 'openFreeMapDark'
      ? openFreeMapDarkLayerIds
      : [basemap.layerId]
    for (const layerId of layerIds) {
      if (!map.getLayer(layerId)) continue
      map.setLayoutProperty(
        layerId,
        'visibility',
        basemap.id === activeBasemap.value ? 'visible' : 'none',
      )
    }
  }
}

function selectBasemap(basemap: BasemapId) {
  activeBasemap.value = basemap
}

type OpenFreeMapStyle = {
  sources: Record<string, maplibregl.SourceSpecification>
  layers: maplibregl.LayerSpecification[]
}

async function loadOpenFreeMapDark() {
  if (!map || openFreeMapDarkLoaded) return
  try {
    const response = await fetch(OPEN_FREE_MAP_DARK_STYLE_URL)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const style = await response.json() as OpenFreeMapStyle
    if (!style.sources || !style.layers) throw new Error('Format style tidak valid')

    for (const [sourceId, source] of Object.entries(style.sources)) {
      const id = `ofm-dark-${sourceId}`
      if (!map.getSource(id)) map.addSource(id, source)
    }

    for (const sourceLayer of style.layers) {
      const id = `ofm-dark-${sourceLayer.id}`
      const layer = { ...sourceLayer, id } as maplibregl.LayerSpecification
      if ('source' in layer && layer.source) {
        layer.source = `ofm-dark-${layer.source}`
      }
      map.addLayer(layer, MAP_LAYER.parcelFill)
      openFreeMapDarkLayerIds.push(id)
    }

    openFreeMapDarkLoaded = true
    syncBasemap()
  } catch (error) {
    console.warn('OpenFreeMap Dark gagal dimuat.', error)
  }
}

function syncOpacity() {
  if (!map) return
  if (map.getLayer(MAP_LAYER.parcelFill)) {
    const hoverOpacity = props.parcelFillOpacity === 0
      ? 0
      : Math.min(1, props.parcelFillOpacity + 0.14)
    map.setPaintProperty(MAP_LAYER.parcelFill, 'fill-opacity', [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      hoverOpacity,
      props.parcelFillOpacity,
    ])
  }
  if (map.getLayer(MAP_LAYER.parcelOutline)) {
    map.setPaintProperty(MAP_LAYER.parcelOutline, 'line-opacity', props.parcelStrokeOpacity)
  }
  if (map.getLayer(MAP_LAYER.parcelSelected)) {
    map.setPaintProperty(MAP_LAYER.parcelSelected, 'line-opacity', props.parcelStrokeOpacity)
  }
  if (map.getLayer(MAP_LAYER.buildingFill)) {
    map.setPaintProperty(MAP_LAYER.buildingFill, 'fill-opacity', props.buildingFillOpacity)
  }
  if (map.getLayer(MAP_LAYER.buildingOutline)) {
    map.setPaintProperty(MAP_LAYER.buildingOutline, 'line-opacity', props.buildingStrokeOpacity)
  }
}

function syncTheme() {
  if (!map) return
  const colors = MAP_THEME_COLORS[props.theme]

  if (map.getLayer(MAP_LAYER.googleImagery)) {
    map.setPaintProperty(
      MAP_LAYER.googleImagery,
      'raster-brightness-max',
      props.theme === 'light' ? 1 : 0.78,
    )
  }
  if (map.getLayer(MAP_LAYER.parcelFill)) {
    map.setPaintProperty(MAP_LAYER.parcelFill, 'fill-color', colors.parcelFill)
  }
  if (map.getLayer(MAP_LAYER.parcelOutline)) {
    map.setPaintProperty(MAP_LAYER.parcelOutline, 'line-color', colors.parcelOutline)
  }
  if (map.getLayer(MAP_LAYER.parcelSelected)) {
    map.setPaintProperty(MAP_LAYER.parcelSelected, 'line-color', colors.selection)
  }
  if (map.getLayer(MAP_LAYER.buildingFill)) {
    map.setPaintProperty(MAP_LAYER.buildingFill, 'fill-color', colors.buildingFill)
  }
  if (map.getLayer(MAP_LAYER.buildingOutline)) {
    map.setPaintProperty(MAP_LAYER.buildingOutline, 'line-color', colors.buildingOutline)
  }
  if (map.getLayer(MAP_LAYER.buildingSelected)) {
    map.setPaintProperty(MAP_LAYER.buildingSelected, 'line-color', colors.selection)
  }
}

function syncSelection() {
  if (!map) return
  if (map.getLayer(MAP_LAYER.parcelSelected)) {
    const parcelFilter: maplibregl.FilterSpecification = [
      '==',
      ['get', 'OBJECTID'],
      props.selectedParcelId ?? -1,
    ]
    map.setFilter(MAP_LAYER.parcelSelected, parcelFilter)
  }
  if (map.getLayer(MAP_LAYER.buildingSelected)) {
    const buildingFilter: maplibregl.FilterSpecification = [
      '==',
      ['get', '__mapFeatureId'],
      props.selectedBuildingId ?? -1,
    ]
    map.setFilter(MAP_LAYER.buildingSelected, buildingFilter)
  }
  if (props.selectedParcelId === null && props.selectedBuildingId === null) removePopup()
}

function updateRenderStats() {
  if (
    !map
    || !sourceReady.value
    || !map.getLayer(MAP_LAYER.parcelFill)
    || !map.getLayer(MAP_LAYER.buildingFill)
  ) return

  const renderedParcelIds = new Set(
    map
      .queryRenderedFeatures({ layers: [MAP_LAYER.parcelFill] })
      .map((feature) => Number(feature.properties.OBJECTID))
      .filter(Number.isFinite),
  )
  const renderedBuildingIds = new Set(
    map
      .queryRenderedFeatures({ layers: [MAP_LAYER.buildingFill] })
      .map((feature) => Number(feature.properties.__mapFeatureId))
      .filter(Number.isFinite),
  )
  emit('stats', {
    renderedBuildings: renderedBuildingIds.size,
    renderedFeatures: renderedParcelIds.size,
  })
}

function markSourceReady() {
  if (readyEmitted) return
  readyEmitted = true
  sourceReady.value = true
  if (readyTimer) clearTimeout(readyTimer)
  emit('ready')
  fitAll()
  requestAnimationFrame(updateRenderStats)
}

function fitAll() {
  if (!map || !props.collection.features.length) return
  map.fitBounds(getCollectionBounds(props.collection), {
    padding: window.innerWidth <= 760 ? 28 : 54,
    duration: sourceReady.value ? 500 : 0,
    maxZoom: 18,
  })
}

function createPopupContent(feature: ParcelFeature) {
  const content = document.createElement('div')
  content.className = 'parcel-popup'
  const title = document.createElement('strong')
  title.textContent = parcelLabel(feature.properties)
  const rightType = document.createElement('span')
  rightType.textContent = feature.properties.TIPEHAK ?? 'Tipe hak tidak tersedia'
  const area = document.createElement('span')
  area.textContent = formatArea(feature.properties.LUASPETA)
  content.append(title, rightType, area)
  return content
}

function formatBuildingArea(value: unknown) {
  const area = Number(value)
  return Number.isFinite(area)
    ? `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(area)} m²`
    : 'Luas tidak tersedia'
}

function buildingLabel(buildingId: number) {
  return `Bangunan #${buildingId + 1}`
}

function createBuildingPopupContent(
  feature: BuildingCollection['features'][number],
  buildingId: number,
) {
  const content = document.createElement('div')
  content.className = 'parcel-popup building-popup'
  const title = document.createElement('strong')
  title.textContent = buildingLabel(buildingId)
  const area = document.createElement('span')
  area.textContent = `Luas: ${formatBuildingArea(feature.properties.area_in_me)}`
  content.append(title, area)
  return content
}

function removePopup() {
  if (!popup) return
  suppressPopupClose = true
  popup.remove()
  popup = null
  suppressPopupClose = false
}

function activatePopup(nextPopup: maplibregl.Popup) {
  popup = nextPopup
  nextPopup.on('close', () => {
    if (popup === nextPopup) popup = null
    if (!suppressPopupClose) emit('clearSelection')
  })
}

function showPopup(feature: ParcelFeature, coordinate: [number, number]) {
  if (!map) return
  removePopup()
  const nextPopup = new maplibregl.Popup({ closeButton: true, offset: 12, maxWidth: '280px' })
    .setLngLat(coordinate)
    .setDOMContent(createPopupContent(feature))
    .addTo(map)
  activatePopup(nextPopup)
}

function showBuildingPopup(
  feature: BuildingCollection['features'][number],
  coordinate: [number, number],
  buildingId: number,
) {
  if (!map) return
  removePopup()
  const nextPopup = new maplibregl.Popup({ closeButton: true, offset: 12, maxWidth: '280px' })
    .setLngLat(coordinate)
    .setDOMContent(createBuildingPopupContent(feature, buildingId))
    .addTo(map)
  activatePopup(nextPopup)
}

function focusParcel(parcelId: number) {
  if (!map) return
  const feature = props.collection.features.find((item) => item.id === parcelId)
  if (!feature) return
  const bounds = getFeatureBounds(feature)
  map.fitBounds(bounds, { padding: 90, duration: 650, maxZoom: 19 })
  showPopup(feature, bounds.getCenter().toArray() as [number, number])
}

function focusBuilding(buildingId: number) {
  if (!map) return
  const feature = props.buildingCollection.features[buildingId]
  if (!feature) return
  const bounds = getBuildingFeatureBounds(feature)
  map.fitBounds(bounds, { padding: 90, duration: 650, maxZoom: 19 })
  showBuildingPopup(feature, bounds.getCenter().toArray() as [number, number], buildingId)
}

function handleMapClick(event: maplibregl.MapLayerMouseEvent) {
  const id = Number(event.features?.[0]?.properties.OBJECTID)
  const feature = props.collection.features.find((item) => item.id === id)
  if (!feature) return
  emit('select', id)
  showPopup(feature, event.lngLat.toArray() as [number, number])
}

function handleBuildingClick(event: maplibregl.MapLayerMouseEvent) {
  const id = Number(event.features?.[0]?.properties.__mapFeatureId)
  const feature = props.buildingCollection.features[id]
  if (!feature) return
  emit('selectBuilding', id)
  showBuildingPopup(feature, event.lngLat.toArray() as [number, number], id)
}

function handleMouseMove(event: maplibregl.MapLayerMouseEvent) {
  if (!map) return
  map.getCanvas().style.cursor = 'pointer'
  if (hoveredId !== undefined) {
    map.setFeatureState({ source: MAP_SOURCE.parcels, id: hoveredId }, { hover: false })
  }
  hoveredId = event.features?.[0]?.id
  if (hoveredId !== undefined) {
    map.setFeatureState({ source: MAP_SOURCE.parcels, id: hoveredId }, { hover: true })
  }
}

function handleMouseLeave() {
  if (!map) return
  map.getCanvas().style.cursor = ''
  if (hoveredId !== undefined) {
    map.setFeatureState({ source: MAP_SOURCE.parcels, id: hoveredId }, { hover: false })
  }
  hoveredId = undefined
}

function reportError(message: string) {
  if (localError.value === message) return
  localError.value = message
  emit('error', message)
}

function initializeMap() {
  if (!mapContainer.value) return
  const parcelData = cloneParcelCollection()
  const buildingData = cloneBuildingCollection()
  const themeColors = MAP_THEME_COLORS[props.theme]

  try {
    // MapLibre v6's ESM worker must be bundled explicitly by Vite. Without
    // this URL, Vite prebundling points to a non-existent sibling worker and
    // raster tiles render while every GeoJSON/vector layer silently stalls.
    maplibregl.setWorkerUrl(maplibreWorkerUrl)
    map = new maplibregl.Map({
      container: mapContainer.value,
      center: [115.2444, -8.4896],
      zoom: 16,
      minZoom: 3,
      maxZoom: 21,
      attributionControl: false,
      style: {
        version: 8,
        glyphs: OPEN_FREE_MAP_GLYPHS_URL,
        sprite: OPEN_FREE_MAP_SPRITE_URL,
        sources: {
          [MAP_SOURCE.googleImagery]: {
            type: 'raster',
            tiles: GOOGLE_IMAGERY_TILES,
            tileSize: 256,
            attribution: 'Imagery © Google',
            maxzoom: 21,
          },
          [MAP_SOURCE.humanitarian]: {
            type: 'raster',
            tiles: HUMANITARIAN_TILES,
            tileSize: 256,
            attribution: '© OpenStreetMap contributors, Humanitarian OpenStreetMap Team',
            maxzoom: 20,
          },
          [MAP_SOURCE.openStreetMap]: {
            type: 'raster',
            tiles: OPENSTREETMAP_TILES,
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
            maxzoom: 19,
          },
          [MAP_SOURCE.parcels]: {
            type: 'geojson',
            data: parcelData,
            promoteId: 'OBJECTID',
          },
          [MAP_SOURCE.buildings]: {
            type: 'geojson',
            data: buildingData,
          },
        },
        layers: [
          {
            id: MAP_LAYER.googleImagery,
            type: 'raster',
            source: MAP_SOURCE.googleImagery,
            paint: {
              'raster-saturation': -0.16,
              'raster-contrast': 0.08,
              'raster-brightness-max': props.theme === 'light' ? 1 : 0.78,
              'raster-fade-duration': 0,
            },
          },
          {
            id: MAP_LAYER.humanitarian,
            type: 'raster',
            source: MAP_SOURCE.humanitarian,
            layout: { visibility: 'none' },
            paint: { 'raster-fade-duration': 0 },
          },
          {
            id: MAP_LAYER.openStreetMap,
            type: 'raster',
            source: MAP_SOURCE.openStreetMap,
            layout: { visibility: 'none' },
            paint: { 'raster-fade-duration': 0 },
          },
          {
            id: MAP_LAYER.parcelFill,
            type: 'fill',
            source: MAP_SOURCE.parcels,
            paint: {
              'fill-color': themeColors.parcelFill,
              'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                props.parcelFillOpacity === 0 ? 0 : Math.min(1, props.parcelFillOpacity + 0.14),
                props.parcelFillOpacity,
              ],
            },
          },
          {
            id: MAP_LAYER.parcelOutline,
            type: 'line',
            source: MAP_SOURCE.parcels,
            paint: {
              'line-color': themeColors.parcelOutline,
              'line-width': ['interpolate', ['linear'], ['zoom'], 14, 1.5, 19, 3],
              'line-opacity': props.parcelStrokeOpacity,
            },
          },
          {
            id: MAP_LAYER.buildingFill,
            type: 'fill',
            source: MAP_SOURCE.buildings,
            paint: {
              'fill-color': themeColors.buildingFill,
              'fill-opacity': props.buildingFillOpacity,
            },
          },
          {
            id: MAP_LAYER.buildingOutline,
            type: 'line',
            source: MAP_SOURCE.buildings,
            paint: {
              'line-color': themeColors.buildingOutline,
              'line-width': ['interpolate', ['linear'], ['zoom'], 14, 1.2, 19, 2.5],
              'line-opacity': props.buildingStrokeOpacity,
            },
          },
          {
            id: MAP_LAYER.buildingSelected,
            type: 'line',
            source: MAP_SOURCE.buildings,
            filter: ['==', ['get', '__mapFeatureId'], -1],
            paint: {
              'line-color': themeColors.selection,
              'line-width': ['interpolate', ['linear'], ['zoom'], 14, 2, 19, 4],
              'line-opacity': props.buildingStrokeOpacity,
            },
          },
          {
            id: MAP_LAYER.parcelSelected,
            type: 'line',
            source: MAP_SOURCE.parcels,
            filter: ['==', ['get', 'OBJECTID'], -1],
            paint: {
              'line-color': themeColors.selection,
              'line-width': 5,
              'line-opacity': props.parcelStrokeOpacity,
            },
          },
        ],
      },
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric', maxWidth: 110 }), 'bottom-right')

    map.on('mousemove', MAP_LAYER.parcelFill, handleMouseMove)
    map.on('mouseleave', MAP_LAYER.parcelFill, handleMouseLeave)
    map.on('click', MAP_LAYER.parcelFill, handleMapClick)
    map.on('click', MAP_LAYER.buildingFill, handleBuildingClick)
    map.on('mouseenter', MAP_LAYER.buildingFill, () => {
      if (map) map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', MAP_LAYER.buildingFill, () => {
      if (map) map.getCanvas().style.cursor = ''
    })
    map.on('idle', updateRenderStats)
    map.on('style.load', () => {
      syncBasemap()
      syncVisibility()
      syncOpacity()
      syncTheme()
      syncSelection()
      fitAll()
    })
    map.on('sourcedata', (event: maplibregl.MapSourceDataEvent) => {
      if (event.sourceId === MAP_SOURCE.parcels && event.isSourceLoaded) {
        markSourceReady()
      }
    })
    map.on('load', () => {
      void loadOpenFreeMapDark()
      if (map?.isSourceLoaded(MAP_SOURCE.parcels)) markSourceReady()
    })
    map.on('error', (event: maplibregl.ErrorEvent) => {
      const message = event.error?.message ?? 'MapLibre mengalami error.'
      console.error('[MapLibre]', event.error)
      if (!readyEmitted && !message.includes('google.com')) {
        reportError(`Layer persil gagal diproses: ${message}`)
      }
    })

    readyTimer = setTimeout(() => {
      if (!readyEmitted) {
        reportError('Layer persil belum siap setelah 8 detik. Periksa dukungan WebGL dan console browser.')
      }
    }, 8_000)

    resizeObserver = new ResizeObserver(() => {
      map?.resize()
      updateRenderStats()
    })
    resizeObserver.observe(mapContainer.value)
  } catch (caughtError) {
    reportError(
      caughtError instanceof Error
        ? `Peta gagal dibuat: ${caughtError.message}`
        : 'Peta gagal dibuat.',
    )
  }
}

watch(activeBasemap, syncBasemap)
watch(() => props.parcelsVisible, syncVisibility)
watch(() => props.buildingsVisible, syncVisibility)
watch(() => props.parcelFillOpacity, syncOpacity)
watch(() => props.parcelStrokeOpacity, syncOpacity)
watch(() => props.buildingFillOpacity, syncOpacity)
watch(() => props.buildingStrokeOpacity, syncOpacity)
watch(() => props.theme, syncTheme)
watch(() => props.selectedBuildingId, syncSelection)
watch(() => props.selectedParcelId, syncSelection)

defineExpose<ParcelMapApi>({ fitAll, focusBuilding, focusParcel })

onMounted(initializeMap)
onBeforeUnmount(() => {
  if (readyTimer) clearTimeout(readyTimer)
  resizeObserver?.disconnect()
  removePopup()
  map?.remove()
})
</script>

<template>
  <section class="map-shell" aria-label="Peta bidang tanah Amandari">
    <div ref="mapContainer" class="map-canvas"></div>
    <div v-if="!sourceReady && !localError" class="map-message">
      <span></span>
      Memproses layer persil…
    </div>
    <div v-if="localError" class="map-message map-error">{{ localError }}</div>
    <BasemapControl :active-basemap="activeBasemap" @select="selectBasemap" />
    <button class="mobile-panel-button" type="button" @click="emit('openPanel')">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
      Data bidang
    </button>
  </section>
</template>

<style>
.map-shell,
.map-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
}

.map-canvas { background: var(--surface-elevated); }

.map-message {
  position: absolute;
  z-index: 4;
  top: 16px;
  left: 16px;
  display: flex;
  max-width: min(420px, calc(100% - 88px));
  align-items: center;
  gap: 9px;
  padding: 9px 12px;
  color: var(--text-soft);
  background: var(--surface-raised);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  font-size: 11px;
}

.map-message > span {
  width: 11px;
  height: 11px;
  border: 2px solid var(--border-strong);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: map-spin 700ms linear infinite;
}

.map-error { color: var(--error-text); }
@keyframes map-spin { to { transform: rotate(360deg); } }

.maplibregl-ctrl-top-right { top: 12px; right: 12px; }
.maplibregl-ctrl-group { overflow: hidden; background: var(--surface); border: 1px solid var(--border-strong); border-radius: 6px; box-shadow: 0 2px 8px var(--shadow); }
.maplibregl-ctrl-group button { width: 34px; height: 34px; }
.maplibregl-ctrl-group button + button { border-top-color: var(--border); }
.maplibregl-ctrl button .maplibregl-ctrl-icon { filter: var(--map-control-icon-filter); }
.maplibregl-ctrl-scale { color: var(--text); background: var(--map-scale-background); border-color: var(--text-soft); font-family: 'Manrope', sans-serif; font-size: 9px; }
.maplibregl-popup-content { padding: 0; color: var(--text); background: var(--surface-raised); border: 1px solid var(--border-strong); border-radius: 6px; box-shadow: 0 4px 14px var(--shadow-strong); }
.maplibregl-popup-close-button { width: 28px; height: 28px; color: var(--muted-strong); font-size: 17px; line-height: 24px; }
.maplibregl-popup-close-button:hover { color: var(--accent-hover); background: var(--surface-hover); }
.maplibregl-popup-anchor-bottom .maplibregl-popup-tip { border-top-color: var(--surface-raised); }
.maplibregl-popup-anchor-top .maplibregl-popup-tip { border-bottom-color: var(--surface-raised); }
.parcel-popup { display: flex; min-width: 175px; flex-direction: column; gap: 4px; padding: 11px 13px; }
.parcel-popup strong { color: var(--accent-strong); font-size: 12px; }
.parcel-popup span { color: var(--muted); font-family: 'Manrope', sans-serif; font-size: 9px; }
.building-popup strong { padding-right: 20px; color: var(--building-accent); }

.mobile-panel-button { display: none; }

@media (max-width: 760px) {
  .mobile-panel-button {
    position: absolute;
    z-index: 4;
    top: 14px;
    left: 14px;
    display: flex;
    height: 38px;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    color: var(--text);
    background: var(--surface);
    border: 1px solid var(--border-strong);
    border-radius: 6px;
    box-shadow: 0 2px 8px var(--shadow);
    font-size: 11px;
    font-weight: 600;
  }
  .mobile-panel-button svg { width: 16px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 1.7; }
  .map-message { top: auto; bottom: 38px; left: 14px; }
}
</style>
