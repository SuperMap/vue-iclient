import { toI18n } from '../../.storybook/lang';

export default {
  title: 'GIS Components/pan'
};

export const pan = () => ({
  template: `
  <sm-web-map style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
    <sm-pan />
  </sm-web-map>
  `
});
pan.story = {
  name: toI18n('gisComponent.pan')
};
