<script setup lang="ts">
import LayerControls from './LayerControls.vue'
import BuildingDetail from './BuildingDetail.vue'
import ParcelDetail from './ParcelDetail.vue'
import ParcelSearch from './ParcelSearch.vue'
import ParcelSummary from './ParcelSummary.vue'
import amanLogoUrl from '../../assets/aman-logo.svg'
import type {
  BuildingFeature,
  MapRenderStats,
  ParcelCollection,
  ParcelFeature,
} from '../../types/parcel'

defineProps<{
  buildingCount: number
  buildingFillOpacity: number
  buildingStrokeOpacity: number
  buildingsVisible: boolean
  collection: ParcelCollection | null
  error: string
  isLoading: boolean
  mapReady: boolean
  mobileOpen: boolean
  parcelsVisible: boolean
  parcelFillOpacity: number
  parcelStrokeOpacity: number
  renderStats: MapRenderStats
  selectedBuilding: BuildingFeature | null
  selectedParcel: ParcelFeature | null
}>()

const emit = defineEmits<{
  close: []
  reset: []
  select: [parcelId: number]
  toggleBuildings: []
  toggleParcels: []
  'update:buildingFillOpacity': [value: number]
  'update:buildingStrokeOpacity': [value: number]
  'update:parcelFillOpacity': [value: number]
  'update:parcelStrokeOpacity': [value: number]
}>()
</script>

<template>
  <aside class="sidebar" :class="{ 'is-open': mobileOpen }">
    <header class="brand-bar">
      <img class="brand-logo" :src="amanLogoUrl" alt="Aman" />
      <div>
        <h1>Amandari Land Map</h1>
        <p>Kedewatan, Ubud</p>
      </div>
      <button class="panel-close" type="button" aria-label="Tutup panel" @click="emit('close')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>
    </header>

    <div class="sidebar-content">
      <ParcelSearch
        :features="collection?.features ?? []"
        :disabled="isLoading || !collection"
        @select="emit('select', $event)"
      />
      <ParcelSummary :features="collection?.features ?? []" />
      <LayerControls
        :building-fill-opacity="buildingFillOpacity"
        :building-stroke-opacity="buildingStrokeOpacity"
        :buildings-visible="buildingsVisible"
        :parcel-fill-opacity="parcelFillOpacity"
        :parcel-stroke-opacity="parcelStrokeOpacity"
        :parcels-visible="parcelsVisible"
        @reset="emit('reset')"
        @toggle-buildings="emit('toggleBuildings')"
        @toggle-parcels="emit('toggleParcels')"
        @update:building-fill-opacity="emit('update:buildingFillOpacity', $event)"
        @update:building-stroke-opacity="emit('update:buildingStrokeOpacity', $event)"
        @update:parcel-fill-opacity="emit('update:parcelFillOpacity', $event)"
        @update:parcel-stroke-opacity="emit('update:parcelStrokeOpacity', $event)"
      />
      <ParcelDetail
        v-if="selectedParcel"
        :parcel="selectedParcel"
        @close="emit('reset')"
      />
      <BuildingDetail
        v-else-if="selectedBuilding"
        :building="selectedBuilding"
        @close="emit('reset')"
      />

      <div class="source-status">
        <span :class="{ error: Boolean(error) }"></span>
        <p v-if="error">{{ error }}</p>
        <p v-else-if="isLoading">Membaca data persil…</p>
        <p v-else-if="!mapReady">
          {{ collection?.features.length ?? 0 }} persil dan {{ buildingCount }} bangunan terbaca
        </p>
        <p v-else>
          {{ renderStats.sourceFeatures }} persil • {{ buildingCount }} bangunan • {{ renderStats.renderedFeatures }} persil terlihat
        </p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar { position: relative; z-index: 20; display: flex; min-width: 0; flex-direction: column; background: var(--sidebar); border-right: 1px solid var(--border); }
.brand-bar { display: flex; min-height: 78px; align-items: center; gap: 18px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
.brand-logo { width: 48px; height: auto; flex: 0 0 auto; filter: brightness(0) saturate(100%) invert(87%) sepia(21%) saturate(630%) hue-rotate(351deg) brightness(97%) contrast(98%); }
h1, p { margin: 0; }
h1 { color: var(--text); font-size: 14px; font-weight: 700; line-height: 1.4; }
.brand-bar p { margin-top: 2px; color: var(--muted); font-size: 11px; }
.sidebar-content { flex: 1 1 auto; min-height: 0; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #434936 transparent; }
.source-status { display: flex; align-items: flex-start; gap: 8px; padding: 18px 20px; }
.source-status > span { width: 6px; height: 6px; flex: 0 0 auto; margin-top: 3px; background: #9db361; border-radius: 50%; }
.source-status > span.error { background: #c96a56; }
.source-status p { color: #777d6e; font-size: 9px; line-height: 1.5; }
.panel-close { display: none; }

@media (max-width: 760px) {
  .sidebar { position: fixed; inset: 0 auto 0 0; width: min(324px, calc(100vw - 42px)); transform: translateX(-100%); transition: transform 180ms ease; box-shadow: 8px 0 24px rgba(0, 0, 0, 0.35); }
  .sidebar.is-open { transform: translateX(0); }
  .panel-close { display: grid; width: 32px; height: 32px; margin-left: auto; place-items: center; color: inherit; background: transparent; border: 1px solid #3d4334; border-radius: 6px; }
  .panel-close svg { width: 16px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 1.7; }
}
</style>
