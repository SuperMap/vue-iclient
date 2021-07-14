import {
  mount
} from '@vue/test-utils';
import SmCheckbox from '../Checkbox.vue';
import SmCheckboxGroup from '../Group.vue';
import SmButton from '../../button/Button.vue';
import { onCheckAllChange, onChange, toggleDisable } from 'vue-iclient/test/unit/mocks/baseComponentMock.js';

describe('Checkbox.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  })

  it('render default correctly', async () => {
    const div = global.document.createElement('div');
    global.document.body.appendChild(div);
    wrapper = mount({
      template: `
      <sm-checkbox>Checkbox</sm-checkbox>`,
      components: {
        SmCheckbox
      },
    },
    { attachTo: div }
  )
    expect(wrapper.find('.sm-component-checkbox-wrapper').exists()).toBe(true);
    const input = wrapper.find('input');
    expect(input.exists()).toBe(true);
    expect(input.find('.sm-component-checkbox-input').exists()).toBe(true);
    expect(input.attributes('type')).toBe('checkbox');
    const checkboxInput = wrapper.find('input[type="checkbox"]')
    await checkboxInput.setChecked();
    expect(checkboxInput.element.checked).toBeTruthy()
    global.document.body.removeChild(div);
  });

  it('Checke All', async () => {
    const div = global.document.createElement('div');
    global.document.body.appendChild(div);
    wrapper = mount({
      template: `
      <div>
        <div :style="{ borderBottom: '1px solid #E9E9E9' }">
          <sm-checkbox :indeterminate="indeterminate" :checked="checkAll" v-on:change="onCheckAllChange">
            Check all
          </sm-checkbox>
        </div>
        <br />
        <sm-checkbox-group v-model="checkedList" :options="plainOptions" v-on:change="onChange"/>
      </div>`,
      components: {
        SmCheckbox,
        SmCheckboxGroup
      },
      data() {
        return {
          checkedList: ['Apple', 'Orange'],
          indeterminate: true,
          checkAll: false,
          plainOptions: ['Apple', 'Pear', 'Orange']
        };
      },
      methods: {
        onCheckAllChange: onCheckAllChange,
        onChange: onChange
      },
    },
    { attachTo: div }
  )
    expect(wrapper.find('.sm-component-checkbox').exists()).toBe(true);
    expect(wrapper.vm.checkAll).toBe(false);
    expect(wrapper.vm.checkedList.length).toBe(2);
    expect(wrapper.vm.plainOptions.length).toBe(3);
    const checkbox = wrapper.findAll('input[type="checkbox"]')
    expect(checkbox.length).toBe(4);
    await checkbox.at(0).setChecked();
    // expect('[Function onCheckAllChange]').toBeCalled();
    expect(wrapper.vm.checkAll).toBe(true);
    expect(wrapper.vm.checkedList.length).toBe(3);
  });

  it('Checked-Enabled', async () => {
    const div = global.document.createElement('div');
    global.document.body.appendChild(div);
    const onChange = jest.fn();
    wrapper = mount({
      template: `
      <div>
        <p :style="{ marginBottom: '20px' }">
          <sm-checkbox :checked="checked" :disabled="disabled" v-on:change="onChange">
            {{ label }}
          </sm-checkbox>
        </p>
        <p>
          <sm-button :style="{ marginLeft: '10px' }" type="primary" size="small" v-on:click="toggleDisable">
            {{ !disabled ? 'Disable' : 'Enable' }}
          </sm-button>
        </p>
      </div>`,
      components: {
        SmCheckbox,
        SmButton
      },
      data() {
        return {
          checked: true,
          disabled: false,
          label: 'Checked-Enabled'
        };
      },
      methods: {
        toggleDisable: toggleDisable,
        onChange: onChange
      },
    },
    { attachTo: div }
  )
    expect(wrapper.vm.checked).toBe(true);
    expect(wrapper.vm.label).toBe('Checked-Enabled');
    expect(wrapper.vm.disabled).toBe(false);
    wrapper.find(SmButton).trigger('click');
    expect(wrapper.vm.label).toBe('Checked-Disabled');
    expect(wrapper.vm.disabled).toBe(true);
    await wrapper.find('input[type="checkbox"]').setChecked();
    expect(onChange).not.toBeCalled();
    expect(wrapper.vm.checked).toBe(true);
    global.document.body.removeChild(div);
  });
})