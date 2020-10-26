import { withKnobs, select, text, boolean } from '@storybook/addon-knobs';

export default { title: 'button', decorators: [withKnobs] };

export const BasicButton = () => ({
  props: {
    text: {
      default: text('text', '按钮')
    },
    type: {
      default: select('type', ['primary', 'default', 'danger', 'dashed', 'link'], 'primary')
    }
  },
  template: `<sm-button style="width:100px;height:26px" v-bind="$props">{{text}}</sm-button>`
});
BasicButton.story = {
  name: '按钮'
};

export const DisableButton = () => ({
  props: {
    text: {
      default: text('text', '禁用按钮')
    },
    disabled: {
      default: boolean('disabled', true)
    }
  },
  template: `<sm-button style="width:100px;height:26px" v-bind="$props">{{text}}</sm-button>`
});
DisableButton.story = {
  name: '禁用按钮'
};

export const IconButton = () => ({
  props: {
    icon: {
      default: text('icon', 'search')
    }
  },
  template: `<sm-button icon="search" v-bind="$props"></sm-button>`
});
IconButton.story = {
  name: '图标按钮'
};
