<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { formatArea } from '../../lib/parcel'

interface RightTypeSummary {
  count: number
  rightType: string
}

defineProps<{
  parcelCount: number
  parcelsByRightType: RightTypeSummary[]
  totalWrittenArea: number
}>()

const emit = defineEmits<{ close: [] }>()

function close() {
  emit('close')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="close">
      <section class="summary-modal" role="dialog" aria-modal="true" aria-labelledby="summary-detail-title">
        <header>
          <h2 id="summary-detail-title">Detail informasi</h2>
          <button type="button" aria-label="Tutup detail informasi" @click="close">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </header>

        <div class="modal-content">
          <dl class="overview">
            <div><dt>Bidang</dt><dd>{{ parcelCount }}</dd></div>
            <div><dt>Total luas tertulis bidang tanah</dt><dd>{{ formatArea(totalWrittenArea) }}</dd></div>
          </dl>

          <section class="right-types">
            <h3>Bidang berdasarkan tipe hak</h3>
            <dl>
              <div v-for="item in parcelsByRightType" :key="item.rightType">
                <dt>{{ item.rightType }}</dt>
                <dd>{{ item.count }} bidang</dd>
              </div>
            </dl>
          </section>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop { position: fixed; z-index: 100; inset: 0; display: grid; place-items: center; padding: 16px; background: rgba(5, 7, 4, 0.72); }
.summary-modal { width: min(430px, calc(100vw - 32px)); max-height: calc(100dvh - 32px); overflow: auto; background: #171a14; border: 1px solid #434936; border-radius: 8px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.38); }
header { display: flex; min-height: 54px; align-items: center; justify-content: space-between; gap: 16px; padding: 0 18px; border-bottom: 1px solid var(--border); }
h2, h3 { margin: 0; }
h2 { color: #ecebdc; font-size: 14px; font-weight: 600; }
header button { display: grid; width: 30px; height: 30px; place-items: center; color: #c7cab8; background: transparent; border: 1px solid #444a3a; border-radius: 6px; cursor: pointer; }
header button:hover, header button:focus-visible { color: #fff5ca; background: #292e23; outline: 0; }
header svg { width: 16px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 1.7; }
.modal-content { padding: 18px; }
.overview { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 1px; margin: 0; background: #343a2d; border: 1px solid #343a2d; }
.overview div { min-width: 0; padding: 12px; background: #10120e; }
.overview dt, .right-types dt { color: var(--muted); font-size: 10px; line-height: 1.35; }
.overview dd { margin: 4px 0 0; overflow: hidden; color: #f0efdf; font-size: 15px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.right-types { margin-top: 20px; }
h3 { margin-bottom: 10px; color: #c9cbbd; font-size: 11px; font-weight: 600; }
.right-types dl { margin: 0; border-top: 1px solid #343a2d; }
.right-types dl div { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding: 11px 0; border-bottom: 1px solid #343a2d; }
.right-types dt { min-width: 0; color: #cdd0bf; font-size: 11px; overflow-wrap: anywhere; }
.right-types dd { flex: 0 0 auto; margin: 0; color: #e5cf85; font-size: 11px; font-weight: 600; white-space: nowrap; }
</style>
