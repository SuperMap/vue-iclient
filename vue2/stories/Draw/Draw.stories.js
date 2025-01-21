import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('gisComponent.title')}/${toI18n('gisComponent.draw.title')}`,
  id: 'GISComponents/draw'
};

export const compare = () => ({
  mixins: [theme],
  template: `
  <sm-web-map style="width: 100%; height:700px" mapId="1329428269" serverUrl="https://iportal.supermap.io/iportal">
    <sm-draw />
  </sm-web-map>
  `
});
compare.story = {
  name: toI18n('gisComponent.basic')
};
