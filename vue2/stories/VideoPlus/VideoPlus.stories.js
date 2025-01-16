import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('basicComponent.title')}/${toI18n('basicComponent.videoPlus.title')}`,
  id: 'BasicComponents/video-plus'
};

export const BasicVideoPlus = () => ({
  mixins: [theme],
  data() {
    return {
      videoWidth: 800,
      videoHeight: 600
    };
  },
  template: `
  <sm-video-plus
    style="width:1000px;height:600px"
    :videoWidth="videoWidth"
    :videoHeight="videoHeight"
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
  name: toI18n('basicComponent.videoPlus.draw')
};

export const BasicVideoLayer = () => ({
  mixins: [theme],
  template: `
  <sm-video-plus
    style="width:1000px;height:600px"
    target="video5"
    videoWidth="1920"
    videoHeight="1080"
    url="https://iclient.supermap.io/web/data/video/video2.mp4"
    >
      <sm-video-plus-layer
        layerId="custom1111"
        :data='{
        type: "FeatureCollection",
        features: [
          {
            "type": "Feature",
            "properties": {},
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    200, 200
                  ],
                  [
                    650,
                    200
                  ],
                  [
                    650, 400
                  ],
                  [
                    200, 400
                  ],
                  [
                    200, 200
                  ]
                ]
              ]
            }
          }
        ]
      }' :layerStyle="{paint:{'fill-color': 'red'}, layout:{}}"></sm-video-plus-layer>
  </sm-video-plus>
  `
});

BasicVideoLayer.story = {
  name: toI18n('basicComponent.videoPlus.layer')
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
  name: toI18n('basicComponent.videoPlus.marker')
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

BasicVideoPopup.story = {
  name: toI18n('basicComponent.videoPlus.popup')
};
