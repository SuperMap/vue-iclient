import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('gisComponent.title')}/${toI18n('gisComponent.featureTable.title')}`,
  id: 'GISComponents/featureTable'
};
export const FeatureTable = () => ({
  mixins: [theme],
  data() {
    return {
      fieldConfigs: [
        { value: '平均最低气温_Num', visible: false },
        { value: 'SmID', visible: false },
        { value: '站台', visible: false },
        { value: '海波_Num', visible: false },
        { value: '省份', visible: false },
        { value: '海拔', visible: false },
        { value: '最高气温_Num', visible: false },
        { value: '最高气温', visible: false },
        { value: '最高七天气温_Num', visible: false },
        { value: '最高七天气温', visible: false },
        { value: '最低气温_Num', visible: false },
        { value: '最低气温', visible: false },
        { value: '年均降雨_Num', visible: false },
        { value: 'lon', visible: true, title: '经度' },
        { value: 'lat', visible: true, title: '纬度' }
      ]
    };
  },
  template: `
  <div>
    <sm-web-map style="height:400px" serverUrl="https://www.supermapol.com/" mapId="505367620"></sm-web-map>
    <div style="positon:relative;height:400px;width:100%">
      <sm-feature-table layerName="全国671个气象站观测数据" :fieldConfigs="fieldConfigs"></sm-feature-table>
    </div>
  </div>
    `
});

FeatureTable.story = {
  name: toI18n('gisComponent.basic')
};
