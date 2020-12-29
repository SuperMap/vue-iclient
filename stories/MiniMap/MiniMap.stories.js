import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'GIS Components/miniMap'
};
export const miniMap = () => ({
  mixins: [theme],
  template: `
  <sm-web-map style="height:700px" serverUrl='https://iportal.supermap.io/iportal' mapId="1329428269">
    <sm-mini-map :collapsed="false"></sm-mini-map>
  </sm-web-map>
    `
});
miniMap.story = {
  name: toI18n('gisComponent.miniMap')
};
