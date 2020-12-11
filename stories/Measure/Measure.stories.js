import { toI18n } from '../../.storybook/lang';

export default {
  title: 'Gis Component/measure'
};
export const Measure = () => ({
  template: `
  <sm-web-map style="height:700px" server-url='https://iportal.supermap.io/iportal' map-id="801571284">
    <sm-measure :collapsed="false"></sm-measure>
  </sm-web-map>
    `
});
Measure.story = {
  name: toI18n('gisComponent.measure')
};
