import { afterEach, describe, expect, it, vi } from 'vitest'
import SceneFlyRouteViewModel from '@supermapgis/iclient-components-core/mapboxgl/src/SceneFlyRouteViewModel'

vi.mock('mapbox-gl', () => {
  class Evented {
    private listeners = new Map<string, Array<(payload: unknown) => void>>()

    on(type: string, listener: (payload: unknown) => void) {
      const current = this.listeners.get(type) ?? []
      current.push(listener)
      this.listeners.set(type, current)
      return this
    }

    fire(type: string, payload: unknown) {
      this.listeners.get(type)?.forEach(listener => listener(payload))
      return this
    }

  }

  return { default: { Evented } }
})

describe('SceneFlyRouteViewModel', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads routes, controls playback and restores the saved scene view', async () => {
    const stops = [{ name: 'Stop 1' }, { name: 'Stop 2' }]
    const route = {
      get: vi.fn((index: number) => stops[index]),
      isLineVisible: true,
      isStopVisible: true,
    }
    const managerRef: {
      manager?: { playRate: number }
      stopArrivedHandler?: (routeStop: unknown) => void
    } = {}
    class RouteCollection {
      ready = false
      routes = [route]
      fromFile = vi.fn()
    }
    class FlyManager {
      currentRoute = route
      currentStopIndex = 0
      playRate = 1
      stopArrived = {
        addEventListener: vi.fn((handler: (routeStop: unknown) => void) => {
          managerRef.stopArrivedHandler = handler
        }),
        removeEventListener: vi.fn()
      }
      play = vi.fn()
      pause = vi.fn()
      stop = vi.fn()
      viewToStop = vi.fn()
      getAllRouteStops = () => stops

      constructor() {
        managerRef.manager = this
      }
    }
    const setView = vi.fn()
    const viewer = {
      entities: {},
      scene: {
        camera: {
          position: { x: 1 },
          direction: { x: 0 },
          up: { y: 1 },
          setView
        }
      }
    }
    vi.stubGlobal('window', {
      SuperMap3D: {
        RouteCollection,
        FlyManager,
        Cartesian3: { clone: (value: object) => ({ ...value }) }
      }
    })

    const viewModel = new SceneFlyRouteViewModel({ fpfUrl: 'route.fpf', playRate: 2 })
    viewModel.setViewer(viewer)
    await viewModel.load()

    expect(viewModel.status).toBe('ready')
    expect(managerRef.manager?.play).not.toHaveBeenCalled()
    expect(managerRef.manager?.playRate).toBe(2)
    expect(viewModel.getStops().map(stop => stop.name)).toEqual(['Stop 1', 'Stop 2'])

    viewModel.play()
    expect(viewModel.status).toBe('playing')
    managerRef.stopArrivedHandler?.(stops[1])
    expect(viewModel.status).toBe('ready')

    viewModel.updateOptions({ playRate: 3 })
    viewModel.setLineVisible(false)
    viewModel.setStopVisible(false)
    expect(managerRef.manager?.playRate).toBe(3)
    expect(route.isLineVisible).toBe(false)
    expect(route.isStopVisible).toBe(false)

    viewModel.play()
    expect(viewModel.status).toBe('playing')
    viewModel.pause()
    expect(viewModel.status).toBe('paused')
    viewModel.stop()
    expect(viewModel.status).toBe('stopped')
    expect(setView).toHaveBeenCalledWith({
      destination: { x: 1 },
      orientation: { direction: { x: 0 }, up: { y: 1 } }
    })

    viewModel.play()
    viewModel.exit()
    expect(setView).toHaveBeenCalledTimes(2)
    expect(viewModel.status).toBe('idle')
    expect(viewModel.getStops()).toEqual([])
  })
})
