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
})
