import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('basicComponent.title')}/${toI18n('basicComponent.videoPlus.title')}`,
  id: 'BasicComponents/video-plus'
};

export const BasicVideoPlus = () => ({
  mixins: [theme],
  template: `
  <sm-video-plus
    style="width:1000px;height:600px"
    videoWidth="1920"
    videoHeight="1080"
    :autoplay="true"
    :loop="true"
    target="video4"
    url="https://iclient.supermap.io/web/data/video/video2.mp4"
    >
  </sm-video-plus>
  `
});
BasicVideoPlus.story = {
  name: toI18n('basicComponent.basic')
};
