import { withKnobs, text, object } from '@storybook/addon-knobs';

export default { title: 'Basic/video-player', decorators: [withKnobs] };

export const BasicVideoPlayer = () => ({
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
