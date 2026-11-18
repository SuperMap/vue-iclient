import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
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
})
