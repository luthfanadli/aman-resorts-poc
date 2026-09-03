import { LngLatBounds } from 'maplibre-gl'
import type { ParcelCollection, ParcelFeature } from '../../types/parcel'

export function getFeatureBounds(feature: ParcelFeature) {
  const bounds = new LngLatBounds()
  for (const ring of feature.geometry.coordinates) {
    for (const coordinate of ring) {
      bounds.extend(coordinate as [number, number])
    }
  }
  return bounds
}

export function getCollectionBounds(collection: ParcelCollection) {
  const bounds = new LngLatBounds()
  for (const feature of collection.features) {
    bounds.extend(getFeatureBounds(feature))
  }
  return bounds
}
