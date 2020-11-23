import { withKnobs } from '@storybook/addon-knobs';
import { toI18n } from '../../.storybook/lang';

export default {
  title: 'Map/web-map',
  decorators: [withKnobs]
};

export const WebMap = () => ({
  template: `
  <sm-web-map style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal"></sm-web-map>
  `
});
WebMap.story = {
  name: toI18n('mapComponent.iportalMap')
};
