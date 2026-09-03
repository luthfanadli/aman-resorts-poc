<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatArea } from '../../lib/parcel'
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
        properties.TIPEHAK,
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
        placeholder="Cari berdasarkan NIB atau tipe hak"
        autocomplete="off"
        :disabled="disabled"
      />
    </div>
    <div v-if="results.length" class="search-results">
      <button v-for="feature in results" :key="feature.id" type="button" @click="select(feature.id)">
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
    </div>
    <p v-else-if="query.trim() && !disabled" class="empty-search">Bidang tidak ditemukan.</p>
  </section>
</template>

<style scoped>
.search-section { position: relative; padding: 18px 20px; border-bottom: 1px solid var(--border); }
label { display: block; margin-bottom: 8px; color: var(--muted-strong); font-size: 12px; font-weight: 600; }
.search-box { display: flex; height: 40px; align-items: center; gap: 9px; padding: 0 11px; background: var(--surface-subtle); border: 1px solid var(--border-strong); border-radius: 7px; transition: border-color 150ms ease; }
.search-box:focus-within { border-color: var(--accent); outline: 2px solid var(--accent-surface); }
.search-box svg { width: 16px; flex: 0 0 auto; fill: none; stroke: var(--muted); stroke-width: 1.8; }
input { width: 100%; min-width: 0; padding: 0; color: var(--text); background: transparent; border: 0; outline: 0; font-size: 12px; }
input::placeholder { color: var(--muted-faint); }
input:disabled { cursor: wait; }
.search-results { position: absolute; z-index: 10; top: 88px; right: 20px; left: 20px; overflow: hidden; background: var(--surface-elevated); border: 1px solid var(--border-strong); border-radius: 7px; box-shadow: 0 6px 16px var(--shadow); }
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
