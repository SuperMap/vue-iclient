import { withKnobs, select, object } from '@storybook/addon-knobs';
import { toI18n } from '../../.storybook/lang';

export default { title: 'Basic/border', decorators: [withKnobs] };

export const BasicBorder = () => ({
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
  name: toI18n('basicComponent.basic')
};

export const CustomBorder = () => ({
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
  name: toI18n('basicComponent.custom')
};
