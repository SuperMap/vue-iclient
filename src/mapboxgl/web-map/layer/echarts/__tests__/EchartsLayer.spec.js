import { mount } from '@vue/test-utils';
import SmEchartsLayer from '../EchartsLayer.vue';

describe('EchartsLayer.vue', () => {
  let wrapper;
  let pointData = {
    type: 'FeatureCollection',
    features: [
      {
        geometry: {
          type: 'Point',
          coordinates: [122.36999999999999, 53.470000000000006]
        },
        properties: {
          SmID: '1',
          SmX: '1.3622166088372886E7',
          SmY: '7070412.841759119',
          SmLibTileID: '1',
          SmUserID: '0',
          SmGeometrySize: '16',
          区站号: '50136',
          站台: '漠河',
          省份: '黑龙江',
          海拔: '296',
          平均最低气温: '-47',
          最热七天气温: '29',
          最高气温: '33',
          最低气温: '-53',
          年均降雨: '366.1',
          年均降雨_Num: '366.1',
          最低气温_Num: '-53.0',
          最高气温_Num: '33.0',
          最高七天气温_Num: '29.0',
          平均最低气温_Num: '-47.0',
          海波_Num: '296.0'
        },
        type: 'Feature'
      }
    ]
  };
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render default correctly', () => {
    wrapper = mount(SmEchartsLayer, {
      propsData: {
        options: {
          animation: false,
          GLMap: {
            roam: true
          },
          coordinateSystem: 'GLMap',
          geo: {
            map: 'GLMap'
          },
          series: [
            {
              type: 'lines',
              polyline: true,
              data: pointData,
              silent: true,
              lineStyle: {
                normal: {
                  opacity: 0.2,
                  width: 1
                }
              },
              progressiveThreshold: 500,
              progressive: 100
            },
            {
              type: 'lines',
              coordinateSystem: 'GLMap',
              polyline: true,
              data: pointData,
              lineStyle: {
                normal: {
                  width: 0.2
                }
              },
              effect: {
                constantSpeed: 40,
                show: true,
                trailLength: 0.02,
                symbolSize: 2
              }
            }
          ]
        }
      }
    });
  });
});
