<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  buildingFillOpacity: number
  buildingStrokeOpacity: number
  buildingsVisible: boolean
  parcelFillOpacity: number
  parcelStrokeOpacity: number
  parcelsVisible: boolean
}>()

const emit = defineEmits<{
  reset: []
  toggleBuildings: []
  toggleParcels: []
  'update:buildingFillOpacity': [value: number]
  'update:buildingStrokeOpacity': [value: number]
  'update:parcelFillOpacity': [value: number]
  'update:parcelStrokeOpacity': [value: number]
}>()

const openSettings = ref<'parcels' | 'buildings' | null>(null)

function toggleSettings(layer: 'parcels' | 'buildings') {
  openSettings.value = openSettings.value === layer ? null : layer
}

function rangeValue(event: Event) {
  return Number((event.currentTarget as HTMLInputElement).value)
}
</script>

<template>
  <section class="panel-section">
    <div class="section-heading">
      <h2>Layer peta</h2>
      <!-- <button type="button" @click="emit('reset')">Lihat semua</button> -->
    </div>

    <div class="layer-item">
      <div class="layer-row">
        <span class="layer-swatch parcel-swatch" aria-hidden="true"></span>
        <span class="layer-copy">
          <strong>Bidang tanah</strong>
          <!-- <em>Polygon Amandari</em> -->
        </span>
        <span class="layer-actions">
          <button
            class="icon-button"
            type="button"
            :class="{ active: openSettings === 'parcels' }"
            :aria-expanded="openSettings === 'parcels'"
            aria-label="Atur opacity bidang tanah"
            @click="toggleSettings('parcels')"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M14 5v4M4 17h2M10 17h10M6 15v4" /></svg>
          </button>
          <button
            class="icon-button visibility-button"
            type="button"
            :class="{ active: parcelsVisible }"
            :aria-pressed="parcelsVisible"
            :aria-label="parcelsVisible ? 'Sembunyikan bidang tanah' : 'Tampilkan bidang tanah'"
            @click="emit('toggleParcels')"
          >
            <svg v-if="parcelsVisible" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="m4 4 16 16M10.6 6.2A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.1 2.8M6.6 6.7C4 8.3 2.5 12 2.5 12s3.5 6 9.5 6c1 0 2-.2 2.8-.5M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
          </button>
        </span>
      </div>

      <div v-if="openSettings === 'parcels'" class="opacity-settings">
        <label>
          <span>Fill</span>
          <input type="range" min="0" max="1" step="0.05" :value="parcelFillOpacity" :style="{ '--range-progress': `${parcelFillOpacity * 100}%` }" @input="emit('update:parcelFillOpacity', rangeValue($event))">
          <output>{{ Math.round(parcelFillOpacity * 100) }}%</output>
        </label>
        <label>
          <span>Stroke</span>
          <input type="range" min="0" max="1" step="0.05" :value="parcelStrokeOpacity" :style="{ '--range-progress': `${parcelStrokeOpacity * 100}%` }" @input="emit('update:parcelStrokeOpacity', rangeValue($event))">
          <output>{{ Math.round(parcelStrokeOpacity * 100) }}%</output>
        </label>
      </div>
    </div>

    <div class="layer-item">
      <div class="layer-row">
        <span class="layer-swatch building-swatch" aria-hidden="true"></span>
        <span class="layer-copy">
          <strong>Bangunan</strong>
          <!-- <em>Bangunan.geojson</em> -->
        </span>
        <span class="layer-actions">
          <button
            class="icon-button"
            type="button"
            :class="{ active: openSettings === 'buildings' }"
            :aria-expanded="openSettings === 'buildings'"
            aria-label="Atur opacity bangunan"
            @click="toggleSettings('buildings')"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M14 5v4M4 17h2M10 17h10M6 15v4" /></svg>
          </button>
          <button
            class="icon-button visibility-button"
            type="button"
            :class="{ active: buildingsVisible }"
            :aria-pressed="buildingsVisible"
            :aria-label="buildingsVisible ? 'Sembunyikan bangunan' : 'Tampilkan bangunan'"
            @click="emit('toggleBuildings')"
          >
            <svg v-if="buildingsVisible" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="m4 4 16 16M10.6 6.2A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.1 2.8M6.6 6.7C4 8.3 2.5 12 2.5 12s3.5 6 9.5 6c1 0 2-.2 2.8-.5M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
          </button>
        </span>
      </div>

      <div v-if="openSettings === 'buildings'" class="opacity-settings">
        <label>
          <span>Fill</span>
          <input type="range" min="0" max="1" step="0.05" :value="buildingFillOpacity" :style="{ '--range-progress': `${buildingFillOpacity * 100}%` }" @input="emit('update:buildingFillOpacity', rangeValue($event))">
          <output>{{ Math.round(buildingFillOpacity * 100) }}%</output>
        </label>
        <label>
          <span>Stroke</span>
          <input type="range" min="0" max="1" step="0.05" :value="buildingStrokeOpacity" :style="{ '--range-progress': `${buildingStrokeOpacity * 100}%` }" @input="emit('update:buildingStrokeOpacity', rangeValue($event))">
          <output>{{ Math.round(buildingStrokeOpacity * 100) }}%</output>
        </label>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel-section { padding: 16px 20px 12px; border-bottom: 1px solid var(--border); }
h2 { margin: 0; color: #d8d9cb; font-size: 11px; font-weight: 700; }
.section-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
.section-heading > button { padding: 0; color: #d8be76; background: none; border: 0; cursor: pointer; font-size: 10px; }
.layer-item + .layer-item { border-top: 1px solid #2c3127; }
.layer-row { display: grid; min-height: 52px; grid-template-columns: 34px minmax(0, 1fr) auto; align-items: center; gap: 10px; }
.layer-copy { display: flex; min-width: 0; flex-direction: column; gap: 2px; }
.layer-copy strong { color: #dedfd2; font-size: 11px; font-weight: 600; }
.layer-copy em { overflow: hidden; color: #858b7a; font-size: 9px; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
.layer-swatch { width: 34px; height: 30px; border: 1px solid #4a5041; border-radius: 4px; }
.parcel-swatch { background: linear-gradient(58deg, transparent 46%, #fff 47% 50%, transparent 51%), #d6b454; }
.building-swatch { background: linear-gradient(90deg, transparent 46%, #f5e9d8 47% 50%, transparent 51%), #9b6b54; }
.layer-actions { display: flex; align-items: center; gap: 3px; }
.icon-button { display: grid; width: 27px; height: 27px; padding: 0; place-items: center; color: #777d6e; background: transparent; border: 1px solid transparent; border-radius: 5px; cursor: pointer; }
.icon-button:hover,
.icon-button.active { color: #e3d8b7; background: #23271f; border-color: #414735; }
.icon-button svg { width: 15px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.6; }
.visibility-button.active { color: #d8be76; }
.opacity-settings { display: flex; flex-direction: column; gap: 7px; padding: 2px 0 11px 44px; }
.opacity-settings label { display: grid; grid-template-columns: 38px minmax(0, 1fr) 31px; align-items: center; gap: 7px; color: #929888; font-size: 9px; }
.opacity-settings output { color: #c9cbbd; text-align: right; }
.opacity-settings input { width: 100%; height: 14px; margin: 0; appearance: none; background: transparent; cursor: pointer; }
.opacity-settings input::-webkit-slider-runnable-track { height: 3px; background: linear-gradient(to right, #d6b454 0 var(--range-progress), #464c3d var(--range-progress) 100%); border-radius: 2px; }
.opacity-settings input::-webkit-slider-thumb { width: 12px; height: 12px; margin-top: -4.5px; appearance: none; background: #e6d18f; border: 2px solid #252a20; border-radius: 50%; }
.opacity-settings input::-moz-range-track { height: 3px; background: #464c3d; border: 0; border-radius: 2px; }
.opacity-settings input::-moz-range-progress { height: 3px; background: #d6b454; border-radius: 2px; }
.opacity-settings input::-moz-range-thumb { width: 10px; height: 10px; background: #e6d18f; border: 2px solid #252a20; border-radius: 50%; }
.opacity-settings input:focus-visible { outline: 1px solid #d6b454; outline-offset: 3px; }
</style>
