import '@supermapgis/common/theme-chalk/collapse-card.scss'
import { defineComponent, h } from 'vue'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import SmInput from '@supermapgis/common/components/input/Input'
import SmSelect, { SmSelectOption } from '@supermapgis/common/components/select/Select'

enableAutoUnmount(afterEach)

const ControlWithFields = defineComponent({
  setup() {
    return () =>
      h(
        SmCollapseCard,
        {
          iconClass: 'test-icon',
          headerName: 'Control',
          style: { backgroundColor: 'red' }
        },
        {
          default: () => [
            h(SmInput, { value: 'search' }),
            h(
              SmSelect,
              { value: 'one' },
              { default: () => h(SmSelectOption, { value: 'one' }, () => 'One') }
            )
          ]
        }
      )
  }
})

describe('control field backgrounds', () => {
  it('lets select and input fields show the configured collapse-card background', () => {
    const wrapper = mount(ControlWithFields, { attachTo: document.body })
    const content = wrapper.get<HTMLElement>('.sm-component-collapse-card__content')
    const input = wrapper.get<HTMLElement>('.sm-component-input')
    const selectSelector = wrapper.get<HTMLElement>('.sm-component-select-selector')

    console.log({
      inputRules: Array.from(document.styleSheets).flatMap(sheet =>
        Array.from(sheet.cssRules)
          .filter(rule => rule.selectorText?.includes('sm-component-input'))
          .map(rule => [
            rule.selectorText,
            rule.style?.background,
            rule.style?.backgroundColor,
            rule.style?.getPropertyPriority('background-color')
          ])
      ),
      selectorMatches: input.element.matches(
        '.sm-component-collapse-card .sm-component-collapse-card__content .sm-component-input'
      ),
      computedInput: getComputedStyle(input.element).backgroundColor
    })
    expect(content.element.style.backgroundColor).toBe('red')
    expect(getComputedStyle(input.element).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(selectSelector.element).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })
})
