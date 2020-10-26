import { withKnobs, text, boolean, select } from '@storybook/addon-knobs';

export default { title: 'input', decorators: [withKnobs] };

export const BasicInput = () => ({
  props: {
    placeholder: {
      default: text('placeholder', '输入框')
    }
  },
  template: `<sm-input style="width:160px;" v-bind="$props"></sm-input>`
});
BasicInput.story = {
  name: '输入框'
};

export const PasswordInput = () => ({
  props: {
    placeholder: {
      default: text('placeholder', '密码输入框')
    }
  },
  template: `<sm-input-password style="width:160px;" v-bind="$props"></sm-input-password>`
});
PasswordInput.story = {
  name: '密码输入框'
};

export const SizeInput = () => ({
  props: {
    placeholder: {
      default: text('placeholder', '不同大小输入框')
    },
    size: {
      default: select('size', ['default', 'large', 'small'], 'default')
    }
  },
  template: `<sm-input style="width:200px;" v-bind="$props"></sm-input>`
});
SizeInput.story = {
  name: '不同大小输入框'
};

export const IconInput = () => ({
  props: {
    placeholder: {
      default: text('placeholder', '带前后缀的输入框')
    },
    prefix: {
      default: text('prefix', '￥')
    },
    suffix: {
      default: text('suffix', 'RMB')
    }
  },
  template: `<sm-input style="width:260px;" v-bind="$props"/>`
});
IconInput.story = {
  name: '带前后缀的输入框'
};

export const SearchInput = () => ({
  props: {
    placeholder: {
      default: text('placeholder', '带搜索按钮的输入框')
    }
  },
  template: `<sm-input-search style="width:260px;" enter-button v-bind="$props"/>`
});
SearchInput.story = {
  name: '带搜索按钮的输入框'
};

export const ClearInput = () => ({
  props: {
    defaultValue: {
      default: text('defaultValue', '带删除图标的输入框')
    },
    allowClear: {
      default: boolean('allowClear', true)
    }
  },
  template: `<sm-input style="width:260px;" v-bind="$props"/>`
});
ClearInput.story = {
  name: '带删除图标的输入框'
};
