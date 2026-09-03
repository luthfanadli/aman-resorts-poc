<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Room, RoomDraft, RoomStatus, RoomType } from '../../types/room'

const props = defineProps<{
  buildingId: string
  room?: Room | null
}>()

const emit = defineEmits<{
  save: [draft: RoomDraft]
  cancel: []
}>()

const ROOM_TYPES: RoomType[] = [
  'Meeting Room', 'Office', 'Storage', 'Lobby', 'Reception',
  'Dining', 'Kitchen', 'Bathroom', 'Corridor', 'Server Room',
  'Security Room', 'Other',
]
const STATUSES: RoomStatus[] = ['Active', 'Inactive', 'Renovation']

function blankDraft(): RoomDraft {
  return {
    code: '',
    name: '',
    buildingId: props.buildingId,
    floor: '',
    type: 'Office',
    description: '',
    area: null,
    capacity: null,
    status: 'Active',
    responsibleUnit: '',
    photo: '',
    floorPlan: '',
    notes: '',
  }
}

const form = reactive<RoomDraft>(blankDraft())

watch(
  () => props.room,
  (r) => {
    if (r) {
      Object.assign(form, { ...r })
    } else {
      Object.assign(form, blankDraft())
    }
  },
  { immediate: true },
)

function handlePhotoUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { form.photo = (ev.target?.result as string) ?? '' }
  reader.readAsDataURL(file)
}

function submit() {
  emit('save', { ...form, buildingId: props.buildingId })
}
</script>

<template>
  <div class="form-modal-overlay" @mousedown.self="emit('cancel')">
    <div class="form-modal" role="dialog" aria-modal="true" aria-label="Room Form">
      <header class="form-modal-header">
        <h2>{{ room ? 'Edit Room' : 'Tambah Room' }}</h2>
        <button type="button" class="close-btn" aria-label="Tutup" @click="emit('cancel')">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </header>

      <form class="form-body" @submit.prevent="submit">
        <!-- Section: Identifikasi -->
        <div class="form-section">
          <h3 class="section-label">Identifikasi</h3>
          <div class="form-grid">
            <label class="field">
              <span>Room Code <em>*</em></span>
              <input v-model="form.code" type="text" placeholder="mis. 2F-201" required />
            </label>
            <label class="field">
              <span>Room Name <em>*</em></span>
              <input v-model="form.name" type="text" placeholder="mis. Meeting Room 1" required />
            </label>
            <label class="field">
              <span>Floor <em>*</em></span>
              <input v-model="form.floor" type="text" placeholder="mis. 1, 2, B1" required />
            </label>
            <label class="field">
              <span>Room Type <em>*</em></span>
              <select v-model="form.type" required>
                <option v-for="t in ROOM_TYPES" :key="t" :value="t">{{ t }}</option>
              </select>
            </label>
            <label class="field full">
              <span>Description</span>
              <textarea v-model="form.description" rows="2" placeholder="Keterangan tambahan tentang ruangan" />
            </label>
          </div>
        </div>

        <!-- Section: Dimensi & Kapasitas -->
        <div class="form-section">
          <h3 class="section-label">Dimensi & Kapasitas</h3>
          <div class="form-grid">
            <label class="field">
              <span>Area (m²)</span>
              <input v-model.number="form.area" type="number" min="0" step="0.5" placeholder="0" />
            </label>
            <label class="field">
              <span>Capacity (orang)</span>
              <input v-model.number="form.capacity" type="number" min="0" placeholder="0" />
            </label>
          </div>
        </div>

        <!-- Section: Status & Pengelolaan -->
        <div class="form-section">
          <h3 class="section-label">Status & Pengelolaan</h3>
          <div class="form-grid">
            <label class="field">
              <span>Status <em>*</em></span>
              <select v-model="form.status" required>
                <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
              </select>
            </label>
            <label class="field">
              <span>Responsible Unit</span>
              <input v-model="form.responsibleUnit" type="text" placeholder="mis. IT Department" />
            </label>
          </div>
        </div>

        <!-- Section: Dokumentasi -->
        <div class="form-section">
          <h3 class="section-label">Dokumentasi</h3>
          <div class="form-grid">
            <label class="field full">
              <span>Photo Ruangan</span>
              <input type="file" accept="image/*" @change="handlePhotoUpload" />
              <img v-if="form.photo" :src="form.photo" class="photo-preview" alt="Preview" />
            </label>
            <label class="field full">
              <span>Floor Plan / Spatial Data</span>
              <textarea v-model="form.floorPlan" rows="2" placeholder="Polygon / koordinat / keterangan layout" />
            </label>
            <label class="field full">
              <span>Notes</span>
              <textarea v-model="form.notes" rows="2" placeholder="Catatan tambahan" />
            </label>
          </div>
        </div>

        <footer class="form-footer">
          <button type="button" class="btn-secondary" @click="emit('cancel')">Batal</button>
          <button type="submit" class="btn-primary">{{ room ? 'Simpan Perubahan' : 'Tambah Room' }}</button>
        </footer>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 150ms ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.form-modal {
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: #1a1e17;
  border: 1px solid #3a4033;
  border-radius: 12px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.6);
  animation: slideUp 200ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}
@keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }

.form-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #2e3329;
  flex-shrink: 0;
}
.form-modal-header h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #ecebdc;
}
.close-btn {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  background: transparent;
  border: 1px solid #3a4033;
  border-radius: 6px;
  cursor: pointer;
  color: #9fa492;
  transition: all 150ms;
}
.close-btn:hover { background: #252a20; color: #ecebdc; }
.close-btn svg { width: 14px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 1.8; }

.form-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
  scrollbar-width: thin;
  scrollbar-color: #434936 transparent;
}

.form-section {
  padding: 16px 24px;
  border-bottom: 1px solid #252a20;
}
.form-section:last-child { border-bottom: 0; }
.section-label {
  margin: 0 0 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #d8be76;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.field.full { grid-column: 1 / -1; }
.field > span {
  font-size: 10px;
  color: #9fa492;
  font-weight: 500;
}
.field em { color: #c96a56; font-style: normal; margin-left: 2px; }
.field input,
.field select,
.field textarea {
  background: #13160f;
  border: 1px solid #3a4033;
  border-radius: 6px;
  color: #ecebdc;
  font-size: 12px;
  padding: 8px 10px;
  outline: none;
  transition: border-color 150ms;
  resize: vertical;
}
.field input:focus,
.field select:focus,
.field textarea:focus { border-color: #d8be76; }
.field input[type="file"] {
  padding: 6px 10px;
  cursor: pointer;
  color: #9fa492;
}
.photo-preview {
  margin-top: 8px;
  max-height: 100px;
  border-radius: 6px;
  border: 1px solid #3a4033;
  object-fit: cover;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #2e3329;
  flex-shrink: 0;
  background: #1a1e17;
}
.btn-primary {
  padding: 9px 20px;
  background: #d8be76;
  color: #10120e;
  border: 0;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 150ms;
}
.btn-primary:hover { background: #e0cc8e; }
.btn-secondary {
  padding: 9px 16px;
  background: transparent;
  color: #9fa492;
  border: 1px solid #3a4033;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms;
}
.btn-secondary:hover { background: #1f231b; color: #ecebdc; }
</style>
