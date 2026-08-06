import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'
import { SmInputNumber } from '../InputNumber'

describe('InputNumber', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('dir', 'ltr')
  })

  it('uses the common component class and fills its container', () => {
    const wrapper = mount(SmInputNumber, { props: { value: 10 } })

    expect(wrapper.find('.sm-component-input-number').exists()).toBe(true)
  })

  it('displays arabic digits in rtl via formatter', async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    const wrapper = mount(SmInputNumber, {
      props: {
        value: 10,
        transformArabicNumbers: true
      }
    })
    await nextTick()
    const input = wrapper.find('input')
    expect(input.element.value).toContain('١')
    expect(input.element.value).toContain('٠')
  })
})
