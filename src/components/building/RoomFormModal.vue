<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Room, RoomDraft, RoomStatus, RoomType } from '../../types/room'
import RoomPhotoGalleryModal from './RoomPhotoGalleryModal.vue'

const props = defineProps<{
  buildingId: string
  room?: Room | null
}>()

const emit = defineEmits<{
  save: [draft: RoomDraft]
  cancel: []
}>()

const ROOM_TYPES: RoomType[] = [
  'Meeting Room', 'Guest Room', 'Office', 'Storage', 'Lobby', 'Reception',
  'Dining', 'Kitchen', 'Bathroom', 'Corridor', 'Server Room',
  'Security Room', 'Other',
]
const STATUSES: RoomStatus[] = ['Active', 'Inactive', 'Renovation']
const showGallery = ref(false)
const uploadingPhotos = ref(false)
const photoError = ref('')

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
    photos: [],
    floorPlan: '',
    notes: '',
  }
}

const form = reactive<RoomDraft>(blankDraft())

watch(
  () => props.room,
  (r) => {
    if (r) {
      Object.assign(form, { ...r, photos: [...r.photos] })
    } else {
      Object.assign(form, blankDraft())
    }
  },
  { immediate: true },
)

async function handlePhotoUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (!files.length) return

  uploadingPhotos.value = true
  photoError.value = ''
  try {
    const photos = await Promise.all(files.map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result ?? ''))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })))
    form.photos.push(...photos.filter(Boolean))
  } catch {
    photoError.value = 'Sebagian foto gagal dibaca. Silakan pilih ulang.'
  } finally {
    input.value = ''
    uploadingPhotos.value = false
  }
}

function removePhoto(index: number) {
  form.photos.splice(index, 1)
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
            <div class="field full">
              <label for="room-photo-input">Photo Ruangan</label>
              <input id="room-photo-input" type="file" accept="image/*" multiple @change="handlePhotoUpload" />
              <span class="field-hint">Pilih beberapa foto sekaligus. Anda juga dapat menambah foto secara bertahap.</span>
              <span v-if="photoError" class="photo-error" role="alert">{{ photoError }}</span>
              <div v-if="form.photos.length" class="photo-grid" :class="`count-${Math.min(form.photos.length, 3)}`">
                <div v-for="(photo, index) in form.photos.slice(0, 3)" :key="`${photo.slice(-24)}-${index}`" class="photo-tile">
                  <img :src="photo" :alt="`Preview ruangan ${index + 1}`" />
                  <button type="button" class="remove-photo" :aria-label="`Hapus foto ${index + 1}`" @click="removePhoto(index)">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
                  </button>
                  <button
                    v-if="index === 2"
                    type="button"
                    class="view-all-overlay"
                    @click="showGallery = true"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
                    Lihat semua foto
                    <span>{{ form.photos.length }}</span>
                  </button>
                </div>
              </div>
            </div>
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
          <button type="submit" class="btn-primary" :disabled="uploadingPhotos">
            {{ uploadingPhotos ? 'Memproses foto...' : room ? 'Simpan Perubahan' : 'Tambah Room' }}
          </button>
        </footer>
      </form>
    </div>
    <RoomPhotoGalleryModal
      v-if="showGallery"
      :photos="form.photos"
      :room-name="form.name || 'Room baru'"
      @close="showGallery = false"
    />
  </div>
</template>

<style scoped>
.form-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: var(--backdrop-strong);
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
  background: var(--surface-raised);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  box-shadow: 0 24px 64px var(--shadow-strong);
  animation: slideUp 200ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}
@keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }

.form-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.form-modal-header h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}
.close-btn {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  background: transparent;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  cursor: pointer;
  color: var(--muted);
  transition: all 150ms;
}
.close-btn:hover { background: var(--surface-hover); color: var(--text); }
.close-btn svg { width: 14px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 1.8; }

.form-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) transparent;
}

.form-section {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-subtle);
}
.form-section:last-child { border-bottom: 0; }
.section-label {
  margin: 0 0 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
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
.field > span,
.field > label {
  font-size: 10px;
  color: var(--muted);
  font-weight: 500;
}
.field em { color: var(--error); font-style: normal; margin-left: 2px; }
.field input,
.field select,
.field textarea {
  background: var(--surface-subtle);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  color: var(--text);
  font-size: 12px;
  padding: 8px 10px;
  outline: none;
  transition: border-color 150ms;
  resize: vertical;
}
.field input:focus,
.field select:focus,
.field textarea:focus { border-color: var(--accent); }
.field input[type="file"] {
  padding: 6px 10px;
  cursor: pointer;
  color: var(--muted);
}
.field input[type="file"]::file-selector-button {
  margin-right: 8px;
  padding: 4px 8px;
  color: var(--text);
  background: var(--surface-hover);
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  font: inherit;
  font-size: 10px;
  cursor: pointer;
}
.field-hint { color: var(--muted-faint) !important; font-size: 9px !important; font-weight: 400 !important; }
.photo-error { color: var(--error-text) !important; font-size: 9px !important; }
.photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 4px; }
.photo-grid.count-1 { grid-template-columns: 1fr; }
.photo-grid.count-2 { grid-template-columns: repeat(2, 1fr); }
.photo-tile { position: relative; min-width: 0; height: 112px; overflow: hidden; border: 1px solid var(--border-strong); border-radius: 6px; background: var(--surface-subtle); }
.photo-tile img { width: 100%; height: 100%; display: block; object-fit: cover; }
.remove-photo {
  position: absolute; top: 5px; right: 5px; z-index: 2; display: grid; width: 24px; height: 24px;
  place-items: center; color: #fff; background: rgba(5, 7, 4, 0.72); border: 0; border-radius: 4px; cursor: pointer;
}
.remove-photo:hover { background: var(--error); }
.remove-photo svg { width: 12px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 2; }
.view-all-overlay {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4px; padding: 12px; color: #fff; background: rgba(5, 7, 4, 0.56); border: 0; font-size: 10px;
  font-weight: 700; cursor: pointer;
}
.view-all-overlay:hover { background: rgba(5, 7, 4, 0.66); }
.view-all-overlay svg { width: 18px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.7; }
.view-all-overlay span { font-size: 9px; font-weight: 500; opacity: 0.82; }
.view-all-overlay + .remove-photo { z-index: 3; }

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  background: var(--surface-raised);
}
.btn-primary {
  padding: 9px 20px;
  background: var(--accent);
  color: var(--accent-text);
  border: 0;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 150ms;
}
.btn-primary:hover { background: var(--accent-light); }
.btn-primary:disabled { cursor: wait; opacity: 0.58; }
.btn-secondary {
  padding: 9px 16px;
  background: transparent;
  color: var(--muted);
  border: 1px solid var(--border-strong);
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms;
}
.btn-secondary:hover { background: var(--surface-hover); color: var(--text); }

@media (max-width: 520px) {
  .photo-grid { grid-template-columns: repeat(2, 1fr); }
  .photo-tile { height: 96px; }
}
</style>
