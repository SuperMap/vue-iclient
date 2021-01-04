import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'GIS Components/layerManager'
};
export const layerManager = () => ({
  mixins: [theme],
  template: `
  <sm-web-map style="height:700px" serverUrl='https://iportal.supermap.io/iportal' mapId="1329428269">
    <sm-layer-manager :collapsed="false" :defaultExpandAll="true" :layers="[{mapInfo: {serverUrl: 'https://iportal.supermap.io/iportal', mapId:'801571284'}, title: '民航数据-单值' }]"></sm-layer-manager>
  </sm-web-map>
    `
});
layerManager.story = {
  name: toI18n('gisComponent.layerManager')
};
