import { afterEach, describe, expect, it, vi } from 'vitest'
import LayerManager from 'vue-iclient-core/utils/scene/layer-manager'

function createEntityCollection() {
  return {
    show: true,
    values: [],
    add: vi.fn(),
    remove: vi.fn(),
    removeAll: vi.fn()
  }
}

function createViewer() {
  const dataSources: any[] = []
  return {
    dataSources: {
      add: vi.fn((dataSource: any) => {
        dataSources.push(dataSource)
        return dataSource
      }),
      remove: vi.fn((dataSource: any) => {
        const index = dataSources.indexOf(dataSource)
        if (index >= 0) {
          dataSources.splice(index, 1)
        }
      })
    }
  }
}

afterEach(() => {
  delete (window as any).SuperMap3D
})

describe('LayerManager defaultShow', () => {
  it('loads hidden data layers and keeps their data source available for the layer list', async () => {
    const queryFeatures = vi.fn().mockResolvedValue({
      featureCollection: { type: 'FeatureCollection', features: [] }
    })
    ;(window as any).SuperMap3D = {
      VerticalOrigin: { BOTTOM: 'bottom' },
      RectangleCollisionChecker: class {
        _tree = { clear: vi.fn() }
      },
      CustomDataSource: class {
        name: string
        entities = createEntityCollection()
        clustering = {
          clusterEvent: { addEventListener: vi.fn() }
        }

        constructor(name: string) {
          this.name = name
        }
      }
    }
    const viewer = createViewer()
    const data = {
      id: 'hidden-rest-data',
      name: 'Hidden REST Data',
      type: 'data',
      defaultShow: false,
      config: { type: 'custom' }
    }
    const manager = new LayerManager(viewer, {
      extension: {
        loadDataFeatures: queryFeatures
      }
    })

    await manager.check(data, true)

    const layer = (manager.getLayerManger() as any).getLayerById(data.id)
    expect(queryFeatures).toHaveBeenCalledTimes(1)
    expect(layer.entities.show).toBe(false)
    expect(layer.dataSource.___layerData).toBe(data)
    expect(layer.dataSource.___layerRemoved).toBe(false)

    expect(manager.setDataLayerVisibility(data, true)).toBe(true)
    expect(layer.entities.show).toBe(true)

    await manager.check(data, false)

    expect(layer.entities.show).toBe(false)
    expect(layer.dataSource.___layerRemoved).toBe(true)
  })
})
