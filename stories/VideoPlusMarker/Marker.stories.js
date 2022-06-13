import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('basicComponent.title')}/${toI18n('basicComponent.videoPlusMarker.title')}`,
  id: 'BasicComponents/video-plus'
};

export const BasicVideoMarker = () => ({
  mixins: [theme],
  template: `
  <sm-video-plus
    style="width:1000px;height:600px"
    target="video2"
    videoWidth="1920"
    videoHeight="1080"
    url="https://iclient.supermap.io/web/data/video/video2.mp4"
    >
      <sm-video-plus-marker :coordinate="[600, 500]">
      </sm-video-plus-marker>
  </sm-video-plus>
  `
});
BasicVideoMarker.story = {
  name: toI18n('basicComponent.basic')
};
