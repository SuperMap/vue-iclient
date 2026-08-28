import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
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
})
