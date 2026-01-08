import mapboxgl from 'vue-iclient-static/libs/mapboxgl/mapbox-gl-enhance'
import { vi } from 'vitest'

vi.mock('mapbox-gl', () => {
  return {
    default: mapboxgl,
    ...mapboxgl
  }
})