import {
  toI18n
} from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'Chart Components/gauge'
};

export const Gauge = () => ({
  mixins: [theme],
  data() {
    return {
      dataset: {
        maxFeatures: 20
      },
      datasetOptions: [{
        seriesType: 'gauge'
      }],
      options: {
        series: [
          {
            name: 'demo',
            type: 'gauge',
            min: 0,
            max: 100,
            startAngle: 225,
            endAngle: -45,
            radius: '90%',
            data: [
              {
                name: '完成率',
                value: 68
              }
            ],
            axisLine: {
              show: true,
              lineStyle: {
                width: 20
              }
            },
            splitLine: {
              length: 20
            }
          }
        ]
      }
    };
  },
  template: ` 
  <sm-chart
    style="width: 400px;height: 304px"
    :colorGroup="['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad']"
    :options='options'
    :dataset='dataset'
    :datasetOptions='datasetOptions'
    iconClass=''
  />`
});
Gauge.story = {
  name: toI18n('chartComponent.gauge.gauge')
};

export const MarkGauge = () => ({
  data() {
    return {
      dataset: {
        maxFeatures: 20
      },
      datasetOptions: [{
        seriesType: 'gauge'
      }],
      options: {
        series: [
          {
            name: 'inLoop',
            type: 'gauge',
            min: 0,
            max: 100,
            startAngle: 225,
            endAngle: -45,
            radius: '65%',
            data: [
              {
                name: '完成率',
                value: 36
              }
            ],
            title: {
              show: false
            },
            detail: {
              show: true
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            axisLine: {
              show: true,
              lineStyle: {
                width: 8
              }
            },
            pointer: {
              show: true,
              width: 3
            },
            itemStyle: {
              show: true
            }
          },
          {
            name: 'outLoop',
            type: 'gauge',
            min: 0,
            max: 100,
            startAngle: 225,
            endAngle: -45,
            radius: '85%',
            title: {
              show: false
            },
            detail: {
              show: false
            },
            axisTick: {
              show: true,
              length: -8,
              lineStyle: {
                color: '#3fb1e3'
              }
            },
            splitLine: {
              show: true,
              length: -20,
              lineStyle: {
                color: '#3fb1e3'
              }
            },
            axisLabel: {
              show: true,
              distance: 25
            },
            axisLine: {
              show: false
            },
            pointer: {
              show: false
            },
            itemStyle: {
              show: true
            }
          }
        ]
      }
    };
  },
  template: ` 
  <sm-chart
    style="width: 400px;height: 304px"
    :colorGroup="['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad']"
    :options='options'
    :dataset='dataset'
    :datasetOptions='datasetOptions'
    iconClass=''
  />`
});
MarkGauge.story = {
  name: toI18n('chartComponent.gauge.markGauge')
};

export const ShineGauge = () => ({
  data() {
    return {
      dataset: {
        maxFeatures: 20
      },
      datasetOptions: [{
        seriesType: 'gauge'
      }],
      options: {
        series: [
          {
            name: 'inLoop',
            type: 'gauge',
            min: 0,
            max: 100,
            z: 10,
            startAngle: 225,
            endAngle: -45,
            radius: '60%',
            data: [
              {
                name: '完成率',
                value: 80
              }
            ],
            title: {
              show: false
            },
            detail: {
              offsetCenter: [0, 0],
              color: '#fff',
              textStyle: {
                fontSize: 20
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            axisLine: {
              lineStyle: {
                color: [
                  [0.8, '#3fb1e3'],
                  [1, '#6be6c1']
                ],
                width: 8
              }
            },
            pointer: {
              show: false
            },
            itemStyle: {
              show: true
            }
          },
          {
            name: 'outLoop',
            type: 'gauge',
            min: 0,
            max: 100,
            startAngle: 225,
            endAngle: -45,
            radius: '75%',
            title: {
              show: false
            },
            detail: {
              show: false
            },
            axisTick: {
              show: true,
              length: -5,
              lineStyle: {
                color: '#3fb1e3'
              }
            },
            splitLine: {
              show: true,
              length: -12,
              lineStyle: {
                color: '#3fb1e3'
              }
            },
            axisLabel: {
              show: true,
              fontSize: 10,
              distance: 18
            },
            axisLine: {
              show: false
            },
            pointer: {
              show: false
            },
            itemStyle: {
              show: true
            }
          },
          {
            type: 'pie',
            radius: '35%',
            hoverAnimation: false,
            z: 8,
            data: [
              {
                name: '污染程度',
                value: 80,
                label: {
                  show: false
                },
                labelLine: {
                  show: false
                }
              }
            ],
            label: {
              show: false
            },
            itemStyle: {
              normal: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 1,
                      color: 'rgba(69, 161, 255,1)'
                    },
                    {
                      offset: 0,
                      color: 'rgb(107, 230, 193)'
                    }
                  ]
                }
              }
            }
          },
          {
            type: 'pie',
            radius: '40%',
            hoverAnimation: false,
            label: {
              show: false
            },
            labelLine: {
              show: false
            },
            data: [
              {
                value: 1
              }
            ],
            itemStyle: {
              normal: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: 'rgba(63, 177, 277,0.8)'
                    },
                    {
                      offset: 1,
                      color: 'rgba(63, 177, 277,0.5)'
                    }
                  ]
                }
              }
            }
          },
          {
            type: 'pie',
            radius: '45%',
            hoverAnimation: false,
            label: {
              show: false
            },
            labelLine: {
              show: false
            },
            data: [
              {
                value: 1
              }
            ],
            itemStyle: {
              normal: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: 'rgba(63, 177, 277,0.5)'
                    },
                    {
                      offset: 1,
                      color: 'rgba(63, 177, 277,0.3)'
                    }
                  ]
                }
              }
            }
          },
          {
            type: 'pie',
            radius: '50%',
            hoverAnimation: false,
            label: {
              show: false
            },
            labelLine: {
              show: false
            },
            data: [
              {
                value: 1
              }
            ],
            itemStyle: {
              normal: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: 'rgba(63, 177, 277,0.3)'
                    },
                    {
                      offset: 1,
                      color: 'rgba(63, 177, 277,0)'
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    };
  },
  template: ` 
  <sm-chart
    style="width: 400px;height: 304px"
    :colorGroup="['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad']"
    :options='options'
    :dataset='dataset'
    :datasetOptions='datasetOptions'
    iconClass=''
  />`
});
ShineGauge.story = {
  name: toI18n('chartComponent.gauge.shineGauge')
};

export const SpinGauge = () => ({
  data() {
    return {
      dataset: {
        maxFeatures: 20
      },
      datasetOptions: [{
        seriesType: 'gauge'
      }],
      options: {
        series: [
          {
            type: 'gauge',
            customType: 'customRingsSeries',
            customOptions: {
              pointState: 'startPoint',
              radius: 0.65,
              color: 'rgba(69, 161, 255,1)'
            },
            min: 0,
            max: 100,
            startAngle: 90,
            endAngle: -269.9,
            radius: '58%',
            data: [
              {
                name: '',
                value: 80
              }
            ],
            title: {
              show: false
            },
            detail: {
              offsetCenter: [0, 0],
              color: '#fff',
              textStyle: {
                fontSize: 20
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              length: 20,
              lineStyle: {
                width: 5,
                color: '#2a2e34'
              }
            },
            axisLabel: {
              show: false
            },
            axisLine: {
              show: false
            },
            pointer: {
              show: false
            },
            itemStyle: {
              show: true
            }
          },
          {
            type: 'pie',
            radius: ['58%', '45%'],
            hoverAnimation: false,
            silent: true,
            clockwise: true,
            startAngle: 90,
            z: 0,
            zlevel: 0,
            label: {
              normal: {
                position: 'center'
              }
            },
            data: [
              {
                name: '',
                value: 80,
                itemStyle: {
                  normal: {}
                }
              },
              {
                name: '',
                value: 20,
                itemStyle: {
                  normal: {}
                }
              }
            ]
          }
        ]
      }
    };
  },
  template: ` 
  <sm-chart
    style="width: 400px;height: 304px"
    :colorGroup="['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad']"
    :options='options'
    :dataset='dataset'
    :datasetOptions='datasetOptions'
    iconClass=''
  />`
});
SpinGauge.story = {
  name: toI18n('chartComponent.gauge.spinGauge')
};
