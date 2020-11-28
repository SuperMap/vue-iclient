import { withKnobs } from '@storybook/addon-knobs';
import { toI18n } from '../../.storybook/lang';

export default { title: 'Basic Components/video-player', decorators: [withKnobs] };

export const BasicVideoPlayer = () => ({
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
        muted: true,
        loop: false,
        autoPlay: false,
        controlBar: true,
        popupToplay: false
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
