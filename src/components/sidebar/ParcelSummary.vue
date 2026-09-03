<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatArea } from '../../lib/parcel'
import type { ParcelFeature } from '../../types/parcel'
import SummaryDetailModal from './SummaryDetailModal.vue'

const props = defineProps<{ features: ParcelFeature[] }>()
const detailsOpen = ref(false)
const totalWrittenArea = computed(() =>
  props.features.reduce((sum, feature) => sum + (feature.properties.LUASTERTUL ?? 0), 0),
)

const parcelsByRightType = computed(() => {
  const counts = new Map<string, number>()

  for (const feature of props.features) {
    const rightType = feature.properties.TIPEHAK?.trim() || 'Tidak tercatat'
    counts.set(rightType, (counts.get(rightType) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([rightType, count]) => ({ rightType, count }))
    .sort((first, second) => second.count - first.count || first.rightType.localeCompare(second.rightType, 'id'))
})
</script>

<template>
  <section class="summary" aria-label="Ringkasan data">
    <div class="summary-metrics">
      <div><span>Bidang</span><strong>{{ features.length || '—' }}</strong></div>
      <div><span>Total luas tertulis bidang tanah</span><strong>{{ formatArea(totalWrittenArea) }}</strong></div>
      <button class="details-trigger" type="button" aria-haspopup="dialog" :disabled="!features.length" @click="detailsOpen = true">
        <span>Detail info</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
    <SummaryDetailModal
      v-if="detailsOpen"
      :parcel-count="features.length"
      :parcels-by-right-type="parcelsByRightType"
      :total-written-area="totalWrittenArea"
      @close="detailsOpen = false"
    />
  </section>
</template>

<style scoped>
.summary { background: #10120e; border-bottom: 1px solid var(--border); }
.summary-metrics { display: grid; grid-template-columns: 0.8fr 1.2fr auto; gap: 1px; padding: 0 20px; background: #10120e; }
.summary-metrics > div { display: flex; min-width: 0; flex-direction: column; gap: 3px; padding: 15px 14px; background: #10120e; }
.summary-metrics > div:first-child { padding-left: 0; }
span { color: var(--muted); font-size: 10px; }
strong { overflow: hidden; color: #f0efdf; font-size: 15px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.details-trigger { display: flex; width: 58px; align-items: center; justify-content: center; gap: 3px; padding: 0 0 0 10px; color: #c6c9b7; background: #10120e; border: 0; border-left: 1px solid var(--border); cursor: pointer; text-align: left; }
.details-trigger:hover, .details-trigger:focus-visible { color: #f2dd91; background: #171b14; outline: 0; }
.details-trigger:disabled { color: #606554; cursor: not-allowed; }
.details-trigger span { color: inherit; font-size: 9px; font-weight: 600; line-height: 1.35; }
.details-trigger svg { width: 13px; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.8; }
</style>
