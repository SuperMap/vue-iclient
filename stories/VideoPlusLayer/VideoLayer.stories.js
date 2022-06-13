import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('basicComponent.title')}/${toI18n('basicComponent.videoLayer.title')}`,
  id: 'BasicComponents/video-plus'
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
                    350,
                    200
                  ],
                  [
                    350, 400
                  ],
                  [
                    200, 500
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
  name: toI18n('basicComponent.basic')
};
