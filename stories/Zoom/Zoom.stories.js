import {
  toI18n
} from '../../.storybook/lang';

export default {
  title: 'GIS Components/zoom'
};

export const zoom = () => ({
  template: `
  <sm-web-map style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
    <sm-zoom />
  </sm-web-map>
  `
});
zoom.story = {
  name: toI18n('gisComponent.zoom')
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
