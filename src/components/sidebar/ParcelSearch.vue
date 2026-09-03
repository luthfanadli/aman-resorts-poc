<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatArea, parcelLabel } from '../../lib/parcel'
import type { ParcelFeature } from '../../types/parcel'

const props = defineProps<{
  features: ParcelFeature[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  select: [parcelId: number]
}>()

const query = ref('')

const results = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase('id')
  if (!needle) return []
  return props.features
    .filter(({ properties }) =>
      [
        properties.NIB,
        properties.NIBNIBEL,
        properties.NAMA,
        properties.TIPEHAK,
        properties.KELURAHAN,
        properties.KECAMATAN,
      ].some((value) => String(value ?? '').toLocaleLowerCase('id').includes(needle)),
    )
    .slice(0, 7)
})

function select(parcelId: number) {
  emit('select', parcelId)
  query.value = ''
}
</script>

<template>
  <section class="search-section">
    <label for="parcel-search">Cari bidang</label>
    <div class="search-box">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
      <input
        id="parcel-search"
        v-model="query"
        type="search"
        placeholder="NIB, nama, atau tipe hak"
        autocomplete="off"
        :disabled="disabled"
      />
    </div>
    <div v-if="results.length" class="search-results">
      <button v-for="feature in results" :key="feature.id" type="button" @click="select(feature.id)">
        <span>{{ parcelLabel(feature.properties) }}</span>
        <em>{{ formatArea(feature.properties.LUASPETA) }}</em>
      </button>
    </div>
    <p v-else-if="query.trim() && !disabled" class="empty-search">Bidang tidak ditemukan.</p>
  </section>
</template>

<style scoped>
.search-section { position: relative; padding: 18px 20px; border-bottom: 1px solid var(--border); }
label { display: block; margin-bottom: 8px; color: #c9cbbd; font-size: 12px; font-weight: 600; }
.search-box { display: flex; height: 40px; align-items: center; gap: 9px; padding: 0 11px; background: #11140f; border: 1px solid #3a4032; border-radius: 7px; transition: border-color 150ms ease; }
.search-box:focus-within { border-color: #827a52; outline: 2px solid rgba(217, 179, 92, 0.1); }
.search-box svg { width: 16px; flex: 0 0 auto; fill: none; stroke: var(--muted); stroke-width: 1.8; }
input { width: 100%; min-width: 0; padding: 0; color: var(--text); background: transparent; border: 0; outline: 0; font-size: 12px; }
input::placeholder { color: #717665; }
input:disabled { cursor: wait; }
.search-results { position: absolute; z-index: 10; top: 88px; right: 20px; left: 20px; overflow: hidden; background: #20241c; border: 1px solid #414735; border-radius: 7px; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.28); }
.search-results button { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; color: inherit; background: transparent; border: 0; border-bottom: 1px solid #363b2e; cursor: pointer; text-align: left; }
.search-results button:last-child { border-bottom: 0; }
.search-results button:hover, .search-results button:focus-visible { background: #2a2f24; outline: 0; }
.search-results span { font-size: 12px; font-weight: 600; }
.search-results em { color: var(--muted); font-size: 10px; font-style: normal; white-space: nowrap; }
.empty-search { margin: 8px 0 0; color: var(--muted); font-size: 11px; }
</style>
