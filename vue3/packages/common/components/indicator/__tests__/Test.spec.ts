import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import RestService from '@supermapgis/iclient-components-core/core/utils/RestService'
import Indicator from '../indicator.vue'

describe('Indicator animation', () => {
  it('stops the current animation and updates numbers immediately after animation is disabled', async () => {
    const wrapper = mount(Indicator, {
      props: { num: 100, animated: true, duration: 10000 }
    })

    await wrapper.setProps({ num: 1000 })
    await wrapper.setProps({ animated: false })
    await nextTick()
    expect(wrapper.find('.sm-component-indicator__num').text()).toBe('1000')

    await wrapper.setProps({ num: 200 })
    await nextTick()
    expect(wrapper.find('.sm-component-indicator__num').text()).toBe('200')
    wrapper.unmount()
  })

  it('passes empty query options when loading the configured URL', () => {
    const getData = vi.spyOn(RestService.prototype, 'getData').mockImplementation(() => undefined)
    const wrapper = mount(Indicator, { props: { url: '/data.geojson' } })

    expect(getData).toHaveBeenCalledWith('/data.geojson', {})

    wrapper.unmount()
    getData.mockRestore()
  })
})
