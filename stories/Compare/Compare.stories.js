import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'GIS Components/compare'
};

export const compare = () => ({
  mixins: [theme],
  template: `
  <sm-compare style="width: 100%;height:700px">
    <sm-web-map target="map111" slot="beforeMap" style="height:700px" mapId="1329428269" serverUrl="https://iportal.supermap.io/iportal">
    </sm-web-map>
    <sm-web-map slot="afterMap" style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
    </sm-web-map>
  </sm-compare>
  `
});
compare.story = {
  name: toI18n('gisComponent.compare')
};
