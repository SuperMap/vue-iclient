import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('basicComponent.title')}/${toI18n('basicComponent.videoPlusDraw.title')}`,
  id: 'BasicComponents/video-plus'
};

export const BasicVideoPlusDraw = () => ({
  mixins: [theme],
  template: `
  <sm-video-plus
    style="width:1000px;height:600px"
    target="video1"
    videoWidth="1920"
    videoHeight="1080"
    :autoplay="false"
    url="https://iclient.supermap.io/web/data/video/video2.mp4"
    >
      <sm-video-plus-draw @create="draw"></sm-video-plus-draw>
  </sm-video-plus>
  `,
  methods: {
    draw(e) {
      alert(e.e.features[0].geometry.coordinates);
    }
  }
});
BasicVideoPlusDraw.story = {
  name: toI18n('basicComponent.basic')
};
