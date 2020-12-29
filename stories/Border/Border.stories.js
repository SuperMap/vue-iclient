import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/border' };

export const BasicBorder = () => ({
  mixins: [theme],
  template: `
  <sm-border style="width:600px; height:400px" type="border1"></sm-border>
  `
});

BasicBorder.story = {
  name: toI18n('basicComponent.basic')
};

export const CustomBorder = () => ({
  data() {
    return {
      custom: {
        src: 'https://raw.githubusercontent.com/SuperMap/vue-iclient/master/src/common/border/assets/image/border5.png',
        borderWidth: [12, 12, 12, 12],
        borderEdge: {
          top: 12,
          left: 12,
          right: 12,
          bottom: 12
        }
      }
    };
  },
  template: `
  <sm-border style="width:600px; height:400px" :customBorder="custom"></sm-border>
  `
});

CustomBorder.story = {
  name: toI18n('basicComponent.custom')
};
