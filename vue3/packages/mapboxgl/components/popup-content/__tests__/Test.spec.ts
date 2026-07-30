import { defineComponent, ref, shallowRef } from 'vue'
import { mount } from '@vue/test-utils'
import PopupContent from '../popup-content.vue'
import PopupUtil from '../util/PopupUtil'
import { createBuiltInPopupContentRenderers } from '../built-in-renderers'
import {
  popupContentRuntimeRegistryKey,
  resolvePopupContent,
  type PopupContentRuntimeRegistry
} from '../runtime-registry'

const CustomChart = defineComponent({
  props: {
    options: Object,
    featureName: String
  },
  template: '<div class="custom-chart">{{ options.chartType }}:{{ featureName }}</div>'
})

describe('PopupContent runtime renderer', () => {
  it('keeps shared popup utilities independent from content types', () => {
    expect(Object.keys(PopupUtil)).toEqual(['getResult'])
    expect(PopupUtil.getResult(['get', 'name'], { name: 'Tower' })).toBe('Tower')
  })

  it('renders built-in content through the same renderer pipeline', () => {
    const wrapper = mount(PopupContent, {
      props: {
        data: [{ title: 'name', value: 'Tower' }],
        popupInfo: {
          elements: [
            { type: 'FIELD', fieldName: 'name', contentType: 'text' },
            { type: 'DIVIDER' }
          ]
        }
      }
    })

    expect(wrapper.find('.sm-component-field-info-text').text()).toBe('Tower')
    expect(wrapper.find('.ant-divider').exists()).toBe(true)
  })

  it('resolves text expressions in the text renderer', () => {
    const renderer = createBuiltInPopupContentRenderers(ref({}))
      .find(item => item.type === 'TEXT')!
    const result = renderer.parse!([{
      type: 'TEXT',
      infos: [{
        insert: ['get', 'name'],
        attributes: { link: ['get', 'url'] }
      }]
    }], 0, {
      attributes: { name: 'Tower', url: 'https://example.com' },
      popupInfo: {}
    })

    expect(result).toEqual({
      element: {
        type: 'TEXT',
        infos: [{
          insert: 'Tower',
          attributes: { link: 'https://example.com' }
        }]
      },
      nextIndex: 1
    })
  })

  it('groups consecutive images and videos in the media renderer', () => {
    const renderer = createBuiltInPopupContentRenderers(ref({}))
      .find(item => item.type === 'MEDIA')!
    const result = renderer.parse!([
      { type: 'IMAGE', title: ['get', 'imageTitle'], value: ['get', 'imageUrl'] },
      { type: 'VIDEO', title: 'Video', value: ['get', 'videoUrl'] },
      { type: 'DIVIDER' }
    ], 0, {
      attributes: {
        imageTitle: 'Image',
        imageUrl: 'image.png',
        videoUrl: 'video.mp4'
      },
      popupInfo: {}
    })

    expect(result).toEqual({
      element: {
        type: 'MEDIA',
        infos: [
          { type: 'IMAGE', title: 'Image', value: 'image.png' },
          { type: 'VIDEO', title: 'Video', value: 'video.mp4' }
        ]
      },
      nextIndex: 2
    })
  })
  it('keeps extension elements serializable and renders the registered scene component', () => {
    const registry: PopupContentRuntimeRegistry = {
      renderers: shallowRef([{
        type: 'CUSTOM_CHART',
        hosts: ['scene'],
        component: CustomChart,
        resolveProps: context => ({
          options: context.element.extension,
          featureName: context.attributes.name
        })
      }])
    }
    const popupInfo = {
      layerId: 'Building@CBD',
      elements: [
        { type: 'CUSTOM_CHART', extension: { chartType: 'bar' } },
        { type: 'DIVIDER' }
      ]
    }
    expect(JSON.stringify(popupInfo)).not.toContain('component')

    const wrapper = mount(PopupContent, {
      props: {
        data: [{ title: 'name', value: 'Tower' }],
        popupInfo,
        context: { mode: 'scene' }
      },
      global: {
        provide: {
          [popupContentRuntimeRegistryKey as symbol]: registry
        }
      }
    })

    expect(wrapper.find('.custom-chart').text()).toBe('bar:Tower')
  })

  it('does not render a renderer outside its declared host', () => {
    const registry: PopupContentRuntimeRegistry = {
      renderers: shallowRef([{
        type: 'CUSTOM_CHART',
        hosts: ['scene'],
        component: CustomChart
      }])
    }
    const wrapper = mount(PopupContent, {
      props: {
        popupInfo: { elements: [{ type: 'CUSTOM_CHART', extension: {} }] },
        context: { mode: 'map' }
      },
      global: {
        provide: {
          [popupContentRuntimeRegistryKey as symbol]: registry
        }
      }
    })

    expect(wrapper.find('.custom-chart').exists()).toBe(false)
  })

  it('lets the registered renderer parse extension payloads without protocol components', () => {
    const extension = { type: 'CUSTOM_CHART', extension: { series: [1, 2, 3] } }
    const content = resolvePopupContent([extension], [{
      type: 'CUSTOM_CHART',
      component: CustomChart
    }], { attributes: {}, popupInfo: {} })

    expect(content).toEqual([{
      type: 'CUSTOM_CHART',
      infos: extension
    }])
  })
})
