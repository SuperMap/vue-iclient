import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import type { CSSProperties, StyleValue, VNode } from 'vue'
import { defineComponent, h, isVNode, nextTick, reactive } from 'vue'
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

function mockProgressResizeObserver() {
  const observe = vi.fn()
  const disconnect = vi.fn()
  let notify: (entries: ResizeObserverEntry[]) => void = () => {}
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: (entries: ResizeObserverEntry[]) => void) {
      notify = callback
    }

    observe = observe
    disconnect = disconnect
  })
  return {
    observe,
    disconnect,
    resize: (target: Element, width: number, height: number) => {
      notify([{ target, contentRect: new DOMRect(0, 0, width, height) } as ResizeObserverEntry])
    }
  }
}

describe('Progress', () => {
  afterEach(() => {
    vi.restoreAllMocks()
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

  it.each([20, 120])('uses the native circle stroke width when set to zero at size %s', async size => {
    const wrapper = mount(SmProgress, { props: { type: 'circle', size, percent: 80, strokeWidth: 0 } })
    const reference = mount(SmProgress, { props: { type: 'circle', size, percent: 80 } })
    const getStrokeWidth = (control: VueWrapper) =>
      Number(control.find('.sm-component-progress-circle-path').attributes('stroke-width'))
    try {
      expect(getStrokeWidth(wrapper)).toBe(getStrokeWidth(reference))
      expect(getStrokeWidth(wrapper)).toBeGreaterThan(0)
      await wrapper.setProps({ strokeWidth: 12 })
      expect(getStrokeWidth(wrapper)).toBe(12)
      await wrapper.setProps({ strokeWidth: 0 })
      expect(getStrokeWidth(wrapper)).toBe(getStrokeWidth(reference))
    } finally {
      wrapper.unmount()
      reference.unmount()
    }
  })

  it.each(['line', 'circle'] as const)('preserves status and native state colors for %s', async type => {
    const wrapper = mount(SmProgress, { props: { type, percent: 20, status: 'active' } })
    try {
      await wrapper.setProps({ status: 'normal' })
      await wrapper.setProps({ strokeWidth: 12, style: { width: '280px' } })
      expect(wrapper.classes()).toContain('sm-component-progress-status-normal')
      for (const status of ['success', 'exception'] as const) {
        await wrapper.setProps({ status })
        expect(wrapper.classes()).toContain(`sm-component-progress-status-${status}`)
        if (type === 'line') {
          expect(getLineBackgroundStyle(wrapper).backgroundColor).toBeUndefined()
        } else {
          expect((wrapper.find('.sm-component-progress-circle-path').element as SVGElement).style.stroke).toBe('')
        }
        await wrapper.setProps({ strokeColor: '#112233' })
        if (type === 'line') {
          expect(getLineBackgroundStyle(wrapper).backgroundColor).toBe('#112233')
        } else {
          expect((wrapper.find('.sm-component-progress-circle-path').element as SVGElement).style.stroke).toBe('#112233')
        }
        await wrapper.setProps({ strokeColor: undefined })
      }
    } finally {
      wrapper.unmount()
    }
  })

  it('updates the host font size override and restores automatic circle typography when removed', async () => {
    const state = reactive({ style: { fontSize: '2px', textAlign: 'left' } as StyleValue })
    const wrapper = mount(defineComponent({ setup: () => () => h(SmProgress, { type: 'circle', ...state }) }))
    const root = wrapper.find('.sm-component-progress').element as HTMLElement
    try {
      expect(root.style.getPropertyValue('--sm-progress-font-size')).toBe('2px')
      state.style = [{ fontSize: 40 }, { textAlign: 'right' }]
      await nextTick()
      expect(root.style.getPropertyValue('--sm-progress-font-size')).toBe('40px')
      expect(root.style.textAlign).toBe('right')
      state.style = 'font-size: 18px; text-align: center'
      await nextTick()
      expect(root.style.getPropertyValue('--sm-progress-font-size')).toBe('18px')
      state.style = {}
      await nextTick()
      expect(root.style.getPropertyValue('--sm-progress-font-size')).toBe('')
      expect((wrapper.find('.sm-component-progress-inner').element as HTMLElement).style.fontSize).not.toBe('')
    } finally {
      wrapper.unmount()
    }
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
    const { observe, disconnect, resize } = mockProgressResizeObserver()
    const wrapper = mount(SmProgress, { props: { type: 'circle', percent: 80 } })

    expect(observe).toHaveBeenCalledWith(wrapper.element)
    resize(wrapper.element, 240, 96)
    await wrapper.vm.$nextTick()
    const circle = wrapper.find('.sm-component-progress-inner').element as HTMLElement
    expect(circle.style.width).toBe('96px')
    expect(circle.style.height).toBe('96px')
    await wrapper.setProps({ size: 72 })
    expect(circle.style.width).toBe('72px')
    resize(wrapper.element, 40, 50)
    await nextTick()
    expect(circle.style.width).toBe('72px')
    wrapper.unmount()
    expect(disconnect).toHaveBeenCalledOnce()
  })

  it.each([
    { name: 'padding', padding: '30px', border: '0', width: 225, height: 225, expected: 165 },
    { name: 'padding and border', padding: '30px', border: '5px solid', width: 215, height: 215, expected: 155 },
    { name: 'asymmetric padding', padding: '10px 20px 30px 40px', border: '0', width: 240, height: 180, expected: 140 },
    { name: 'fractional padding', padding: '10.5px 20.25px', border: '0', width: 200, height: 120, expected: 99 },
    { name: 'no drawable space', padding: '120px', border: '0', width: 240, height: 240, expected: 0 }
  ])('subtracts $name when initially measuring the circle without ResizeObserver', async ({ padding, border, width, height, expected }) => {
    vi.stubGlobal('ResizeObserver', undefined)
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(height)
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue(
      [new DOMRect(0, 0, width, height)] as unknown as DOMRectList
    )
    const wrapper = mount(SmProgress, {
      props: { type: 'circle', percent: 80 },
      attrs: { style: { padding, border, boxSizing: 'border-box' } }
    })
    try {
      await nextTick()
      const circle = wrapper.find('.sm-component-progress-inner').element as HTMLElement
      expect(circle.style.width).toBe(`${expected}px`)
      expect(circle.style.height).toBe(`${expected}px`)
      expect(wrapper.find('svg').html()).not.toMatch(/NaN|Infinity/)
    } finally {
      wrapper.unmount()
    }
  })

  it.each([undefined, 0, 12])('uses content-box resize notifications after padding changes, including zero sizes, strokeWidth=%s', async strokeWidth => {
    const { resize } = mockProgressResizeObserver()
    const wrapper = mount(SmProgress, {
      props: { type: 'circle', percent: 80, strokeWidth },
      attrs: { style: { width: '225px', height: '225px', padding: '30px' } }
    })
    try {
      const circle = wrapper.find('.sm-component-progress-inner').element as HTMLElement
      vi.spyOn(wrapper.element, 'getClientRects').mockReturnValue([new DOMRect()] as unknown as DOMRectList)
      resize(wrapper.element, 165, 165)
      await nextTick()
      expect(circle.style.width).toBe('165px')
      await wrapper.setProps({ style: { width: '225px', height: '225px', padding: '40px' } })
      resize(wrapper.element, 143.5, 105.25)
      await nextTick()
      expect(circle.style.width).toBe('105.25px')
      resize(wrapper.element, 0, 0)
      await nextTick()
      expect(circle.style.width).toBe('0px')
      expect(wrapper.find('svg').html()).not.toMatch(/NaN|Infinity/)
      resize(wrapper.element, 180, 140)
      await nextTick()
      expect(circle.style.width).toBe('140px')
    } finally {
      wrapper.unmount()
    }
  })

  it('keeps the last diameter while hidden and resumes sizing after becoming visible', async () => {
    const { resize } = mockProgressResizeObserver()
    const wrapper = mount(SmProgress, { props: { type: 'circle', percent: 80 } })
    try {
      const circle = wrapper.find('.sm-component-progress-inner').element as HTMLElement
      resize(wrapper.element, 165, 165)
      await nextTick()
      await wrapper.setProps({ style: { display: 'none' } })
      resize(wrapper.element, 0, 0)
      await nextTick()
      expect(circle.style.width).toBe('165px')
      await wrapper.setProps({ style: { display: 'block' } })
      resize(wrapper.element, 200, 130)
      await nextTick()
      expect(circle.style.width).toBe('130px')
    } finally {
      wrapper.unmount()
    }
  })

  it('loads the configured URL', () => {
    const getData = vi.spyOn(RestService.prototype, 'getData').mockImplementation(() => undefined)
    const wrapper = mount(SmProgress, { props: { url: '/data.geojson' } })

    expect(getData).toHaveBeenCalledWith('/data.geojson')

    wrapper.unmount()
    getData.mockRestore()
  })
})
