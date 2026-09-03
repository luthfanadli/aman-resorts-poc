<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ParcelMap from './components/map/ParcelMap.vue'
import MapSidebar from './components/sidebar/MapSidebar.vue'
import BuildingModal from './components/building/BuildingModal.vue'
import { useBuildingData } from './composables/useBuildingData'
import { useParcelData } from './composables/useParcelData'
import buildingDataUrl from './assets/data/Bangunan.geojson?url'
import parcelDataUrl from './assets/data/Polygon Amandari.geojson?url'
import type {
  BuildingFeature,
  MapRenderStats,
  ParcelMapApi,
} from './types/parcel'
import type { ThemeMode } from './types/theme'

const { collection, isLoading, error: dataError } = useParcelData(parcelDataUrl)
const {
  collection: buildingCollection,
  isLoading: buildingsLoading,
  error: buildingDataError,
} = useBuildingData(buildingDataUrl)

const mapRef = ref<ParcelMapApi | null>(null)
const selectedBuildingId = ref<number | null>(null)
const selectedParcelId = ref<number | null>(null)
const parcelsVisible = ref(true)
const buildingsVisible = ref(true)
const parcelFillOpacity = ref(0.58)
const parcelStrokeOpacity = ref(1)
const buildingFillOpacity = ref(0.72)
const buildingStrokeOpacity = ref(1)
const savedTheme = window.localStorage.getItem('amandari-land-map-theme')
const theme = ref<ThemeMode>(savedTheme === 'light' ? 'light' : 'dark')
const mobilePanelOpen = ref(false)
const mapReady = ref(false)
const mapError = ref('')
const renderStats = ref<MapRenderStats>({
  renderedBuildings: 0,
  renderedFeatures: 0,
})
const buildingModalOpen = ref(false)

const selectedParcel = computed(() =>
  collection.value?.features.find((feature) => feature.id === selectedParcelId.value) ?? null,
)
const selectedBuilding = computed<BuildingFeature | null>(() =>
  selectedBuildingId.value === null
    ? null
    : buildingCollection.value?.features[selectedBuildingId.value] ?? null,
)

const visibleError = computed(() => dataError.value || buildingDataError.value || mapError.value)
const dataLoading = computed(() => isLoading.value || buildingsLoading.value)

watch(theme, (mode) => {
  document.documentElement.dataset.theme = mode
  window.localStorage.setItem('amandari-land-map-theme', mode)
}, { immediate: true })

function selectParcel(parcelId: number, focus = false) {
  selectedBuildingId.value = null
  selectedParcelId.value = parcelId
  if (focus) mapRef.value?.focusParcel(parcelId)
  if (window.innerWidth <= 760) mobilePanelOpen.value = false
}

function selectBuilding(buildingId: number, focus = false) {
  selectedParcelId.value = null
  selectedBuildingId.value = buildingId
  if (focus) mapRef.value?.focusBuilding(buildingId)
  if (window.innerWidth <= 760) mobilePanelOpen.value = false
}

function openBuildingModal() {
  if (selectedBuildingId.value !== null) buildingModalOpen.value = true
}

function closeBuildingModal() {
  buildingModalOpen.value = false
}

function clearSelection() {
  selectedBuildingId.value = null
  selectedParcelId.value = null
}

function resetView() {
  clearSelection()
  mapRef.value?.fitAll()
}

function handleMapReady() {
  mapReady.value = true
  mapError.value = ''
}
</script>

<template>
  <main class="map-app">
    <MapSidebar
      :building-count="buildingCollection?.features.length ?? 0"
      :building-collection="buildingCollection"
      :building-fill-opacity="buildingFillOpacity"
      :building-stroke-opacity="buildingStrokeOpacity"
      :buildings-visible="buildingsVisible"
      :collection="collection"
      :error="visibleError"
      :is-loading="dataLoading"
      :map-ready="mapReady"
      :mobile-open="mobilePanelOpen"
      :parcels-visible="parcelsVisible"
      :parcel-fill-opacity="parcelFillOpacity"
      :parcel-stroke-opacity="parcelStrokeOpacity"
      :render-stats="renderStats"
      :selected-building="selectedBuilding"
      :selected-building-id="selectedBuildingId"
      :selected-parcel="selectedParcel"
      :theme="theme"
      @close="mobilePanelOpen = false"
      @reset="resetView"
      @select="selectParcel($event, true)"
      @select-building="selectBuilding($event, true)"
      @toggle-buildings="buildingsVisible = !buildingsVisible"
      @toggle-parcels="parcelsVisible = !parcelsVisible"
      @manage-rooms="openBuildingModal"
      @update:theme="theme = $event"
      @update:building-fill-opacity="buildingFillOpacity = $event"
      @update:building-stroke-opacity="buildingStrokeOpacity = $event"
      @update:parcel-fill-opacity="parcelFillOpacity = $event"
      @update:parcel-stroke-opacity="parcelStrokeOpacity = $event"
    />

    <ParcelMap
      v-if="collection && buildingCollection"
      ref="mapRef"
      :building-collection="buildingCollection"
      :building-fill-opacity="buildingFillOpacity"
      :building-stroke-opacity="buildingStrokeOpacity"
      :buildings-visible="buildingsVisible"
      :collection="collection"
      :parcels-visible="parcelsVisible"
      :parcel-fill-opacity="parcelFillOpacity"
      :parcel-stroke-opacity="parcelStrokeOpacity"
      :selected-building-id="selectedBuildingId"
      :selected-parcel-id="selectedParcelId"
      :theme="theme"
      @error="mapError = $event"
      @clear-selection="clearSelection"
      @open-panel="mobilePanelOpen = true"
      @ready="handleMapReady"
      @select-building="selectBuilding"
      @select="selectParcel"
      @stats="renderStats = $event"
    />

    <section v-else class="map-placeholder" aria-live="polite">
      <span v-if="dataLoading"></span>
      {{ visibleError || 'Membaca data peta…' }}
    </section>

    <BuildingModal
      v-if="buildingModalOpen && selectedBuilding && selectedBuildingId !== null"
      :building="selectedBuilding"
      :building-id="String(selectedBuildingId)"
      @close="closeBuildingModal"
    />
  </main>
</template>

<style scoped>
.map-app {
  display: grid;
  grid-template-columns: 324px minmax(0, 1fr);
  width: 100%;
  height: 100%;
  background: var(--app-background);
}

.map-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--muted-strong);
  background: var(--surface-elevated);
  font-size: 12px;
}

.map-placeholder span {
  width: 12px;
  height: 12px;
  border: 2px solid var(--border-strong);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 760px) {
  .map-app { display: block; }
  .map-placeholder { width: 100%; height: 100%; padding: 24px; text-align: center; }
}
</style>
