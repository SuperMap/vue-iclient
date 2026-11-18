import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import type { CSSProperties, VNode } from 'vue'
import { isVNode } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import RestService from '@supermapgis/iclient-components-core/core/utils/RestService'
import { SmProgress } from '@supermapgis/common/components/progress'

function getLineBackgroundStyle(wrapper: VueWrapper): CSSProperties {
  // JSDOM 的渐变 CSS 解析不完整，检查真实 AntD 渲染节点生成的样式数据。
  const nodes: VNode[] = [wrapper.findComponent({ name: 'ProgressLine' }).vm.$.subTree]
  while (nodes.length) {
    const node = nodes.shift()!
    if (node.props?.class === 'sm-component-progress-bg') {
      return node.props.style
    }
    if (Array.isArray(node.children)) {
      nodes.push(...node.children.filter(isVNode))
    }
  }
  throw new Error('Missing rendered progress background')
}

describe('Progress', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it.each(['line', 'circle'] as const)('updates the root text color for %s', async type => {
    const wrapper = mount(SmProgress, {
      props: { type, percent: 80, textColor: '#123456' }
    })

    try {
      expect((wrapper.element as HTMLElement).style.color).toBe('rgb(18, 52, 86)')
      await wrapper.setProps({ textColor: '#abcdef' })
      expect((wrapper.element as HTMLElement).style.color).toBe('rgb(171, 205, 239)')
    } finally {
      wrapper.unmount()
    }
  })

  it('uses the prefixed progress as its root and forwards host attributes and events', async () => {
    const onClick = vi.fn()
    const wrapper = mount(SmProgress, {
      props: { percent: 80 },
      attrs: {
        id: 'host-progress',
        class: 'host-control',
        style: { width: '240px', height: '96px' },
        onClick
      }
    })

    expect(wrapper.element.matches('.sm-component-progress')).toBe(true)
    expect(wrapper.attributes('role')).toBe('progressbar')
    expect(wrapper.find('.sm-component-progress-container').exists()).toBe(false)
    expect(wrapper.attributes('id')).toBe('host-progress')
    expect(wrapper.classes()).toContain('host-control')
    expect((wrapper.element as HTMLElement).style.width).toBe('240px')
    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
    await wrapper.setProps({ percent: 60 })
    expect(wrapper.find('.sm-component-progress-text').text()).toBe('60%')
    wrapper.unmount()
  })

  it('renders a fraction as a percentage', () => {
    const wrapper = mount(SmProgress, {
      props: { percent: 0.8, percentType: 'percentage' }
    })

    expect(wrapper.findAll('.sm-component-progress')).toHaveLength(1)
    expect(wrapper.find('.ant-progress').exists()).toBe(false)
    expect(wrapper.find('.sm-component-progress-text').text()).toBe('80%')
    wrapper.unmount()
  })

  it('renders an existing percentage without converting it again', () => {
    const wrapper = mount(SmProgress, {
      props: { percent: 80, percentType: 'percent' }
    })

    expect(wrapper.find('.sm-component-progress-text').text()).toBe('80%')
    wrapper.unmount()
  })

  it('formats the value with the configured decimals', () => {
    const wrapper = mount(SmProgress, {
      props: { percent: 0.8567, percentType: 'percentage', decimals: 2 }
    })

    expect(wrapper.find('.sm-component-progress-text').text()).toBe('85.67%')
    wrapper.unmount()
  })

  it('renders the circle type', () => {
    const wrapper = mount(SmProgress, {
      props: { percent: 0.8, percentType: 'percentage', type: 'circle' }
    })

    expect(wrapper.find('.sm-component-progress-circle').exists()).toBe(true)
    wrapper.unmount()
  })

  it.each([
    {
      name: 'percentage color stops',
      strokeColor: { '100%': '#ff00ff', '0%': '#0000ff' },
      expected: 'linear-gradient(to right, #0000ff 0%, #ff00ff 100%)'
    },
    {
      name: 'from/to colors with a direction',
      strokeColor: { from: '#0000ff', to: '#ff00ff', direction: 'to left' },
      expected: 'linear-gradient(to left, #0000ff, #ff00ff)'
    }
  ])('renders a line gradient using $name', ({ strokeColor, expected }) => {
    const wrapper = mount(SmProgress, { props: { percent: 80, strokeColor } })
    try {
      expect(wrapper.find('.sm-component-progress-bg').exists()).toBe(true)
      expect(getLineBackgroundStyle(wrapper).backgroundImage).toBe(expected)
    } finally {
      wrapper.unmount()
    }
  })

  it('renders circle gradient stops and references them from the progress stroke', () => {
    const wrapper = mount(SmProgress, {
      props: {
        type: 'circle',
        percent: 80,
        strokeColor: { '100%': '#ff00ff', '0%': '#0000ff' }
      }
    })
    try {
      const gradient = wrapper.find('linearGradient')
      expect(gradient.findAll('stop').map(stop => [
        stop.attributes('offset'), stop.attributes('stop-color')
      ])).toEqual([['0%', '#0000ff'], ['100%', '#ff00ff']])
      expect(wrapper.find('.sm-component-progress-circle-path').attributes('stroke')).toBe(
        `url(#${gradient.attributes('id')})`
      )
    } finally {
      wrapper.unmount()
    }
  })

  it.each(['line', 'circle'] as const)('switches between solid and gradient colors for %s', async type => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(SmProgress, {
      props: { type, percent: 80, strokeColor: '#112233' }
    })
    try {
      await wrapper.setProps({ strokeColor: { '0%': '#0000ff', '100%': '#ff00ff' } })
      if (type === 'line') {
        expect(getLineBackgroundStyle(wrapper).backgroundImage).toBe(
          'linear-gradient(to right, #0000ff 0%, #ff00ff 100%)'
        )
      } else {
        expect(wrapper.findAll('linearGradient stop')).toHaveLength(2)
      }

      await wrapper.setProps({ strokeColor: '#445566' })
      if (type === 'line') {
        expect(getLineBackgroundStyle(wrapper).backgroundColor).toBe('#445566')
        expect(getLineBackgroundStyle(wrapper)).not.toHaveProperty('backgroundImage')
      } else {
        expect(wrapper.find('linearGradient').exists()).toBe(false)
        expect(
          (wrapper.find('.sm-component-progress-circle-path').element as SVGElement).style.stroke
        ).toBe('#445566')
      }
      expect(warn.mock.calls.some(args => args.some(value => String(value).includes('Invalid prop')))).toBe(false)
    } finally {
      wrapper.unmount()
      warn.mockRestore()
    }
  })

  it('observes the progress root for circle resizing and releases it on unmount', async () => {
    const observe = vi.fn()
    const disconnect = vi.fn()
    let resize = () => {}
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          resize = callback
        }

        observe = observe
        disconnect = disconnect
      }
    )
    const wrapper = mount(SmProgress, { props: { type: 'circle', percent: 80 } })
    Object.defineProperties(wrapper.element, {
      offsetWidth: { value: 240 },
      offsetHeight: { value: 96 }
    })

    expect(observe).toHaveBeenCalledWith(wrapper.element)
    resize()
    await wrapper.vm.$nextTick()
    const circle = wrapper.find('.sm-component-progress-inner').element as HTMLElement
    expect(circle.style.width).toBe('96px')
    expect(circle.style.height).toBe('96px')
    await wrapper.setProps({ size: 72 })
    expect(circle.style.width).toBe('72px')
    wrapper.unmount()
    expect(disconnect).toHaveBeenCalledOnce()
  })

  it('loads the configured URL', () => {
    const getData = vi.spyOn(RestService.prototype, 'getData').mockImplementation(() => undefined)
    const wrapper = mount(SmProgress, { props: { url: '/data.geojson' } })

    expect(getData).toHaveBeenCalledWith('/data.geojson')

    wrapper.unmount()
    getData.mockRestore()
  })
})
