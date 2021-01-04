import {
  toI18n
} from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'GIS Components/tdtRoute'
};

export const TdtRoute = () => ({
  mixins: [theme],
  data() {
    return {
      routeData: {
        carUrl: 'https://api.tianditu.gov.cn/drive',
        busUrl: 'https://api.tianditu.gov.cn/transit',
        searchUrl: 'https://api.tianditu.gov.cn/search',
        tk: '1d109683f4d84198e37a38c442d68311'
      }
    };
  },
  template: `
  <sm-web-map style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
    <sm-tdt-route :data="routeData" />
  </sm-web-map>
  `
});
TdtRoute.story = {
  name: toI18n('gisComponent.TdtRoute')
};
