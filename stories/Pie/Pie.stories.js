import {
  toI18n
} from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'Chart Components/pie'
};

export const Pie = () => ({
  mixins: [theme],
  data() {
    return {
      dataset: {
        maxFeatures: 20
      },
      datasetOptions: [{
        seriesType: 'pie'
      }],
      options: {
        grid: {
          left: 50,
          right: 50,
          top: 35,
          bottom: 35
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          show: true,
          top: 'auto',
          left: 'left'
        },
        series: [
          {
            name: 'demo',
            type: 'pie',
            radius: '80%',
            width: 400,
            height: 288,
            data: [
              {
                value: 500,
                name: 'Mon'
              },
              {
                value: 800,
                name: 'Tue'
              },
              {
                value: 3000,
                name: 'Wed'
              },
              {
                value: 3617,
                name: 'Thu'
              },
              {
                value: 3400,
                name: 'Fri'
              },
              {
                value: 4200,
                name: 'Sat'
              },
              {
                value: 1842,
                name: 'Sun'
              }
            ]
          }
        ],
        tooltip: {
          trigger: 'item'
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
  >
  `
});
Pie.story = {
  name: toI18n('chartComponent.pie.pie')
};

export const Rose = () => ({
  data() {
    return {
      dataset: {
        maxFeatures: 20
      },
      datasetOptions: [{
        seriesType: 'pie'
      }],
      options: {
        grid: {
          left: 50,
          right: 50,
          top: 35,
          bottom: 35
        },
        legend: {
          type: 'scroll',
          orient: 'horizontal',
          data: ['rose1', 'rose2', 'rose3', 'rose4', 'rose5', 'rose6', 'rose7', 'rose8'],
          show: true,
          top: 'buttom'
        },
        series: [
          {
            name: 'area',
            type: 'pie',
            radius: ['10%', '80%'],
            roseType: 'area',
            label: {
              show: false
            },
            data: [
              {
                value: 10,
                name: 'rose1'
              },
              {
                value: 5,
                name: 'rose2'
              },
              {
                value: 15,
                name: 'rose3'
              },
              {
                value: 25,
                name: 'rose4'
              },
              {
                value: 20,
                name: 'rose5'
              },
              {
                value: 35,
                name: 'rose6'
              },
              {
                value: 30,
                name: 'rose7'
              },
              {
                value: 40,
                name: 'rose8'
              }
            ]
          }
        ],
        tooltip: {
          trigger: 'item'
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
    >
    `
});
Rose.story = {
  name: toI18n('chartComponent.pie.rose')
};

export const Ring = () => ({
  data() {
    return {
      dataset: {
        maxFeatures: 20
      },
      datasetOptions: [{
        seriesType: 'pie'
      }],
      options: {
        grid: {
          left: 50,
          right: 50,
          top: 35,
          bottom: 35
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          show: true,
          top: 'auto',
          left: 'left'
        },
        series: [
          {
            name: 'demo',
            type: 'pie',
            radius: [ '60%', '80%' ],
            label: {
              show: false
            },
            data: [
              {
                value: 500,
                name: 'Mon'
              },
              {
                value: 800,
                name: 'Tue'
              },
              {
                value: 3000,
                name: 'Wed'
              },
              {
                value: 3617,
                name: 'Thu'
              },
              {
                value: 3400,
                name: 'Fri'
              },
              {
                value: 4200,
                name: 'Sat'
              },
              {
                value: 1842,
                name: 'Sun'
              }
            ]
          }
        ],
        tooltip: {
          trigger: 'item'
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
  >
  `
});
Ring.story = {
  name: toI18n('chartComponent.pie.ring')
};

export const ShineRing = () => ({
  data() {
    return {
      dataset: {
        maxFeatures: 20,
        type: 'geoJSON',
        geoJSON: {
          type: 'FeatureCollection',
          features: [
            {
              properties: {
                date: 'Mon',
                sale: 500
              }
            },
            {
              properties: {
                date: 'Tue',
                sale: 800
              }
            },
            {
              properties: {
                date: 'Wed',
                sale: 1842
              }
            },
            {
              properties: {
                date: 'Thu',
                sale: 3000
              }
            },
            {
              properties: {
                date: 'Fri',
                sale: 3400
              }
            },
            {
              properties: {
                date: 'Sat',
                sale: 3617
              }
            },
            {
              properties: {
                date: 'Sun',
                sale: 4200
              }
            }
          ]
        }
      },
      datasetOptions: [
        {
          seriesType: 'pie',
          xField: 'date',
          yField: 'sale',
          sort: 'descending'
        }],
      options: {
        legend: {
          type: 'scroll',
          orient: 'vertical',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          show: true,
          top: 'auto',
          left: 'left'
        },
        series: [
          {
            name: 'demo',
            type: 'pie',
            radius: [ '60%', '80%' ],
            isShine: true,
            barWidth: 10,
            outerGap: 0,
            label: {
              show: false
            },
            data: [
              {
                value: 500,
                name: 'Mon'
              },
              {
                value: 800,
                name: 'Tue'
              },
              {
                value: 3000,
                name: 'Wed'
              },
              {
                value: 3617,
                name: 'Thu'
              },
              {
                value: 3400,
                name: 'Fri'
              },
              {
                value: 4200,
                name: 'Sat'
              },
              {
                value: 1842,
                name: 'Sun'
              }
            ]
          }
        ],
        tooltip: {
          show: false
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
ShineRing.story = {
  name: toI18n('chartComponent.pie.shineRing')
};
