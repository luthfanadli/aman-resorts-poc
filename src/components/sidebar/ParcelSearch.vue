<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatArea } from '../../lib/parcel'
import type { BuildingFeature, ParcelFeature } from '../../types/parcel'

type SearchMode = 'parcel' | 'building'

const props = defineProps<{
  buildingFeatures: BuildingFeature[]
  features: ParcelFeature[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  selectBuilding: [buildingId: number]
  selectParcel: [parcelId: number]
}>()

const query = ref('')
const searchMode = ref<SearchMode>('parcel')
const isParcelSearch = computed(() => searchMode.value === 'parcel')

const parcelResults = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase('id')
  if (!needle) return []
  return props.features
    .filter(({ properties }) =>
      [properties.NIB, properties.TIPEHAK]
        .some((value) => String(value ?? '').toLocaleLowerCase('id').includes(needle)),
    )
    .slice(0, 7)
})

const buildingResults = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase('id')
  if (!needle) return []
  return props.buildingFeatures
    .map((feature, buildingId) => ({ feature, buildingId }))
    .filter(({ feature, buildingId }) =>
      [
        `bangunan #${buildingId + 1}`,
        String(buildingId + 1),
        feature.properties.full_plus_,
        feature.properties.full_plus,
        feature.properties.layer,
      ].some((value) => String(value ?? '').toLocaleLowerCase('id').includes(needle)),
    )
    .slice(0, 7)
})

const hasResults = computed(() =>
  isParcelSearch.value ? parcelResults.value.length > 0 : buildingResults.value.length > 0,
)
const searchLabel = computed(() => isParcelSearch.value ? 'Cari bidang' : 'Cari bangunan')
const searchPlaceholder = computed(() =>
  isParcelSearch.value
    ? 'Cari berdasarkan NIB atau tipe hak'
    : 'Cari berdasarkan nomor atau kode lokasi',
)
const emptyMessage = computed(() =>
  isParcelSearch.value ? 'Bidang tidak ditemukan.' : 'Bangunan tidak ditemukan.',
)

function formatBuildingArea(value: unknown) {
  const area = Number(value)
  return Number.isFinite(area)
    ? `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(area)} m²`
    : '—'
}

function buildingLocationCode(feature: BuildingFeature) {
  const value = feature.properties.full_plus_ ?? feature.properties.full_plus
  return typeof value === 'string' && value.trim() ? value : '—'
}

function changeSearchMode() {
  query.value = ''
}

function selectParcel(parcelId: number) {
  emit('selectParcel', parcelId)
  query.value = ''
}

function selectBuilding(buildingId: number) {
  emit('selectBuilding', buildingId)
  query.value = ''
}
</script>

<template>
  <section class="search-section">
    <div class="search-heading">
      <select v-model="searchMode" aria-label="Tipe pencarian" :disabled="disabled" @change="changeSearchMode">
        <option value="parcel">Cari bidang</option>
        <option value="building">Cari bangunan</option>
      </select>
    </div>

    <div class="search-control">
      <div class="search-box">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
        <input
          id="map-search"
          v-model="query"
          type="search"
          :aria-label="searchLabel"
          :placeholder="searchPlaceholder"
          autocomplete="off"
          :disabled="disabled"
        />
      </div>

      <div v-if="hasResults" class="search-results">
        <template v-if="isParcelSearch">
          <button v-for="feature in parcelResults" :key="feature.id" type="button" @click="selectParcel(feature.id)">
            <dl>
              <div>
                <dt>NIB</dt>
                <dd>{{ feature.properties.NIB || '—' }}</dd>
              </div>
              <div>
                <dt>Tipe hak</dt>
                <dd>{{ feature.properties.TIPEHAK || '—' }}</dd>
              </div>
            </dl>
            <div class="result-area">
              <span>Luas tertulis</span>
              <strong>{{ formatArea(feature.properties.LUASTERTUL) }}</strong>
            </div>
          </button>
        </template>

        <template v-else>
          <button
            v-for="result in buildingResults"
            :key="result.buildingId"
            type="button"
            @click="selectBuilding(result.buildingId)"
          >
            <dl>
              <div>
                <dt>Nomor bangunan</dt>
                <dd>#{{ result.buildingId + 1 }}</dd>
              </div>
              <div>
                <dt>Kode lokasi</dt>
                <dd>{{ buildingLocationCode(result.feature) }}</dd>
              </div>
            </dl>
            <div class="result-area">
              <span>Luas terdeteksi</span>
              <strong>{{ formatBuildingArea(result.feature.properties.area_in_me) }}</strong>
            </div>
          </button>
        </template>
      </div>
    </div>
    <p v-if="query.trim() && !hasResults && !disabled" class="empty-search">{{ emptyMessage }}</p>
  </section>
</template>

<style scoped>
.search-section { padding: 18px 20px; border-bottom: 1px solid var(--border); }
.search-heading { display: flex; align-items: center; margin-bottom: 8px; }
select { max-width: 150px; padding: 2px 18px 2px 0; color: var(--muted-strong); background: transparent; border: 0; border-bottom: 1px solid transparent; border-radius: 0; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
select:hover, select:focus-visible { color: var(--text-soft); border-bottom-color: var(--border-strong); outline: 0; }
select:disabled { cursor: wait; }
.search-control { position: relative; }
.search-box { display: flex; height: 40px; align-items: center; gap: 9px; padding: 0 11px; background: var(--surface-subtle); border: 1px solid var(--border-strong); border-radius: 7px; transition: border-color 150ms ease; }
.search-box:focus-within { border-color: var(--accent); outline: 2px solid var(--accent-surface); }
.search-box svg { width: 16px; flex: 0 0 auto; fill: none; stroke: var(--muted); stroke-width: 1.8; }
input { width: 100%; min-width: 0; padding: 0; color: var(--text); background: transparent; border: 0; outline: 0; font-size: 12px; }
input::placeholder { color: var(--muted-faint); }
input:disabled { cursor: wait; }
.search-results { position: absolute; z-index: 10; top: calc(100% + 8px); right: 0; left: 0; overflow: hidden; background: var(--surface-elevated); border: 1px solid var(--border-strong); border-radius: 7px; box-shadow: 0 6px 16px var(--shadow); }
.search-results button { display: grid; width: 100%; grid-template-columns: minmax(0, 1fr) auto; align-items: start; gap: 12px; padding: 10px 12px; color: inherit; background: transparent; border: 0; border-bottom: 1px solid var(--border); cursor: pointer; text-align: left; }
.search-results button:last-child { border-bottom: 0; }
.search-results button:hover, .search-results button:focus-visible { background: var(--surface-hover); outline: 0; }
.search-results dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; min-width: 0; margin: 0; }
.search-results dt, .result-area span { display: block; margin-bottom: 3px; color: var(--muted); font-size: 9px; line-height: 1.25; }
.search-results dd { min-width: 0; margin: 0; color: var(--text-soft); font-size: 11px; font-weight: 600; line-height: 1.35; overflow-wrap: anywhere; }
.result-area { min-width: 72px; text-align: right; }
.result-area strong { display: block; color: var(--muted-strong); font-size: 10px; font-weight: 500; line-height: 1.35; white-space: nowrap; }
.empty-search { margin: 8px 0 0; color: var(--muted); font-size: 11px; }
</style>
