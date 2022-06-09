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
    url="http://172.16.14.166:8081/Data/ARMap/DeQing/20180926%E5%BE%B7%E6%B8%85%E8%B6%85%E5%9B%BE%E5%A4%A7%E5%8E%A6/OV20180926%E6%B5%99%E6%B1%9F%E5%BE%B7%E6%B8%85%E8%B6%85%E5%9B%BE%E5%A4%A7%E5%8E%A601%20.mp4"
    >
      <sm-video-plus-marker target="video2" :coordinate="[600, 500]">
      </sm-video-plus-marker>
  </sm-video-plus>
  `
});
BasicVideoMarker.story = {
  name: toI18n('basicComponent.basic')
};
