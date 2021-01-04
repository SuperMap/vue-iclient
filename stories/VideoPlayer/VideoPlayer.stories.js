import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/video-player' };

export const BasicVideoPlayer = () => ({
  mixins: [theme],
  template: `
  <sm-video-player 
  style="width:600px; height:400px" 
  url="https://www.runoob.com/try/demo_source/mov_bbb.mp4"
  >
  </sm-video-player>
  `
});
BasicVideoPlayer.story = {
  name: toI18n('basicComponent.basic')
};

export const ControlVideoPlayer = () => ({
  data() {
    return {
      options: {
        controlBar: false
      }
    };
  },
  template: `
  <sm-video-player 
  style="width:600px; height:400px" 
  url="https://www.runoob.com/try/demo_source/mov_bbb.mp4"
  :options="options"
  >
  </sm-video-player>
  `
});
ControlVideoPlayer.story = {
  name: toI18n('basicComponent.videoPlayer.controlBar')
};
