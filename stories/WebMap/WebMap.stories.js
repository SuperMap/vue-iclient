import SmWebMap from "../../src/mapboxgl/web-map/WebMap.vue";
import "../../src/mapboxgl/web-map/style/web-map.scss";
import {
  withKnobs,
  text,
  array,
  number,
} from "@storybook/addon-knobs";

export default {
  title: "web-map",
  component: SmWebMap,
  decorators: [withKnobs],
};

export const WebMap = () => ({
  components: { SmWebMap },
  props: {
    serverUrl: { default: text("serverUrl","https://iportal.supermap.io/iportal") },
    mapId: { default: text("mapId", "801571284") },
    mapOptions: {
      default: {
        center: array("center", [116.4562, 38.3792]),
        zoom: number("zoom", 4),
        pitch: number("pitch", 0),
        bearing: number("bearing", 0),
      },
    },
  },
  template: '<sm-web-map style="height:700px" v-bind="$props"></sm-web-map>',
});
WebMap.story = {
  name: "地图",
};
