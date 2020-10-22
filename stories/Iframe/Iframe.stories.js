import { withKnobs, text } from '@storybook/addon-knobs';
import SmIframe from '../../src/common/iframe/Iframe.vue';
import '../../src/common/iframe/style/iframe.scss';

export default { title: 'iframe', decorators: [withKnobs] };

export const Iframe = () => ({
  components: { SmIframe },
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