import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('gisComponent.title')}/${toI18n('gisComponent.openFile.title')}`,
  id: 'GISComponents/openFile'
};
export const OpenFile = () => ({
  mixins: [theme],
  template: `
  <sm-web-map style="height:700px" serverUrl='https://iportal.supermap.io/iportal' mapId="1329428269">
    <sm-open-file></sm-open-file>
  </sm-web-map>
    `
});
OpenFile.story = {
  name: toI18n('gisComponent.basic')
};
