import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'GIS Components/identify'
};

export const identify = () => ({
  mixins: [theme],
  template: `
  <sm-web-map style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
    <sm-identify :layers="['民航数据']" :fields="['机场','同比增速%','2017旅客吞吐量（人次）']"></sm-identify>
  </sm-web-map>
  `
});
identify.story = {
  name: toI18n('gisComponent.identify')
};
