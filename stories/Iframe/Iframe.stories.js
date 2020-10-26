import { withKnobs, text } from '@storybook/addon-knobs';

export default { title: 'iframe', decorators: [withKnobs] };

export const Iframe = () => ({
  props: {
    src: {
      default: text('src', 'https://www.baidu.com/')
    }
  },
  template: `<sm-iframe style="width:100%; height:600px" v-bind="$props"></sm-iframe>`
});
Iframe.story = {
  name: 'iframe'
};
