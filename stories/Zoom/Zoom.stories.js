import {
  toI18n
} from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'GIS Components/zoom'
};

export const zoom = () => ({
  mixins: [theme],
  template: `
  <sm-web-map style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
    <sm-zoom />
  </sm-web-map>
  `
});
zoom.story = {
  name: toI18n('gisComponent.zoom')
};

export const Showzoom = () => ({
  template: `
  <sm-web-map target="map222" style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
    <sm-zoom showZoom />
  </sm-web-map>
  `
});
Showzoom.story = {
  name: toI18n('gisComponent.showZoom')
};

export const slider = () => ({
  template: `
  <sm-web-map target="map111" style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
    <sm-zoom :show-zoom-slider="true"/>
  </sm-web-map>
    `
});
slider.story = {
  name: toI18n('gisComponent.slider')
};
