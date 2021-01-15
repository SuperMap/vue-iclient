import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('gisComponent.title')}/${toI18n('gisComponent.layerColor.title')}`,
  id: 'GISComponents/layerColor'
};
export const LayerColor = () => ({
  mixins: [theme],
  template: `
  <sm-web-map style="height:700px" serverUrl="https://www.supermapol.com/" mapId="505367620">
    <sm-layer-color :collapsed="false"></sm-layer-color>
  </sm-web-map>
    `
});

LayerColor.story = {
  name: toI18n('gisComponent.basic')
};
