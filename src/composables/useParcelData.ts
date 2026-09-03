import { markRaw, readonly, ref, shallowRef } from 'vue'
import type { ParcelCollection } from '../types/parcel'

function isParcelCollection(value: unknown): value is ParcelCollection {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<ParcelCollection>
  return candidate.type === 'FeatureCollection'
    && Array.isArray(candidate.features)
    && candidate.features.length > 0
    && candidate.features.every((feature) =>
      feature.type === 'Feature'
      && typeof feature.id === 'number'
      && feature.geometry?.type === 'Polygon'
      && Array.isArray(feature.geometry.coordinates),
    )
}

export function useParcelData(dataUrl: string) {
  const collection = shallowRef<ParcelCollection | null>(null)
  const isLoading = ref(true)
  const error = ref('')

  async function load() {
    isLoading.value = true
    error.value = ''
    try {
      const response = await fetch(dataUrl)
      if (!response.ok) {
        throw new Error(`Data persil gagal dimuat (HTTP ${response.status}).`)
      }
      const data: unknown = await response.json()
      if (!isParcelCollection(data)) {
        throw new Error('Format data persil tidak valid.')
      }
      collection.value = markRaw(data)
    } catch (caughtError) {
      error.value = caughtError instanceof Error
        ? caughtError.message
        : 'Data persil gagal dimuat.'
    } finally {
      isLoading.value = false
    }
  }

  void load()

  return {
    collection,
    isLoading: readonly(isLoading),
    error: readonly(error),
    reload: load,
  }
}
