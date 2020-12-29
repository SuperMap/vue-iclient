import {
  toI18n
} from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'Chart Components/Bar'
};

export const ChartBar = () => ({
  mixins: [theme],
  data() {
    return {
      dataset: {
        maxFeatures: 20
      },
      datasetOptions: [{
        seriesType: 'bar'
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
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisLabel: {
            rotate: 0
          },
          type: 'category'
        },
        grid: {
          left: 50,
          right: 50,
          top: 35,
          bottom: 35
        },
        series: [{
          data: ['500', '800', '3000', '3617', '3400', '4200', '1842'],
          name: 'Y2',
          stack: 0,
          type: 'bar'
        },
        {
          data: ['200', '500', '5000', '2617', '3330', '1200', '1002'],
          name: 'Y1',
          stack: 0,
          type: 'bar'
        },
        {
          data: ['230', '1000', '2000', '5617', '3330', '1550', '1892'],
          name: 'Y3',
          stack: 0,
          type: 'bar'
        }
        ]
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
  />
  `
});
ChartBar.story = {
  name: toI18n('chartComponent.charBar.bar')
};

export const ChartBarSquare = () => ({
  data() {
    return {
      dataset: {
        maxFeatures: 8,
        type: 'geoJSON',
        geoJSON: {
          type: 'FeatureCollection',
          features: [
            {
              properties: {
                date: '1月',
                sale: 2016,
                target: 6000
              }
            },
            {
              properties: {
                date: '2月',
                sale: 1230,
                target: 6000
              }
            },
            {
              properties: {
                date: '3月',
                sale: 3790,
                target: 6000
              }
            },
            {
              properties: {
                date: '4月',
                sale: 2349,
                target: 6000
              }
            },
            {
              properties: {
                date: '5月',
                sale: 1654,
                target: 6000
              }
            },
            {
              properties: {
                date: '6月',
                sale: 1120,
                target: 6000
              }
            },
            {
              properties: {
                date: '7月',
                sale: 1980,
                target: 6000
              }
            },
            {
              properties: {
                date: '8月',
                sale: 980,
                target: 6000
              }
            },
            {
              properties: {
                date: '9月',
                sale: 1333,
                target: 6000
              }
            },
            {
              properties: {
                date: '10月',
                sale: 2001,
                target: 6000
              }
            },
            {
              properties: {
                date: '11月',
                sale: 1820,
                target: 6000
              }
            },
            {
              properties: {
                date: '12月',
                sale: 3200,
                target: 6000
              }
            }
          ]
        }
      },
      datasetOptions: [
        {
          seriesType: '2.5Bar',
          xField: 'date',
          yField: 'target',
          sort: 'unsort'
        },
        {
          seriesType: '2.5Bar',
          xField: 'date',
          yField: 'sale',
          sort: 'unsort'
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
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          axisLabel: {
            rotate: 0
          },
          type: 'category'
        },
        grid: {
          left: 50,
          right: 50,
          top: 35,
          bottom: 35
        },
        series: [{
          data: [6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000],
          type: '2.5Bar',
          shape: 'square'
        },
        {
          data: [2016, 1230, 3790, 2349, 1654, 1120, 1980, 980, 1333, 2001, 1820, 3200],
          type: '2.5Bar',
          shape: 'square'
        }
        ],
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
    style="width: 512px;height: 288px;"
    :colorGroup="['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad']"
    :options='options'
    :dataset='dataset'
    :datasetOptions='datasetOptions'
    iconClass=''
  />
  `
});
ChartBarSquare.story = {
  name: toI18n('chartComponent.charBar.barSquare')
};

export const ChartBarRectangle = () => ({
  data() {
    return {
      dataset: {
        maxFeatures: 8,
        type: 'geoJSON',
        geoJSON: {
          type: 'FeatureCollection',
          features: [
            {
              properties: {
                date: '1月',
                sale: 2016,
                target: 6000
              }
            },
            {
              properties: {
                date: '2月',
                sale: 1230,
                target: 6000
              }
            },
            {
              properties: {
                date: '3月',
                sale: 3790,
                target: 6000
              }
            },
            {
              properties: {
                date: '4月',
                sale: 2349,
                target: 6000
              }
            },
            {
              properties: {
                date: '5月',
                sale: 1654,
                target: 6000
              }
            },
            {
              properties: {
                date: '6月',
                sale: 1120,
                target: 6000
              }
            },
            {
              properties: {
                date: '7月',
                sale: 1980,
                target: 6000
              }
            },
            {
              properties: {
                date: '8月',
                sale: 980,
                target: 6000
              }
            },
            {
              properties: {
                date: '9月',
                sale: 1333,
                target: 6000
              }
            },
            {
              properties: {
                date: '10月',
                sale: 2001,
                target: 6000
              }
            },
            {
              properties: {
                date: '11月',
                sale: 1820,
                target: 6000
              }
            },
            {
              properties: {
                date: '12月',
                sale: 3200,
                target: 6000
              }
            }
          ]
        }
      },
      datasetOptions: [
        {
          seriesType: '2.5Bar',
          xField: 'date',
          yField: 'target',
          sort: 'unsort'
        },
        {
          seriesType: '2.5Bar',
          xField: 'date',
          yField: 'sale',
          sort: 'unsort'
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
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          axisLabel: {
            rotate: 0
          },
          type: 'category'
        },
        grid: {
          left: 50,
          right: 50,
          top: 35,
          bottom: 35
        },
        series: [{
          data: [6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000],
          type: '2.5Bar',
          shape: 'rectangle'
        },
        {
          data: [2016, 1230, 3790, 2349, 1654, 1120, 1980, 980, 1333, 2001, 1820, 3200],
          type: '2.5Bar',
          shape: 'rectangle'
        }
        ],
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
    style="width: 512px;height: 288px;"
    :colorGroup="['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad']"
    :options='options'
    :dataset='dataset'
    :datasetOptions='datasetOptions'
    iconClass=''
  />
  `
});
ChartBarRectangle.story = {
  name: toI18n('chartComponent.charBar.barRectangle')
};

export const ChartBarCylinder = () => ({
  data() {
    return {
      dataset: {
        maxFeatures: 8,
        type: 'geoJSON',
        geoJSON: {
          type: 'FeatureCollection',
          features: [
            {
              properties: {
                date: '1月',
                sale: 2016,
                target: 6000
              }
            },
            {
              properties: {
                date: '2月',
                sale: 1230,
                target: 6000
              }
            },
            {
              properties: {
                date: '3月',
                sale: 3790,
                target: 6000
              }
            },
            {
              properties: {
                date: '4月',
                sale: 2349,
                target: 6000
              }
            },
            {
              properties: {
                date: '5月',
                sale: 1654,
                target: 6000
              }
            },
            {
              properties: {
                date: '6月',
                sale: 1120,
                target: 6000
              }
            },
            {
              properties: {
                date: '7月',
                sale: 1980,
                target: 6000
              }
            },
            {
              properties: {
                date: '8月',
                sale: 980,
                target: 6000
              }
            },
            {
              properties: {
                date: '9月',
                sale: 1333,
                target: 6000
              }
            },
            {
              properties: {
                date: '10月',
                sale: 2001,
                target: 6000
              }
            },
            {
              properties: {
                date: '11月',
                sale: 1820,
                target: 6000
              }
            },
            {
              properties: {
                date: '12月',
                sale: 3200,
                target: 6000
              }
            }
          ]
        }
      },
      datasetOptions: [
        {
          seriesType: '2.5Bar',
          xField: 'date',
          yField: 'target',
          sort: 'unsort'
        },
        {
          seriesType: '2.5Bar',
          xField: 'date',
          yField: 'sale',
          sort: 'unsort'
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
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          axisLabel: {
            rotate: 0
          },
          type: 'category'
        },
        grid: {
          left: 50,
          right: 50,
          top: 35,
          bottom: 35
        },
        series: [{
          data: [6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000],
          type: '2.5Bar',
          shape: 'cylinder'
        },
        {
          data: [2016, 1230, 3790, 2349, 1654, 1120, 1980, 980, 1333, 2001, 1820, 3200],
          type: '2.5Bar',
          shape: 'cylinder'
        }
        ],
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
    style="width: 512px;height: 288px;"
    :colorGroup="['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad']"
    :options='options'
    :dataset='dataset'
    :datasetOptions='datasetOptions'
    iconClass=''
  />
  `
});
ChartBarCylinder.story = {
  name: toI18n('chartComponent.charBar.barCylinder')
};

export const ChartXBar = () => ({
  data() {
    return {
      dataset: {
        maxFeatures: 5
      },
      datasetOptions: [{
        seriesType: 'bar'
      }],
      options: {
        yAxis: {
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisLabel: {
            rotate: 0
          },
          type: 'category'
        },
        xAxis: {
          axisLabel: {
            rotate: 0
          },
          splitArea: {
            show: false
          },
          type: 'value'
        },
        grid: {
          left: 50,
          right: 50,
          top: 35,
          bottom: 35
        },
        series: [{
          data: ['500', '800', '3000', '3617', '3400', '4200', '1842'],
          name: 'Y2',
          stack: 0,
          type: 'bar'
        },
        {
          data: ['200', '500', '5000', '2617', '3330', '1200', '1002'],
          name: 'Y1',
          stack: 0,
          type: 'bar'
        }
        ],
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
    style="width: 624px;height: 376px;"
    :colorGroup="['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad']"
    :options='options'
    :dataset='dataset'
    :datasetOptions='datasetOptions'
    iconClass=''
  />`
});
ChartXBar.story = {
  name: toI18n('chartComponent.charBar.xbar')
};

export const ChartRankXBar = () => ({
  data() {
    return {
      dataset: {
        maxFeatures: 8,
        type: 'geoJSON',
        geoJSON: {
          type: 'FeatureCollection',
          features: [
            {
              properties: {
                date: '四川',
                sale: 22
              }
            },
            {
              properties: {
                date: '福建',
                sale: 65
              }
            },
            {
              properties: {
                date: '北京',
                sale: 86
              }
            },
            {
              properties: {
                date: '上海',
                sale: 48
              }
            },
            {
              properties: {
                date: '台湾',
                sale: 43
              }
            },
            {
              properties: {
                date: '广东',
                sale: 53
              }
            },
            {
              properties: {
                date: '海南',
                sale: 37
              }
            }
          ]
        }
      },
      datasetOptions: [
        {
          seriesType: 'bar',
          xField: 'date',
          yField: 'sale',
          sort: 'descending',
          rankLabel: true
        }],
      options: {
        yAxis: {
          data: ['四川', '福建', '北京', '上海', '台湾', '广东', '海南'],
          axisLabel: {
            rotate: 0
          },
          type: 'category'
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            rotate: 0
          },
          splitArea: {
            show: false
          }
        },
        grid: {
          left: 80,
          right: 50,
          top: 35,
          bottom: 35
        },
        series: [
          {
            name: 'sale',
            itemStyle: {
              barBorderRadius: [0, 15, 15, 0]
            },
            stack: 0,
            type: 'bar',
            barWidth: 10,
            data: [22, 65, 86, 48, 43, 53]
          }
        ],
        tooltip: {
          axisPointer: {
            type: 'shadow'
          },
          trigger: 'axis'
        },
        visualMap: [
          {
            show: false,
            seriesIndex: 0,
            dimension: 0,
            outOfRange: {
              color: '#3fb1e3'
            },
            pieces: [ { min: 53, max: 86, color: 'red' } ]
          }
        ]
      }
    };
  },
  template: ` 
  <sm-chart
    style="width: 624px;height: 376px;"
    :colorGroup="['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad']"
    :options='options'
    :dataset='dataset'
    :datasetOptions='datasetOptions'
    iconClass=''
  />`
});
ChartRankXBar.story = {
  name: toI18n('chartComponent.charBar.rankXbar')
};
