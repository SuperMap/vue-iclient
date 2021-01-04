import {
  toI18n
} from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'Chart Components/line'
};

export const Line = () => ({
  mixins: [theme],
  data() {
    return {
      dataset: {
        maxFeatures: 20
      },
      datasetOptions: [{
        seriesType: 'line'
      }],
      options: {
        yAxis: {
          axisLabel: {
            rotate: 0
          },
          splitArea: {
            show: false
          },
          type: 'value'
        },
        xAxis: {
          data: ['Fri', 'Thu', 'Sat', 'Sun', 'Wed', 'Tue', 'Mon'],
          axisLabel: {
            rotate: 0
          },
          type: 'category'
        },
        grid: {
          left: 50,
          top: 50,
          bottom: 25
        },
        series: [{
          data: ['3900', '3340', '3300', '2500', '2200', '520', '100'],
          name: 'Y1',
          type: 'line'
        },
        {
          data: ['3400', '3617', '4200', '1842', '3000', '800', '500'],
          name: 'Y2',
          type: 'line'
        }
        ],
        tooltip: {
          axisPointer: {
            type: 'line'
          },
          trigger: 'axis'
        }
      }
    };
  },
  template: ` 
  <sm-chart
    style="width: 512px;height: 288px;"
    :colorGroup="['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad']"
    :options='options'
    :dataset='dataset'
    :datasetOptions='datasetOptions'
    iconClass=''
  />`
});
Line.story = {
  name: toI18n('chartComponent.line.line')
};
