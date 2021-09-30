import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('gisComponent.title')}/${toI18n('gisComponent.pan.title')}`,
  id: 'GISComponents/pan'
};

export const pan = () => ({
  mixins: [theme],
  template: `
  <sm-web-map style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
    <sm-pan />
  </sm-web-map>
  `
});
pan.story = {
  name: toI18n('gisComponent.basic')
};
