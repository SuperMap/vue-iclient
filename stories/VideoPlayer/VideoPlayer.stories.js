import { withKnobs, text, object } from '@storybook/addon-knobs';
import SmVideoPlayer from '../../src/common/video-player/VideoPlayer.vue';
import '../../src/common/video-player/style/video-player.scss';

export default { title: 'video-player', decorators: [withKnobs] };

export const BasicVideoPlayer = () => ({
  components: { SmVideoPlayer },
  props: {
    url: {
      default: text('url', 'https://www.runoob.com/try/demo_source/mov_bbb.mp4')
    }
  },
  template: `<sm-video-player style="width:600px; height:400px" v-bind="$props"></sm-video-player>`
});
BasicVideoPlayer.story = {
  name: '视频'
};

export const ControlVideoPlayer = () => ({
  components: { SmVideoPlayer },
  props: {
    url: {
      default: text('url', 'https://www.runoob.com/try/demo_source/mov_bbb.mp4')
    },
    options: {
      default: object('options', {
        muted: true,
        loop: false,
        autoPlay: false,
        controlBar: true,
        popupToplay: false
      })
    }
  },
  template: `<sm-video-player style="width:600px; height:400px" v-bind="$props"></sm-video-player>`
});
ControlVideoPlayer.story = {
  name: '视频控制条'
};
