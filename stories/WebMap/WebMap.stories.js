import { withKnobs, text, array, number } from '@storybook/addon-knobs';

export default {
  title: 'MapComponent/web-map',
  decorators: [withKnobs]
};

export const WebMap = () => ({
  props: {
    serverUrl: { default: text('serverUrl', 'https://iportal.supermap.io/iportal') },
    mapId: { default: text('mapId', '801571284') },
    mapOptions: {
      default: {
        center: array('center', [116.4562, 38.3792]),
        zoom: number('zoom', 4),
        pitch: number('pitch', 0),
        bearing: number('bearing', 0)
      }
    }
  },
  template: '<sm-web-map style="height:700px" v-bind="$props"></sm-web-map>'
});
WebMap.story = {
  name: '地图'
};
