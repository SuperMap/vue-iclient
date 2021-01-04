import {
  toI18n
} from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'Chart Components/radar'
};

export const Radar = () => ({
  mixins: [theme],
  data() {
    return {
      dataset: {
        maxFeatures: 20,
        withCredentials: false
      },
      datasetOptions: [{
        seriesType: 'radar'
      }],
      options: {
        radar: {
          indicator: [
            {
              max: '500',
              name: 'Mon'
            },
            {
              max: '800',
              name: 'Tue'
            },
            {
              max: '3000',
              name: 'Wed'
            },
            {
              max: '3617',
              name: 'Thu'
            },
            {
              max: '3400',
              name: 'Fri'
            },
            {
              max: '4200',
              name: 'Sat'
            },
            {
              max: '1842',
              name: 'Sun'
            }
          ],
          shape: 'circle',
          splitArea: {
            show: false
          },
          splitNumber: 5,
          radius: '70%'
        },
        grid: {
          left: 35,
          top: 50,
          bottom: 25
        },
        series: [{
          barWidth: '80%',
          data: [
            {
              name: 'Y1',
              value: ['100', '520', '2000', '3340', '3900', '3300', '2500']
            }],
          name: 'demo',
          type: 'radar'
        }],
        tooltip: {
          axisPointer: {
            type: 'shadow'
          },
          trigger: 'axis'
        }
      }
    };
  },
  template: ` 
  <sm-chart
    style="width: 400px;height: 288px;"
    :colorGroup="['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad']"
    :options='options'
    :dataset='dataset'
    :datasetOptions='datasetOptions'
    iconClass=''
  />`
});
Radar.story = {
  name: toI18n('chartComponent.radar.radar')
};
