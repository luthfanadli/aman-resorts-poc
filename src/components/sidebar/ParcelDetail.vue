<script setup lang="ts">
import { formatArea, parcelLabel } from '../../lib/parcel'
import type { ParcelFeature } from '../../types/parcel'

defineProps<{ parcel: ParcelFeature }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <section class="parcel-detail">
    <div class="section-heading">
      <h2>Detail bidang</h2>
      <button type="button" @click="emit('close')">Tutup</button>
    </div>
    <strong class="parcel-title">{{ parcelLabel(parcel.properties) }}</strong>
    <dl>
      <div><dt>Tipe hak</dt><dd>{{ parcel.properties.TIPEHAK ?? '—' }}</dd></div>
      <div><dt>Luas peta</dt><dd>{{ formatArea(parcel.properties.LUASPETA) }}</dd></div>
      <div><dt>Luas tertulis</dt><dd>{{ formatArea(parcel.properties.LUASTERTUL) }}</dd></div>
      <div><dt>Kelurahan</dt><dd>{{ parcel.properties.KELURAHAN ?? '—' }}</dd></div>
    </dl>
  </section>
</template>

<style scoped>
.parcel-detail { padding: 18px 20px; background: #1a1e17; border-bottom: 1px solid var(--border); }
.section-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
h2 { margin: 0; color: #d8d9cb; font-size: 11px; font-weight: 700; }
button { padding: 0; color: #d8be76; background: none; border: 0; cursor: pointer; font-size: 10px; }
.parcel-title { display: block; margin-bottom: 12px; color: #f0d98d; font-size: 14px; }
dl, dl div { margin: 0; }
dl div { display: grid; grid-template-columns: 1fr 1.2fr; gap: 10px; padding: 7px 0; border-top: 1px solid #30352a; font-size: 10px; }
dt { color: var(--muted); }
dd { color: #dedfd1; text-align: right; }
</style>
