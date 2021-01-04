import {
  toI18n
} from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'GIS Components/tdtMapSwitcher'
};

export const tdtMapSwitcher = () => ({
  mixins: [theme],
  data() {
    return {
      mapSwitcherData: {
        select: '',
        label: false,
        tk: '1d109683f4d84198e37a38c442d68311'
      }
    };
  },
  template: `
  <sm-web-map style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
    <sm-tdt-map-switcher :data="mapSwitcherData" />
  </sm-web-map>
  `
});
tdtMapSwitcher.story = {
  name: toI18n('gisComponent.tdtMapSwitcher')
};
