import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'GIS Components/measure'
};
export const Measure = () => ({
  mixins: [theme],
  template: `
  <sm-web-map style="height:700px" server-url='https://iportal.supermap.io/iportal' map-id="801571284">
    <sm-measure :collapsed="false"></sm-measure>
  </sm-web-map>
    `
});
Measure.story = {
  name: toI18n('gisComponent.measure')
};
