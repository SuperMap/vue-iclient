import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'
import { SmInput, SmInputSearch } from '../Input'

describe('SmInput arabic digits', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('dir', 'ltr')
  })

  it('keeps latin digits in ltr', async () => {
    const wrapper = mount(SmInput, {
      props: {
        value: '12',
        transformArabicNumbers: true
      }
    })
    await nextTick()
    const input = wrapper.find('input')
    expect(input.element.value).toBe('12')
  })

  it('displays arabic digits in rtl and emits latin value', async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    const wrapper = mount(SmInput, {
      props: {
        value: '12',
        transformArabicNumbers: true
      }
    })
    await nextTick()
    const input = wrapper.find('input')
    expect(input.element.value).toBe('١٢')

    await input.setValue('٣٤')
    await nextTick()
    expect(wrapper.emitted('update:value')?.[0]).toEqual(['34'])
  })

  it('can disable arabic transform via prop', async () => {
    document.documentElement.setAttribute('dir', 'rtl')
    const wrapper = mount(SmInput, {
      props: {
        value: '12',
        transformArabicNumbers: false
      }
    })
    await nextTick()
    expect(wrapper.find('input').element.value).toBe('12')
  })
})

describe('SmInputSearch prefixCls', () => {
  it('uses sm-component-input-search and matching inner input prefix', async () => {
    const wrapper = mount(SmInputSearch)
    await nextTick()

    expect(wrapper.find('.sm-component-input-search').exists()).toBe(true)
    expect(wrapper.find('.sm-component-input-group-addon').exists()).toBe(true)
    expect(wrapper.find('.sm-component-input-search-button').exists()).toBe(true)
    expect(wrapper.find('.sm-component-input-group-wrapper').exists()).toBe(true)
  })
})
