import { toI18n } from '../../.storybook/lang';

export default {
  title: 'GIS Components/openFile'
};
export const OpenFile = () => ({
  template: `
  <sm-web-map style="height:700px" serverUrl='https://iportal.supermap.io/iportal' mapId="1329428269">
    <sm-open-file></sm-open-file>
  </sm-web-map>
    `
});
OpenFile.story = {
  name: toI18n('gisComponent.openFile')
};
