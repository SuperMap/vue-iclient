import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Chart Components/progress' };

export const BasicProgress = () => ({
  mixins: [theme],
  template: `
  <sm-progress 
  style="width:600px; height:60px; background: rgba(0, 0, 0, 0);" 
  percent="50">
  </sm-progress>
  `
});
BasicProgress.story = {
  name: toI18n('basicComponent.basic')
};

export const ColorProgress = () => ({
  template: `
  <sm-progress 
  style="width:400px; height:40px; background: rgba(0, 0, 0, 0);"
  strokeColor="red"
  trailColor="yellow"
  percent="50">
  </sm-progress>
  `
});
ColorProgress.story = {
  name: toI18n('chartComponent.progress.color')
};

export const ShowInfoProgress = () => ({
  template: `
  <sm-progress 
  style="width:400px; height:40px; background: rgba(0, 0, 0, 0);" 
  :showInfo="true" 
  percent="80">
  </sm-progress>
  `
});
ShowInfoProgress.story = {
  name: toI18n('chartComponent.progress.number')
};

export const StausProgress = () => ({
  template: `
  <sm-progress 
  style="width:400px; height:40px; background: rgba(0, 0, 0, 0);" 
  status="success" 
  percent="50">
  </sm-progress>
  `
});
StausProgress.story = {
  name: toI18n('chartComponent.progress.state')
};

export const CircleProgress = () => ({
  template: `
  <sm-progress 
  style="width:400px; height:400px; background: rgba(0, 0, 0, 0);" 
  type="circle"
  percent="50">
  </sm-progress>
  `
});
CircleProgress.story = {
  name: toI18n('chartComponent.progress.type')
};

export const BigProgress = () => ({
  template: `
  <sm-progress 
  style="width:400px; height:400px; background: rgba(0, 0, 0, 0);" 
  type="circle"
  strokeWidth="24" 
  percent="50">
  </sm-progress>
  `
});
BigProgress.story = {
  name: toI18n('chartComponent.progress.width')
};
