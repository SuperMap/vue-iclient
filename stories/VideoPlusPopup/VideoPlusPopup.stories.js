import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('basicComponent.title')}/${toI18n('basicComponent.videoPlusPopup.title')}`,
  id: 'BasicComponents/video-plus'
};

export const BasicVideoPopup = () => ({
  mixins: [theme],
  data() {
    return {
      coordinate: [500, 400]
    };
  },
  template: `
  <sm-video-plus
    style="width:1000px;height:600px"
    target="video3"
    videoWidth="1920"
    videoHeight="1080"
    url="https://iclient.supermap.io/web/data/video/video2.mp4"
    >
      <sm-video-plus-popup :closeOnClick="false" :coordinate="coordinate"><h3 style="color:red">hello,world!</h3></sm-video-plus-popup>
  </sm-video-plus>
  `
});
// 不传target 也应该可以
BasicVideoPopup.story = {
  name: toI18n('basicComponent.basic')
};
