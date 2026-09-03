<script setup lang="ts">
import { computed } from 'vue'
import { formatArea } from '../../lib/parcel'
import type { ParcelFeature } from '../../types/parcel'

const props = defineProps<{ features: ParcelFeature[] }>()
const totalArea = computed(() =>
  props.features.reduce((sum, feature) => sum + (feature.properties.LUASPETA ?? 0), 0),
)
</script>

<template>
  <section class="summary" aria-label="Ringkasan data">
    <div><span>Bidang</span><strong>{{ features.length || '—' }}</strong></div>
    <div><span>Total luas peta</span><strong>{{ formatArea(totalArea) }}</strong></div>
  </section>
</template>

<style scoped>
.summary { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 1px; padding: 0 20px; background: var(--border); border-bottom: 1px solid var(--border); }
.summary div { display: flex; min-width: 0; flex-direction: column; gap: 3px; padding: 15px 14px; background: var(--sidebar); }
.summary div:first-child { padding-left: 0; }
span { color: var(--muted); font-size: 10px; }
strong { overflow: hidden; color: #f0efdf; font-size: 15px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
</style>
