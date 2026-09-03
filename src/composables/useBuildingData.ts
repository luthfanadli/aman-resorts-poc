import { markRaw, readonly, ref, shallowRef } from 'vue'
import type { BuildingCollection } from '../types/parcel'

function isBuildingCollection(value: unknown): value is BuildingCollection {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<BuildingCollection>
  return candidate.type === 'FeatureCollection'
    && Array.isArray(candidate.features)
    && candidate.features.length > 0
    && candidate.features.every((feature) =>
      feature.type === 'Feature'
      && feature.geometry?.type === 'MultiPolygon'
      && Array.isArray(feature.geometry.coordinates),
    )
}

export function useBuildingData(dataUrl: string) {
  const collection = shallowRef<BuildingCollection | null>(null)
  const isLoading = ref(true)
  const error = ref('')

  async function load() {
    isLoading.value = true
    error.value = ''
    try {
      const response = await fetch(dataUrl)
      if (!response.ok) throw new Error(`Data bangunan gagal dimuat (HTTP ${response.status}).`)
      const data: unknown = await response.json()
      if (!isBuildingCollection(data)) throw new Error('Format data bangunan tidak valid.')
      collection.value = markRaw(data)
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : 'Data bangunan gagal dimuat.'
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
