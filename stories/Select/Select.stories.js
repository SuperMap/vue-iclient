import { withKnobs, number, boolean, select } from '@storybook/addon-knobs';

export default { title: 'select', decorators: [withKnobs] };

export const BasicSelect = () => ({
  props: {
    option: {
      default: number('option', 10)
    }
  },
  template: `<div style="width:300px;height:300px"><sm-select default-value="a1" style="width:120px;" v-bind="$props"><sm-select-option v-for="i in option" :key="i">{{(i + 9).toString(36) + i}}</sm-select-option></sm-select></div>`
});
BasicSelect.story = {
  name: '选择器'
};

export const MultiSelect = () => ({
  props: {
    option: {
      default: number('option', 10)
    },
    mode: {
      default: select('mode', ['default', 'multiple'], 'multiple')
    }
  },
  template: `<div style="width:300px;height:300px"><sm-select :default-value="['a1', 'b2']" style="width:200px;" v-bind="$props"><sm-select-option v-for="i in option" :key="i">{{(i + 9).toString(36) + i}}</sm-select-option></sm-select></div>`
});
MultiSelect.story = {
  name: '多选选择器'
};

export const DisabledSelect = () => ({
  props: {
    option: {
      default: number('option', 10)
    },
    disabled: {
      default: boolean('disabled', true)
    }
  },
  template: `<div style="width:300px;height:300px"><sm-select default-value="a1" style="width:120px;" v-bind="$props"><sm-select-option v-for="i in option" :key="i">{{(i + 9).toString(36) + i}}</sm-select-option></sm-select></div>`
});
DisabledSelect.story = {
  name: '禁用的选择器'
};
