import { shallowMount } from '@vue/test-utils'
import { SmColorPicker } from '../index'

describe('ColorPicker', () => {
  it('is exported as a common component and supports disabled state', () => {
    const wrapper = shallowMount(SmColorPicker, {
      props: {
        disabled: true,
        modelValue: '#ffffff'
      }
    })

    expect(wrapper.classes()).toContain('sm-component-color-picker')
    expect(wrapper.classes()).toContain('is-disabled')
  })

  it('closes when pointer interaction occurs outside the picker and popup', async () => {
    const wrapper = shallowMount(SmColorPicker)
    const tooltip = wrapper.findComponent({ name: 'SmTooltip' })

    tooltip.vm.$emit('openChange', true)
    await wrapper.vm.$nextTick()
    expect(tooltip.props('open')).toBe(true)

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(tooltip.props('open')).toBe(false)
  })
})
