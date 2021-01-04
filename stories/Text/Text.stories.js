import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/text' };

export const BasicText = () => ({
  mixins: [theme],
  template: `
  <sm-text title="我是文本"></sm-text>
  `
});
BasicText.story = {
  name: toI18n('basicComponent.basic')
};

export const SmallText = () => ({
  data() {
    return {
      title: '我是文本',
      fontStyle: { fontSize: '14px', fontFamily: '微软雅黑' },
      middleStyle: { fontSize: '18px', fontFamily: '微软雅黑' },
      largeStyle: { fontSize: '24px', fontFamily: '微软雅黑' }
    };
  },
  template: `
  <div style="width: 300px; height:200px; display: flex; flex-direction:column; justify-content:space-between;">
    <sm-text :title="title" :fontStyle="fontStyle"></sm-text>
    <sm-text :title="title" :fontStyle="middleStyle"></sm-text>
    <sm-text :title="title" :fontStyle="largeStyle"></sm-text>
  </div>
  `
});
SmallText.story = {
  name: toI18n('basicComponent.text.size')
};

export const LinkText = () => ({
  template: `
  <sm-text title="链接" href="http://www.baidu.com" target="_blank"></sm-text>
  `
});
LinkText.story = {
  name: toI18n('basicComponent.text.link')
};
