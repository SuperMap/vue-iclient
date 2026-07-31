import { defineComponent, h, shallowRef } from 'vue'
import { mount } from '@vue/test-utils'
import PopupContent from '../popup-content.vue'
import { popupContentRuntimeRegistryKey } from '../runtime-registry'

describe('PopupContent runtime renderer', () => {
  it('renders by content type without exposing map or scene context', () => {
    const resolveProps = vi.fn(context => ({ value: context.attributes.NAME }))
    const renderer = defineComponent({
      props: { value: String },
      setup(props) {
        return () => h('div', { class: 'custom-popup-content' }, props.value)
      }
    })
    const wrapper = mount(PopupContent, {
      props: {
        data: [{ title: 'NAME', value: '建筑物' }],
        popupInfo: {
          elements: [{ type: 'CUSTOM_CONTENT', extension: {} }]
        }
      },
      global: {
        provide: {
          [popupContentRuntimeRegistryKey as symbol]: {
            renderers: shallowRef([{
              type: 'CUSTOM_CONTENT',
              component: renderer,
              resolveProps
            }])
          }
        }
      }
    })

    expect(wrapper.find('.custom-popup-content').text()).toBe('建筑物')
    expect(resolveProps).toHaveBeenCalledOnce()
    expect(resolveProps.mock.calls[0][0]).not.toHaveProperty('host')
    expect(resolveProps.mock.calls[0][0]).not.toHaveProperty('target')
  })
})
