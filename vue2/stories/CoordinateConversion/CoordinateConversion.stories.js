import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('gisComponent.title')}/${toI18n('gisComponent.coordinateCoversion.title')}`,
  id: 'GISComponents/coordinateConversion'
};

export const coordinateConversion = () => ({
  mixins: [theme],
  template: `
  <sm-web-map style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
    <sm-coordinate-conversion></sm-coordinate-conversion>
  </sm-web-map>
  `
});
coordinateConversion.story = {
  name: toI18n('gisComponent.basic')
};
