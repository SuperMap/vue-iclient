import { enableAutoUnmount, shallowMount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import WebMap from '@supermapgis/mapboxgl/components/web-map/webmap.vue'
import type { CoordinateConversionControlParam } from '@supermapgis/mapboxgl/components/web-map/types'

// 保留父组件真实的控件选择与渲染，仅隔离地图引擎和子控件内部实现，避免依赖 GPU 和网络。
vi.mock('@supermapgis/iclient-components-core/mapboxgl/src/WebMapViewModel', () => ({
  default: class {
    options = {}
    on = vi.fn()
    un = vi.fn()
    cleanWebMap = vi.fn()
  }
}))
vi.mock('@supermapgis/iclient-components-core/core/types/map-event', () => ({
  default: { deleteMap: vi.fn() }
}))
vi.mock('@supermapgis/common/hooks/index.common', () => ({
  useVmProps: () => ({ setViewModel: vi.fn() }),
  useLocale: () => ({ t: (key: string) => key }),
  useEventListeners: () => ({ eventListenerNames: [] })
}))
vi.mock('@supermapgis/common/components/spin/Spin', () => ({ default: {} }))
vi.mock('@supermapgis/mapboxgl/components/zoom/zoom.vue', () => ({ default: {} }))
vi.mock('@supermapgis/mapboxgl/components/reset-view/reset-view.vue', () => ({ default: {} }))
vi.mock('@supermapgis/mapboxgl/components/compass/compass.vue', () => ({ default: {} }))
vi.mock('@supermapgis/mapboxgl/components/draw/draw.vue', () => ({ default: {} }))
vi.mock('@supermapgis/mapboxgl/components/identify/identify.vue', () => ({ default: {} }))
vi.mock('@supermapgis/mapboxgl/components/pan/pan.vue', () => ({ default: {} }))
vi.mock('@supermapgis/mapboxgl/components/layer-list/layer-list.vue', () => ({ default: {} }))
vi.mock('@supermapgis/mapboxgl/components/measure/measure.vue', () => ({ default: {} }))
vi.mock('@supermapgis/mapboxgl/components/query/query.vue', () => ({ default: {} }))
vi.mock('@supermapgis/mapboxgl/components/search/search.vue', () => ({ default: {} }))
vi.mock('@supermapgis/mapboxgl/components/scale/scale.vue', () => ({ default: {} }))
vi.mock('@supermapgis/mapboxgl/components/mini-map/mini-map.vue', () => ({ default: {} }))
vi.mock('@supermapgis/mapboxgl/components/attribute-popup/attribute-popup.vue', () => ({ default: {} }))
vi.mock('@supermapgis/mapboxgl/components/legend/legend.vue', () => ({ default: {} }))
vi.mock('@supermapgis/mapboxgl/components/base-layer-switcher/base-layer-switcher.vue', () => ({
  default: {}
}))
vi.mock('@supermapgis/mapboxgl/components/data-editor/data-editor.vue', () => ({ default: {} }))
vi.mock('@supermapgis/mapboxgl/components/coordinate-conversion/coordinate-conversion.vue', () => ({
  default: {
    name: 'SmCoordinateConversion',
    props: ['show', 'showLocation', 'position', 'collapsed', 'headerName', 'background', 'textColor'],
    template: '<div />'
  }
}))

enableAutoUnmount(afterEach)

describe('SmWebMap built-in coordinate conversion', () => {
  it('keeps the MD control defaults disabled until explicitly enabled', () => {
    const wrapper = shallowMount(WebMap, {
      props: { autoresize: false, defaultLoading: false }
    })

    expect(wrapper.props('coordinateConversionControl')).toEqual({
      headerName: '',
      show: false,
      showLocation: true,
      position: 'top-right',
      collapsed: true
    })
    expect(wrapper.findComponent({ name: 'SmCoordinateConversion' }).exists()).toBe(false)
  })

  it('renders and updates control options, preserving them when the parent target changes', async () => {
    const wrapper = shallowMount(WebMap, {
      props: { target: 'first-map', autoresize: false, defaultLoading: false }
    })
    const options: CoordinateConversionControlParam = {
      show: true,
      showLocation: false,
      position: 'bottom-left',
      collapsed: false,
      headerName: '坐标转换',
      background: '#102030',
      textColor: '#ffffff'
    }

    await wrapper.setProps({ coordinateConversionControl: options })
    const control = wrapper.findComponent({ name: 'SmCoordinateConversion' })
    expect(control.exists()).toBe(true)
    expect(control.props()).toEqual(options)

    await wrapper.setProps({ target: 'second-map' })
    expect(wrapper.attributes('id')).toBe('second-map')
    expect(wrapper.findComponent({ name: 'SmCoordinateConversion' }).vm).toBe(control.vm)
    expect(control.props()).toEqual(options)

    const updated = { ...options, showLocation: true, collapsed: true, position: 'top-right' }
    await wrapper.setProps({ coordinateConversionControl: updated })
    expect(control.props()).toEqual(updated)

    await wrapper.setProps({ coordinateConversionControl: { ...updated, show: false } })
    expect(wrapper.findComponent({ name: 'SmCoordinateConversion' }).exists()).toBe(false)

    await wrapper.setProps({ coordinateConversionControl: updated })
    expect(wrapper.findComponent({ name: 'SmCoordinateConversion' }).props()).toEqual(updated)
  })
})
