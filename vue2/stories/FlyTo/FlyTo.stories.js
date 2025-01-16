import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('gisComponent.title')}/${toI18n('gisComponent.flyTo.title')}`,
  id: 'GISComponents/flyTo'
};

export const BasicUsage = () => ({
  mixins: [theme],
  data() {
    return {
      data: [
        [103.93303602365336, 33.04646925591396],
        [103.90771770744831, 33.163703206300525],
        [103.93169934861643, 33.25624201104978]
      ],
      flyOptions: {
        duration: 1500,
        zoom: 15,
        pitch: 60
      }
    };
  },
  template: `
  <sm-web-map target="map1" style="height:700px" mapId="567946816" serverUrl="https://www.supermapol.com" tianditu-key="1d109683f4d84198e37a38c442d68311">
    <sm-fly-to position="top-right" :data="data" :fly-options="flyOptions" :collapsed="false" />
  </sm-web-map>
  `
});
BasicUsage.story = {
  name: toI18n('gisComponent.basic')
};

export const ManualSwitch = () => ({
  mixins: [theme],
  data() {
    return {
      data: [
        [103.93303602365336, 33.04646925591396],
        [103.90771770744831, 33.163703206300525],
        [103.93169934861643, 33.25624201104978]
      ],
      flyOptions: {
        duration: 1500,
        zoom: 15,
        pitch: 60
      }
    };
  },
  template: `
  <sm-web-map target="map2" style="height:700px" mapId="567946816" serverUrl="https://www.supermapol.com" tianditu-key="1d109683f4d84198e37a38c442d68311">
    <sm-fly-to position="top-right" :data="data" :fly-options="flyOptions" :collapsed="false" :autoplay="false" :loop="false" />
  </sm-web-map>
  `
});
ManualSwitch.story = {
  name: toI18n('gisComponent.flyTo.manualSwitch')
};

export const HideController = () => ({
  mixins: [theme],
  data() {
    return {
      data: [
        [103.93303602365336, 33.04646925591396],
        [103.90771770744831, 33.163703206300525],
        [103.93169934861643, 33.25624201104978]
      ],
      flyOptions: {
        duration: 1500,
        zoom: 15,
        pitch: 60
      }
    };
  },
  template: `
  <sm-web-map target="map3" style="height:700px" mapId="567946816" serverUrl="https://www.supermapol.com" tianditu-key="1d109683f4d84198e37a38c442d68311">
    <sm-fly-to position="top-right" :data="data" :fly-options="flyOptions" :show-controller="false" />
  </sm-web-map>
  `
});
HideController.story = {
  name: toI18n('gisComponent.flyTo.hidenController')
};
