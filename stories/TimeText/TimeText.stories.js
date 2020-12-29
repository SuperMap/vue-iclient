import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/time-text' };

export const BasicTimeText = () => ({
  mixins: [theme],
  template: `
  <SmTimeText  timeType="date+second+week"></SmTimeText>
  `
});
BasicTimeText.story = {
  name: toI18n('basicComponent.basic')
};

export const SmallTimeText = () => ({
  data() {
    return {
      fontStyle: { fontSize: '14px', fontFamily: '微软雅黑' },
      middleStyle: { fontSize: '18px', fontFamily: '微软雅黑' },
      largeStyle: { fontSize: '24px', fontFamily: '微软雅黑' }
    };
  },
  template: `
  <div style="width: 300px; height:200px; display: flex; flex-direction:column; justify-content: space-between">
    <sm-time-text :fontStyle="fontStyle"></sm-time-text>
    <sm-time-text :fontStyle="middleStyle"></sm-time-text>
    <sm-time-text :fontStyle="largeStyle"></sm-time-text>
  </div>`
});
SmallTimeText.story = {
  name: toI18n('basicComponent.timeText.size')
};
