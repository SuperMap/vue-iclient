import SmBorder from '../../src/common/border/Border.vue';
import '../../src/common/border/style/border.scss';
import { withKnobs, select, object } from '@storybook/addon-knobs';

export default { title: 'border', decorators: [withKnobs] };

export const BasicBorder = () => ({
  components: { SmBorder },
  props: {
    type: {
      default: select(
        'type',
        [
          'border1',
          'border2',
          'border3',
          'border4',
          'border5',
          'border6',
          'border7',
          'border8',
          'border9',
          'border10',
          'border11',
          'border12',
          'border13'
        ],
        'border1'
      )
    }
  },
  template: `<sm-border style="width:600px; height:400px" v-bind="$props"></sm-border>`
});

BasicBorder.story = {
  name: '边框'
};

export const CustomBorder = () => ({
  components: { SmBorder },
  props: {
    customBorder: {
      default: object('customBorder', {
        src: 'https://raw.githubusercontent.com/SuperMap/vue-iclient/master/src/common/border/assets/image/border1.png',
        borderWidth: [12, 12, 12, 12],
        borderEdge: { top: 12, left: 12, right: 12, bottom: 12 }
      })
    }
  },
  template: `<sm-border style="width:600px; height:400px" v-bind="$props"></sm-border>`
});

CustomBorder.story = {
  name: '自定义边框'
};
