import { defineComponent, h, nextTick, type PropType } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import sceneEvent from 'vue-iclient-core/types/scene-event'
import SceneLayerList from '../scene-layer-list.vue'

vi.mock('@supermapgis/mapboxgl/hooks', () => ({
  useSceneControl: vi.fn()
}))

interface TreeNode {
  key: string
  title?: string
  type?: string
  aliasKey?: string
  visible?: boolean
  isLeaf?: boolean
  children?: TreeNode[]
}

interface EntityDataSource {
  name: string
  show?: boolean
  entities: {
    show: boolean
    values: unknown[]
  }
  ___layerData: {
    id: string
    name: string
    type: string
    config: { type: string }
  }
}

const ContainerStub = defineComponent({
  setup(_, { slots }) {
    return () => h('div', slots.default?.())
  }
})

const TreeStub = defineComponent({
  props: {
    treeData: {
      type: Array as PropType<TreeNode[]>,
      default: (): TreeNode[] => []
    }
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        { class: 'scene-layer-list-tree-stub' },
        props.treeData.flatMap(group => [
          h('div', { class: 'scene-layer-list-tree-group', 'data-key': group.key }, group.title),
          ...(group.children || []).map(item =>
            h(
              'div',
              { class: 'scene-layer-list-tree-item', 'data-key': item.key },
              slots.title?.({ ...item, isLeaf: item.isLeaf ?? !item.children })
            )
          )
        ])
      )
  }
})

function createViewer(dataSources: EntityDataSource[]) {
  return {
    scene: {
      layers: { _layerQueue: [] },
      _vectorTileMaps: { _layerQueue: [] }
    },
    imageryLayers: { _layers: [] },
    terrainProvider: {},
    dataSources: {
      length: dataSources.length,
      get: (index: number) => dataSources[index]
    },
    flyTo: vi.fn()
  }
}

let wrapper: ReturnType<typeof mount> | undefined
let sceneTarget = ''

function getTreeData(): TreeNode[] {
  return (wrapper?.findComponent(TreeStub).props('treeData') ?? []) as TreeNode[]
}

afterEach(() => {
  wrapper?.unmount()
  sceneEvent.deleteScene(sceneTarget)
  wrapper = undefined
})

describe('SmSceneLayerList', () => {
  it('lists vector layers and supports visibility and zoom actions', async () => {
    const entityDataSource = {
      name: 'Cities',
      show: true,
      entities: {
        show: true,
        values: [{ id: 'city-1' }]
      },
      ___layerData: {
        id: 'rest-cities',
        name: 'REST Cities',
        type: 'data',
        config: { type: 'rest' }
      }
    }
    const viewer = createViewer([
      entityDataSource,
      {
        name: 'Other data source',
        entities: { show: true, values: [] },
        ___layerData: {
          id: 'other-data',
          name: 'Other data',
          type: 'data',
          config: { type: 'geojson' }
        }
      },
      {
        name: 'Deleted REST data source',
        entities: { show: false, values: [] },
        ___layerData: {
          id: 'deleted-rest-data',
          name: 'Deleted REST data',
          type: 'data',
          config: { type: 'rest' }
        }
      }
    ])
    sceneTarget = 'scene-layer-list-entity'
    sceneEvent.setScene(sceneTarget, { viewer })

    wrapper = mount(SceneLayerList, {
      props: { sceneTarget },
      global: {
        stubs: {
          SmCollapseCard: ContainerStub,
          SmCard: ContainerStub,
          SmTree: TreeStub
        }
      }
    })
    await nextTick()

    const treeData = getTreeData()
    const entityGroup = treeData.find(group => group.type === 'entity')
    expect(entityGroup?.title).toBe('矢量图层')
    expect(entityGroup?.children).toEqual([
      expect.objectContaining({
        title: 'REST Cities',
        aliasKey: 'rest-cities',
        type: 'entity',
        visible: true
      })
    ])
    expect(wrapper.text()).not.toContain('Other data')
    expect(wrapper.text()).not.toContain('Deleted REST data')

    await wrapper.find('.sm-components-icon-suofangzhituceng').trigger('click')
    expect(viewer.flyTo).toHaveBeenCalledWith(entityDataSource.entities.values)

    await wrapper.find('.sm-components-icon-visible').trigger('click')
    expect(entityDataSource.entities.show).toBe(false)
    expect(getTreeData().find(group => group.type === 'entity')?.children?.[0]?.visible).toBe(
      false
    )
  })
})
