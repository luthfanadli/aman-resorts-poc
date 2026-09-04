<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  photos: string[]
  roomName: string
  initialIndex?: number
}>()

const emit = defineEmits<{ close: [] }>()
const activeIndex = ref(Math.min(props.initialIndex ?? 0, Math.max(props.photos.length - 1, 0)))
const activePhoto = computed(() => props.photos[activeIndex.value] ?? '')
const activePhotoStyle = computed(() => ({ backgroundImage: `url(${JSON.stringify(activePhoto.value)})` }))

function previous() {
  activeIndex.value = (activeIndex.value - 1 + props.photos.length) % props.photos.length
}

function next() {
  activeIndex.value = (activeIndex.value + 1) % props.photos.length
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
  if (event.key === 'ArrowLeft' && props.photos.length > 1) previous()
  if (event.key === 'ArrowRight' && props.photos.length > 1) next()
}

function selectPhoto(index: number) {
  activeIndex.value = index
  nextTick(() => document.querySelector<HTMLElement>('.gallery-thumb.active')?.scrollIntoView({ block: 'nearest', inline: 'center' }))
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <div class="gallery-modal" role="dialog" aria-modal="true" :aria-label="`Galeri foto ${roomName}`">
      <header class="gallery-header">
        <div>
          <h2>Foto {{ roomName }}</h2>
          <p>{{ photos.length }} foto</p>
        </div>
        <button type="button" class="gallery-close" aria-label="Tutup galeri" @click="emit('close')">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </header>

      <div class="gallery-stage">
        <button v-if="photos.length > 1" type="button" class="gallery-nav previous" aria-label="Foto sebelumnya" @click="previous">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <div
          class="gallery-media"
          role="img"
          :aria-label="`${roomName}, foto ${activeIndex + 1}`"
          :style="activePhotoStyle"
        />
        <button v-if="photos.length > 1" type="button" class="gallery-nav next" aria-label="Foto berikutnya" @click="next">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
        </button>
        <strong class="gallery-counter">{{ activeIndex + 1 }}/{{ photos.length }}</strong>
      </div>

      <div class="gallery-browser">
        <div class="gallery-filter">Semua foto ({{ photos.length }})</div>
        <div class="gallery-thumbnails" aria-label="Daftar foto">
          <button
            v-for="(photo, index) in photos"
            :key="`${photo.slice(-24)}-${index}`"
            type="button"
            class="gallery-thumb"
            :class="{ active: index === activeIndex }"
            :aria-label="`Lihat foto ${index + 1}`"
            :aria-current="index === activeIndex ? 'true' : undefined"
            @click="selectPhoto(index)"
          >
            <img :src="photo" alt="" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.gallery-modal {
  position: fixed; inset: 0; z-index: 600; display: grid; grid-template-rows: 68px minmax(260px, 1fr) 148px;
  color: #f5f4eb; background: rgba(12, 15, 11, 0.96);
}
.gallery-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 0 28px; border-bottom: 1px solid rgba(255, 255, 255, 0.14); }
.gallery-header h2 { margin: 0; max-width: min(70vw, 700px); overflow: hidden; font-size: 16px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.gallery-header p { margin: 3px 0 0; color: rgba(255, 255, 255, 0.62); font-size: 10px; }
.gallery-close, .gallery-nav { display: grid; place-items: center; color: #fff; background: transparent; border: 1px solid rgba(255, 255, 255, 0.25); cursor: pointer; }
.gallery-close { width: 36px; height: 36px; border-radius: 6px; }
.gallery-close:hover, .gallery-nav:hover { background: rgba(255, 255, 255, 0.1); }
.gallery-close svg { width: 18px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 1.8; }
.gallery-stage { position: relative; min-width: 0; min-height: 0; overflow: hidden; }
.gallery-media { position: absolute; inset: 20px 80px 12px; min-width: 0; min-height: 0; background-position: center; background-repeat: no-repeat; background-size: contain; }
.gallery-nav { position: absolute; top: 50%; width: 42px; height: 56px; border-radius: 6px; transform: translateY(-50%); }
.gallery-nav.previous { left: 24px; }
.gallery-nav.next { right: 24px; }
.gallery-nav svg { width: 22px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.8; }
.gallery-counter { position: absolute; right: 28px; bottom: 14px; padding: 5px 8px; border-radius: 4px; color: #fff; background: rgba(0, 0, 0, 0.55); font-size: 11px; }
.gallery-browser { min-height: 0; display: flex; flex-direction: column; border-top: 1px solid rgba(255, 255, 255, 0.14); }
.gallery-filter { width: max-content; margin: 10px 28px 0; padding: 7px 10px; color: #fff; background: rgba(255, 255, 255, 0.12); border-bottom: 2px solid var(--accent); border-radius: 4px 4px 0 0; font-size: 10px; font-weight: 600; }
.gallery-thumbnails { flex: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; min-height: 0; overflow-y: auto; padding: 10px 28px 20px; scrollbar-width: thin; }
.gallery-thumb { height: 76px; padding: 0; overflow: hidden; background: #191d17; border: 2px solid transparent; border-radius: 5px; cursor: pointer; opacity: 0.62; }
.gallery-thumb:hover { opacity: 0.86; }
.gallery-thumb.active { border-color: var(--accent); opacity: 1; }
.gallery-thumb img { width: 100%; height: 100%; display: block; object-fit: cover; }

@media (max-width: 640px) {
  .gallery-modal { grid-template-rows: 60px minmax(220px, 1fr) 112px; }
  .gallery-header { padding: 0 16px; }
  .gallery-media { inset: 12px 48px; }
  .gallery-nav { width: 34px; height: 48px; }
  .gallery-nav.previous { left: 8px; }
  .gallery-nav.next { right: 8px; }
  .gallery-counter { right: 12px; bottom: 10px; }
  .gallery-filter { display: none; }
  .gallery-thumbnails { display: flex; gap: 7px; overflow-x: auto; overflow-y: hidden; padding: 12px 16px 16px; }
  .gallery-thumb { flex: 0 0 86px; height: 70px; }
}
</style>
