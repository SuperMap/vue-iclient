import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { message as Message } from 'ant-design-vue'
import CoordinateConversionViewModel from '@supermapgis/iclient-components-core/mapboxgl/src/CoordinateConversionViewModel'
import {
  SmCoordinateConversion,
  type CoordinateConversionProps
} from '@supermapgis/mapboxgl/components/coordinate-conversion'

function mountControl(props: CoordinateConversionProps = {}) {
  return mount(defineComponent({ setup: () => () => h(SmCoordinateConversion, props) }))
}

describe('CoordinateConversion', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the default formats', async () => {
    const wrapper = mountControl({ collapsed: true })

    await wrapper.vm.$nextTick()
    expect(wrapper.find('.sm-component-coordinate-conversion').exists()).toBe(true)
    wrapper.unmount()
  })

  it('accepts a custom formats prop', async () => {
    const wrapper = mountControl({ formats: ['XY', 'DD'] })

    await wrapper.vm.$nextTick()
    expect(wrapper.find('.sm-component-coordinate-conversion').exists()).toBe(true)
    wrapper.unmount()
  })

  it('converts captured coordinates to UTM and locates coordinates entered in UTM', async () => {
    const listen = vi.spyOn(CoordinateConversionViewModel.prototype, 'on')
    const flyTo = vi.spyOn(CoordinateConversionViewModel.prototype, '_flyTo')
    const wrapper = mountControl({ formats: ['UTM'] })
    const subscription = listen.mock.calls.findIndex(([event]) => event === 'getcoordinate')
    const viewModel = listen.mock.contexts[subscription]
    expect(viewModel).toBeDefined()

    // 使用真实 UTM 导出覆盖正反转换，验证用户从捕捉坐标到输入定位的链路。
    viewModel.fire('getcoordinate', { coordinate: { lng: 116.4, lat: 39.9 } })
    await wrapper.vm.$nextTick()
    const input = wrapper.find('input.sm-component-input')
    expect((input.element as HTMLInputElement).value).toBe('50S 448709 4416830')

    await input.setValue('50S 448709 4416830')
    await input.trigger('blur')
    await wrapper.find('.sm-component-coordinate-conversion__location').trigger('click')
    expect(flyTo).toHaveBeenCalledOnce()
    const [lng, lat] = flyTo.mock.calls[0][0] as number[]
    expect(lng).toBeCloseTo(116.4, 4)
    expect(lat).toBeCloseTo(39.9, 4)
    wrapper.unmount()
  })

  it.each([false, true])('preserves captured coordinate precision when the displayed value is unchanged, blur=%s', async blur => {
    const listen = vi.spyOn(CoordinateConversionViewModel.prototype, 'on')
    const flyTo = vi.spyOn(CoordinateConversionViewModel.prototype, '_flyTo')
    const wrapper = mountControl({ formats: ['UTM'] })
    try {
      const subscription = listen.mock.calls.findIndex(([event]) => event === 'getcoordinate')
      const captured = { lng: 116.41234567, lat: 39.92345678 }
      listen.mock.contexts[subscription].fire('getcoordinate', { coordinate: captured })
      await wrapper.vm.$nextTick()
      if (blur) {
        await wrapper.find('input.sm-component-input').trigger('blur')
      }
      await wrapper.find('.sm-component-coordinate-conversion__location').trigger('click')
      expect(flyTo).toHaveBeenLastCalledWith([captured.lng, captured.lat])
    } finally {
      wrapper.unmount()
    }
  })

  it.each([
    ['XY', 'aaa103.87, 30.70'],
    ['XY', '103.87,'],
    ['XY', '103.87, 30.70, 10'],
    ['XY', '103.87, 91'],
    ['XY', 'Infinity, 30.70'],
    ['DD', ', 103.87'],
    ['BASEMAP', 'aaa103.87 30.70'],
    ['Mercator', 'aaa103.87 30.70'],
    ['UTM', '0Z 100 100'],
    ['DOM', 'aaa'],
    ['DMS', 'aaa']
  ])('rejects invalid %s coordinates %s before calling the map engine', async (format, value) => {
    const error = vi.spyOn(Message, 'error').mockImplementation(() => undefined)
    const flyTo = vi.spyOn(CoordinateConversionViewModel.prototype, '_flyTo')
    const addMarker = vi.spyOn(CoordinateConversionViewModel.prototype, '_addMarker')
    const wrapper = mountControl({ formats: [format] })
    try {
      const input = wrapper.find('input.sm-component-input')
      await input.setValue(value)
      await input.trigger('blur')
      await wrapper.find('.sm-component-coordinate-conversion__location').trigger('click')
      expect(error).toHaveBeenCalledWith(expect.objectContaining({ content: '坐标格式不正确' }))
      expect(new Set(error.mock.calls.map(([config]) => typeof config === 'object' && config.key)).size).toBe(1)
      expect(flyTo).not.toHaveBeenCalled()
      expect(addMarker).not.toHaveBeenCalled()
    } finally {
      wrapper.unmount()
    }
  })

  it('replaces a captured coordinate with current input and recovers after invalid input', async () => {
    const listen = vi.spyOn(CoordinateConversionViewModel.prototype, 'on')
    const flyTo = vi.spyOn(CoordinateConversionViewModel.prototype, '_flyTo')
    const error = vi.spyOn(Message, 'error').mockImplementation(() => undefined)
    const wrapper = mountControl({ formats: ['XY'] })
    try {
      const subscription = listen.mock.calls.findIndex(([event]) => event === 'getcoordinate')
      listen.mock.contexts[subscription].fire('getcoordinate', { coordinate: { lng: 116.4, lat: 39.9 } })
      await wrapper.vm.$nextTick()
      const input = wrapper.find('input.sm-component-input')
      const locate = wrapper.find('.sm-component-coordinate-conversion__location')
      await input.setValue('aaa103.87, 30.70')
      // 直接点击定位，不依赖 blur 事件已发生，也不能回退到捕捉到的旧坐标。
      await locate.trigger('click')
      expect(flyTo).not.toHaveBeenCalled()
      expect(error).toHaveBeenCalledOnce()
      error.mockClear()
      await input.setValue('   ')
      await input.trigger('blur')
      await locate.trigger('click')
      expect(error).not.toHaveBeenCalled()
      expect(flyTo).not.toHaveBeenCalled()
      await input.setValue(' 0°, 0° ')
      await locate.trigger('click')
      expect(flyTo).toHaveBeenLastCalledWith([0, 0])
      await input.setValue('103.87, 30.70')
      await locate.trigger('click')
      expect(flyTo).toHaveBeenLastCalledWith([103.87, 30.7])
    } finally {
      wrapper.unmount()
    }
  })

  it('reports a custom converter failure without propagating it to the map engine', async () => {
    const error = vi.spyOn(Message, 'error').mockImplementation(() => undefined)
    const flyTo = vi.spyOn(CoordinateConversionViewModel.prototype, '_flyTo')
    const wrapper = mountControl({ formats: [{
      title: 'custom',
      fromWGS84: ({ lng, lat }) => `${lng}, ${lat}`,
      toWGS84: () => { throw new Error('invalid') }
    }] })
    try {
      await wrapper.find('input.sm-component-input').setValue('invalid')
      await wrapper.find('.sm-component-coordinate-conversion__location').trigger('click')
      expect(error).toHaveBeenCalledOnce()
      expect(flyTo).not.toHaveBeenCalled()
    } finally {
      wrapper.unmount()
    }
  })
})
