import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/image' };

export const BasicImage = () => ({
  mixins: [theme],
  template: `
  <sm-image 
  style="width:600px; height:400px" 
  src="https://iclient.supermap.io/img/whatsNewLandUse.png"></sm-image>
  `
});
BasicImage.story = {
  name: toI18n('basicComponent.basic')
};

export const RepeatImage = () => ({
  template: `
  <sm-image 
  style="width: 600px; height: 400px" 
  repeat="center"
  src="https://iclient.supermap.io/img/whatsNewLandUse.png">
  </sm-image>
  `
});
RepeatImage.story = {
  name: toI18n('basicComponent.image.repeat')
};

export const LinkImage = () => ({
  template: `
  <sm-image 
  style="width:600px; height:400px" 
  src="https://iclient.supermap.io/img/whatsNewLandUse.png"
  href="http://www.baidu.com"
  target="_blank"
  >
  </sm-image>
  `
});
LinkImage.story = {
  name: toI18n('basicComponent.image.link')
};
