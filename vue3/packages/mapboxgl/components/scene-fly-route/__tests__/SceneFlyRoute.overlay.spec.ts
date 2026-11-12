import { enableAutoUnmount, shallowMount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@supermapgis/common/hooks/index.common', () => ({
  useLocale: () => ({
    t: (key: string) => ({
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

    getStops() {
      return []
    }

    destroy() {}
  }
}))

import SceneFlyRoute from '../scene-fly-route.vue'

enableAutoUnmount(afterEach)

describe('SceneFlyRoute dropdown stacking', () => {
  it('raises the control while either dropdown is open and restores it when both close', async () => {
    const wrapper = shallowMount(SceneFlyRoute, {
      global: {
        stubs: {
          SmCard: { template: '<div><slot /></div>' },
          SmCheckbox: { inheritAttrs: false, template: '<div><slot /></div>' },
          SmCollapseCard: { template: '<div><slot /></div>' },
          SmSelect: {
            name: 'SmSelect',
            emits: ['dropdownVisibleChange'],
            template: '<div><slot /></div>'
          }
        }
      }
    })
    const selects = wrapper.findAllComponents({ name: 'SmSelect' })
    const control = wrapper.get('.sm-component-scene-fly-route')

    expect(selects).toHaveLength(2)
    expect(control.classes()).not.toContain('is-dropdown-open')

    selects[0].vm.$emit('dropdownVisibleChange', true)
    await wrapper.vm.$nextTick()
    expect(control.classes()).toContain('is-dropdown-open')

    selects[1].vm.$emit('dropdownVisibleChange', true)
    selects[0].vm.$emit('dropdownVisibleChange', false)
    await wrapper.vm.$nextTick()
    expect(control.classes()).toContain('is-dropdown-open')

    selects[1].vm.$emit('dropdownVisibleChange', false)
    await wrapper.vm.$nextTick()
    expect(control.classes()).not.toContain('is-dropdown-open')
  })
})
