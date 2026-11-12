import { enableAutoUnmount, shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  viewModels: [] as Array<{
    on: ReturnType<typeof vi.fn>
  }>
}))

vi.mock('@supermapgis/common/hooks/index.common', () => ({
  useLocale: () => ({
    t: (key: string) => ({
      'sceneFlyRoute.viewerRequired': '请先绑定三维场景，再加载飞行路线',
      'sceneFlyRoute.loadTimeout': '飞行路线加载超时，请检查 FPF 地址是否有效及文件是否可访问',
      'sceneFlyRoute.play': '播放',
      'sceneFlyRoute.stop': '停止并退出漫游'
    }[key] ?? key)
  }),
  useSceneGetter: vi.fn(),
  useTheme: () => ({
    gisControlHeaderBgStyle: {},
    textColorHeadingStyle: {},
    textColorStyle: {}
  })
}))

vi.mock('@supermapgis/mapboxgl/hooks', () => ({ useSceneControl: vi.fn() }))
vi.mock('@supermapgis/iclient-components-core/mapboxgl/src/SceneFlyRouteViewModel', () => ({
  default: class {
    on = vi.fn()
    status = 'idle'
    isPlaying = false
    isReady = false

    constructor() {
      mocks.viewModels.push(this)
    }

    getStops() {
      return []
    }

    destroy() {}
  }
}))

import SceneFlyRoute from '../scene-fly-route.vue'

enableAutoUnmount(afterEach)

describe('SceneFlyRoute error localization', () => {
  afterEach(() => {
    mocks.viewModels.length = 0
  })

  it.each([
    ['A scene viewer must be set before loading a flight route', '请先绑定三维场景，再加载飞行路线'],
    ['Timed out while loading flight route data', '飞行路线加载超时，请检查 FPF 地址是否有效及文件是否可访问']
  ])('localizes the "%s" error', async (message, expected) => {
    const wrapper = shallowMount(SceneFlyRoute, {
      global: {
        stubs: {
          SmCard: { template: '<div><slot /></div>' },
          SmCheckbox: { inheritAttrs: false, template: '<div><slot /></div>' },
          SmCollapseCard: { template: '<div><slot /></div>' },
          SmSelect: { inheritAttrs: false, template: '<div><slot /></div>' }
        }
      }
    })
    const errorHandler = mocks.viewModels[0].on.mock.calls.find(
      ([event]) => event === 'error'
    )?.[1]

    errorHandler?.({ error: new Error(message) })
    await nextTick()

    expect(wrapper.get('[role="alert"]').text()).toBe(expected)
    expect(wrapper.find('button[title="播放"]').exists()).toBe(true)
    expect(wrapper.find('button[title="停止并退出漫游"]').exists()).toBe(true)
  })
})
