<script setup lang="ts">
import { computed, ref } from 'vue'
import ParcelMap from './components/map/ParcelMap.vue'
import MapSidebar from './components/sidebar/MapSidebar.vue'
import { useBuildingData } from './composables/useBuildingData'
import { useParcelData } from './composables/useParcelData'
import buildingDataUrl from './assets/data/Bangunan.geojson?url'
import parcelDataUrl from './assets/data/Polygon Amandari.geojson?url'
import type {
  BuildingFeature,
  MapRenderStats,
  ParcelMapApi,
} from './types/parcel'

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
const mobilePanelOpen = ref(false)
const mapReady = ref(false)
const mapError = ref('')
const renderStats = ref<MapRenderStats>({ sourceFeatures: 0, renderedFeatures: 0 })

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

function selectParcel(parcelId: number, focus = false) {
  selectedBuildingId.value = null
  selectedParcelId.value = parcelId
  if (focus) mapRef.value?.focusParcel(parcelId)
  if (window.innerWidth <= 760) mobilePanelOpen.value = false
}

function selectBuilding(buildingId: number) {
  selectedParcelId.value = null
  selectedBuildingId.value = buildingId
  if (window.innerWidth <= 760) mobilePanelOpen.value = false
}

function resetView() {
  selectedBuildingId.value = null
  selectedParcelId.value = null
  mapRef.value?.fitAll()
}

function handleMapReady(featureCount: number) {
  mapReady.value = true
  mapError.value = ''
  renderStats.value = { ...renderStats.value, sourceFeatures: featureCount }
}
</script>

<template>
  <main class="map-app">
    <MapSidebar
      :building-count="buildingCollection?.features.length ?? 0"
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
      :selected-parcel="selectedParcel"
      @close="mobilePanelOpen = false"
      @reset="resetView"
      @select="selectParcel($event, true)"
      @toggle-buildings="buildingsVisible = !buildingsVisible"
      @toggle-parcels="parcelsVisible = !parcelsVisible"
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
      @error="mapError = $event"
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
  </main>
</template>

<style scoped>
.map-app {
  display: grid;
  grid-template-columns: 324px minmax(0, 1fr);
  width: 100%;
  height: 100%;
  background: #10120e;
}

.map-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #c8cbbd;
  background: #20241d;
  font-size: 12px;
}

.map-placeholder span {
  width: 12px;
  height: 12px;
  border: 2px solid #575d4e;
  border-top-color: #e0bd68;
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 760px) {
  .map-app { display: block; }
  .map-placeholder { width: 100%; height: 100%; padding: 24px; text-align: center; }
}
</style>
