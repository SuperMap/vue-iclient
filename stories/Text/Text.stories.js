import { withKnobs, text, select, object } from '@storybook/addon-knobs';

export default { title: 'BasicComponent/text', decorators: [withKnobs] };

export const BasicText = () => ({
  props: {
    title: {
      default: text('title', '我是文本')
    }
  },
  template: '<sm-text v-bind="$props"></sm-text>'
});
BasicText.story = {
  name: '文本'
};
export const SmallText = () => ({
  props: {
    fontStyle: {
      default: object('fontStyle', { fontSize: '14px', fontFamily: '微软雅黑' })
    },
    title: {
      default: text('title', '我是文本')
    }
  },
  data() {
    return {
      middleStyle: { fontSize: '18px', fontFamily: '微软雅黑' },
      largeStyle: { fontSize: '24px', fontFamily: '微软雅黑' }
    };
  },
  template:
    '<div style="width: 300px; height:200px; display: flex; flex-direction:column; justify-content:space-between;"><sm-text v-bind="$props"></sm-text><sm-text v-bind="$props" :fontStyle="middleStyle"></sm-text><sm-text v-bind="$props" :fontStyle="largeStyle"></sm-text></div>'
});
SmallText.story = {
  name: '不同大小的文体'
};

export const LinkText = () => ({
  props: {
    title: {
      default: text('title', '链接')
    },
    href: {
      default: text('href', 'http://www.baidu.com')
    },
    target: {
      default: select('target', ['_self', '_blank', '_parent', '_top', 'framename'], '_self')
    }
  },
  template: '<sm-text v-bind="$props"></sm-text>'
});
LinkText.story = {
  name: '带链接的文本'
};
