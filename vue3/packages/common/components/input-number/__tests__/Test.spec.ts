import { mount } from '@vue/test-utils'
import { SmInputNumber } from '../InputNumber'

describe('InputNumber', () => {
  it('uses the common component class and fills its container', () => {
    const wrapper = mount(SmInputNumber, { props: { value: 10 } })

    expect(wrapper.classes()).toContain('sm-component-input-number')
  })
})
