import { withKnobs, text, boolean } from '@storybook/addon-knobs';

export default { title: 'checkbox', decorators: [withKnobs] };

export const BasicCheckbox = () => ({
  props: {
    text: {
      default: text('text', '多选框')
    }
  },
  template: `<sm-checkbox style="color:#fff" v-bind="$props">{{text}}</sm-checkbox>`
});
BasicCheckbox.story = {
  name: '多选框'
};

export const DisabledCheckbox = () => ({
  props: {
    text: {
      default: text('text', '不可用多选框')
    },
    disabled: {
      default: boolean('disabled', true)
    }
  },
  template: `<div style="width:160px;height:60px;color:#fff"><sm-checkbox v-bind="$props">{{text}}</sm-checkbox><br /><sm-checkbox default-checked style="color:#fff" v-bind="$props">{{text}}</sm-checkbox></div>`
});
DisabledCheckbox.story = {
  name: '不可用多选框'
};

