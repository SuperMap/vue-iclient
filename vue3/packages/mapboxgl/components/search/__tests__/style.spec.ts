import { enableAutoUnmount, shallowMount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Search from '../search.vue'

enableAutoUnmount(afterEach)

vi.mock('@supermapgis/common/hooks/index.common', async () => ({
  ...(await import('@supermapgis/common/hooks/useTheme')),
  ...(await import('@supermapgis/common/hooks/useLocale')),
  useMapGetter: () => ({ mapNotLoadedTip: () => false })
}))

vi.mock('@supermapgis/mapboxgl/hooks', () => ({ useMapControl: vi.fn() }))
vi.mock('@supermapgis/iclient-components-core/mapboxgl/src/SearchViewModel', () => ({
  default: class {
    removed = vi.fn()
  }
}))

describe('Search background styles', () => {
  it('hides the background with the search panel and preserves root attrs', async () => {
    const onClick = vi.fn()
    const wrapper = shallowMount(Search, {
      attachTo: document.body,
      global: { stubs: { transition: false } },
      props: { layerNames: ['cities'] },
      attrs: {
        class: 'custom-search',
        'data-control': 'search',
        onClick,
        style: {
          backgroundColor: 'red',
          backgroundImage: 'linear-gradient(red, blue)',
          color: 'purple',
          width: '320px'
        }
      }
    })
    const content = wrapper.get<HTMLElement>('.sm-component-search__content')
    expect(wrapper.element.style.backgroundColor).toBe('')
    expect(wrapper.element.style.backgroundImage).toBe('')
    expect(wrapper.element.style.width).toBe('320px')
    expect(wrapper.element.style.color).toBe('purple')
    expect(wrapper.classes()).toContain('custom-search')
    expect(wrapper.attributes('data-control')).toBe('search')
    expect(content.element.style.backgroundColor).toBe('red')
    // Paint the external background once on the content, including translucent colors/images.
    expect(wrapper.get<HTMLElement>('.sm-component-search__input').element.style.backgroundColor).toBe('transparent')
    expect(wrapper.get<HTMLElement>('.sm-component-search__input').element.style.backgroundImage).toBe('')
    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()

    await wrapper.get('.sm-component-search__datasource-icon').trigger('click')
    const result = wrapper.get<HTMLElement>('.sm-component-search__result')
    expect(result.isVisible()).toBe(true)
    expect(result.element.style.backgroundColor).toBe('transparent')
    await wrapper.get('.sm-component-search__arrow-icon').trigger('click')
    await vi.waitFor(() => {
      expect(content.isVisible()).toBe(false)
      expect(wrapper.get('.sm-component-search__toggle-icon').isVisible()).toBe(true)
    })
    expect(wrapper.element.style.backgroundColor).toBe('')

    await wrapper.setProps({ style: { backgroundColor: 'green' } })
    expect(content.element.style.backgroundColor).toBe('green')
    expect(content.element.style.backgroundImage).toBe('')
    await wrapper.get('.sm-component-search__toggle-icon').trigger('click')
    expect(content.isVisible()).toBe(true)
    await wrapper.setProps({ style: undefined, background: 'blue' })
    expect(content.element.style.backgroundColor).toBe('blue')
    expect(wrapper.get<HTMLElement>('.sm-component-search__input').element.style.backgroundColor).toBe('blue')
    expect(wrapper.element.style.backgroundColor).toBe('')
  })

  it('applies the same style rules to toolbar mode', () => {
    const wrapper = shallowMount(Search, {
      attachTo: document.body,
      props: { mode: 'toolBar', collapsed: true },
      attrs: { style: 'background-color: red; width: 320px' }
    })
    expect(wrapper.element.style.backgroundColor).toBe('')
    expect(wrapper.element.style.width).toBe('320px')
    expect(wrapper.get('.sm-component-search__content').isVisible()).toBe(true)
    expect(wrapper.get<HTMLElement>('.sm-component-search__content').element.style.backgroundColor).toBe('red')
    expect(wrapper.find('.sm-component-search__toggle-icon').exists()).toBe(false)
  })
})
