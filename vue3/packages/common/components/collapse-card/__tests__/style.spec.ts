import { defineComponent, h, nextTick, type StyleValue } from 'vue'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CollapseCard from '../collapse-card.vue'

enableAutoUnmount(afterEach)

// Model a new control whose root is CollapseCard, with normal Vue attrs forwarding.
const Control = defineComponent({
  setup() {
    return () => h(CollapseCard, { iconClass: 'test-icon', headerName: 'Control' })
  }
})

describe('CollapseCard background styles', () => {
  it.each<{ name: string; style: StyleValue }>([
    { name: 'object', style: { backgroundColor: 'red', width: '280px' } },
    { name: 'CSS string', style: 'background-color: red; width: 280px' },
    {
      name: 'nested array',
      style: [{ backgroundColor: 'blue' }, [{ backgroundColor: 'red', width: '280px' }]]
    }
  ])('hides an incoming background with the content ($name)', async ({ style }) => {
    const onClick = vi.fn()
    const wrapper = mount(Control, {
      attachTo: document.body,
      attrs: { style, class: 'custom-control', 'data-control': 'example', onClick }
    })
    const root = wrapper.get<HTMLElement>('.sm-component-collapse-card')
    const content = wrapper.get<HTMLElement>('.sm-component-collapse-card__content')

    expect(root.element.style.backgroundColor).toBe('')
    expect(root.element.style.width).toBe('280px')
    expect(root.classes()).toContain('custom-control')
    expect(root.attributes('data-control')).toBe('example')
    expect(content.element.style.backgroundColor).toBe('red')
    expect(content.isVisible()).toBe(true)
    await root.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()

    await wrapper.get('.sm-component-collapse-card__icon').trigger('click')
    expect(content.isVisible()).toBe(false)
    expect(root.element.style.backgroundColor).toBe('')
    await wrapper.get('.sm-component-collapse-card__icon').trigger('click')
    expect(content.isVisible()).toBe(true)
    expect(content.element.style.backgroundColor).toBe('red')
  })

  it('moves shorthand, gradients and image options off the root', async () => {
    const wrapper = mount(CollapseCard, {
      attachTo: document.body,
      props: { iconClass: 'test-icon', collapsed: true },
      attrs: {
        style: {
          background: 'red',
          backgroundImage: 'linear-gradient(red, blue)',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          '--control-width': '280px',
          width: 'var(--control-width)',
          color: 'purple',
          fontSize: '18px'
        }
      }
    })
    const root = wrapper.element
    const content = wrapper.get<HTMLElement>('.sm-component-collapse-card__content')

    expect(root.style.background).toBe('')
    expect(root.style.backgroundImage).toBe('')
    expect(root.style.width).toBe('var(--control-width)')
    expect(root.style.color).toBe('purple')
    expect(root.style.getPropertyValue('--control-width')).toBe('280px')
    expect(content.isVisible()).toBe(false)
    await wrapper.get('.sm-component-collapse-card__icon').trigger('click')
    expect(content.isVisible()).toBe(true)
    expect(content.element.style.backgroundColor).toBe('red')
    expect(content.element.style.backgroundImage).toBe('linear-gradient(red, blue)')
    expect(content.element.style.backgroundSize).toBe('cover')
    expect(content.element.style.backgroundRepeat).toBe('no-repeat')
    expect(content.element.style.backgroundPosition).toBe('center')
    expect(content.element.style.backgroundAttachment).toBe('fixed')
    expect(content.element.style.fontSize).toBe('18px')
  })

  it('updates and removes editor styles while collapsed and restores the background prop', async () => {
    const wrapper = mount(CollapseCard, {
      attachTo: document.body,
      props: { iconClass: 'test-icon', background: 'blue', collapsed: true },
      attrs: { style: { backgroundColor: 'red', backgroundImage: 'url("panel.png")' } }
    })
    const content = wrapper.get<HTMLElement>('.sm-component-collapse-card__content')
    expect(content.element.style.backgroundColor).toBe('red')
    expect(wrapper.get<HTMLElement>('.sm-component-collapse-card__icon').element.style.backgroundColor).toBe('blue')

    await wrapper.setProps({ style: { backgroundColor: 'green', width: '300px' } })
    expect(content.element.style.backgroundColor).toBe('green')
    expect(content.element.style.backgroundImage).toBe('')
    expect(wrapper.element.style.width).toBe('300px')
    await wrapper.setProps({ style: undefined, background: 'purple' })
    expect(content.element.style.backgroundColor).toBe('purple')
    expect(wrapper.element.style.width).toBe('')
    await wrapper.get('.sm-component-collapse-card__icon').trigger('click')
    expect(content.isVisible()).toBe(true)
    expect(wrapper.element.style.backgroundColor).toBe('')
  })

  it('keeps a card without an icon or header transparent unless a style supplies a background', async () => {
    const wrapper = mount(CollapseCard, { attachTo: document.body })
    expect(wrapper.get<HTMLElement>('.sm-component-collapse-card__content').element.style.background).toBe('transparent')
    expect(wrapper.find('.sm-component-collapse-card__icon').exists()).toBe(false)
    await nextTick()
  })
})
