import { describe, expect, it, vi } from 'vitest'
import SceneHighlightViewModel from 'vue-iclient-controllers-mapboxgl/src/SceneHighlightViewModel'

describe('SceneHighlightViewModel entity navigation', () => {
  it('cancels default entity navigation and restores the pre-click camera view', () => {
    const cancelFlight = vi.fn()
    const setView = vi.fn()
    const camera = {
      cancelFlight,
      setView
    }
    const viewer = {
      camera,
      trackedEntity: { id: 'tracked' },
      selectedEntity: { id: 'selected' }
    }
    const viewModel = new SceneHighlightViewModel()
    const cameraView = {
      destination: { x: 1, y: 2, z: 3 },
      orientation: {
        direction: { x: 0, y: 0, z: -1 },
        up: { x: 0, y: 1, z: 0 }
      }
    }
    const internal = viewModel as unknown as {
      viewer: typeof viewer
      scene: { camera: typeof camera }
      releaseDefaultEntityNavigation: (view: typeof cameraView) => void
    }
    internal.viewer = viewer
    internal.scene = { camera }
    internal.releaseDefaultEntityNavigation(cameraView)

    expect(viewer.trackedEntity).toBeUndefined()
    expect(viewer.selectedEntity).toBeUndefined()
    expect(cancelFlight).toHaveBeenCalledOnce()
    expect(setView).toHaveBeenCalledWith(cameraView)
  })
})
