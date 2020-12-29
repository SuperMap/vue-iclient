import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'Map Components/web-map'
};

export const WebMap = () => ({
  mixins: [theme],
  template: `
  <sm-web-map style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal"></sm-web-map>
  `
});
WebMap.story = {
  name: toI18n('mapComponent.iportalMap')
};
