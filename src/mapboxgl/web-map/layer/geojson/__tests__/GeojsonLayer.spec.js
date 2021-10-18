import {
  mount,
  createLocalVue
} from '@vue/test-utils';
import SmWebMap from '../../../WebMap.vue';
import SmGeojsonLayer from '../GeojsonLayer.vue';
import mapEvent from '@types_mapboxgl/map-event';
import '@libs/mapboxgl/mapbox-gl-enhance';
import CircleStyle from '../../../../_types/CircleStyle'
import {
  Icon,
  Input,
  message
} from 'ant-design-vue';

const localVue = createLocalVue();
localVue.use(Input);
localVue.use(Icon);

localVue.prototype.$message = message;
let data = {
  "type": "FeatureCollection",
  "features": [{
    "geometry": {
      "type": "Point",
      "coordinates": [
        122.36999999999999,
        53.470000000000006
      ]
    },
    "properties": {
      "最低气温_Num": "-53.0",
      "最高气温_Num": "33.0",
      "最高七天气温_Num": "29.0",
      "平均最低气温_Num": "-47.0",
      "海波_Num": "296.0"
    },
    "type": "Feature"
  }]
}
describe('GeojsonLayer.vue', () => {
  let wrapper;
  let mapWrapper;
  
  let layerStyle = new CircleStyle();

  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    mapWrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    })
  });

  afterEach(() => {
    jest.resetAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  it('render', (done) => {
    let data = JSON.stringify(data);
    wrapper = mount(SmGeojsonLayer, {
      localVue,
      propsData: {
        mapTarget: "map",
        layerStyle: layerStyle,
        data: data,
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          expect(wrapper.vm.mapTarget).toBe('map');
          done()
        } catch (exception) {
          console.log("案例失败：" + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('geojson layerStyle', (done) => {
    let data = JSON.stringify(data);
    wrapper = mount(SmGeojsonLayer, {
      localVue,
      propsData: {
        mapTarget: "map",
        layerStyle: layerStyle,
        data: data,
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          const getSourceSpy = jest.spyOn(wrapper.vm.map, 'getSource');
          const setLayoutPropertySpy = jest.spyOn(wrapper.vm.map, 'setLayoutProperty');
          wrapper.vm.viewModel.setData(data);
          wrapper.vm.viewModel.setLayerStyle(layerStyle);
          expect(getSourceSpy).toBeCalled();
          expect(setLayoutPropertySpy).toBeCalled();
          done()
        } catch (exception) {
          console.log("案例失败：" + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('geojson setdata', (done) => {
    let data = JSON.stringify(data);
    wrapper = mount(SmGeojsonLayer, {
      propsData: {
        mapTarget: "map",
        layerStyle: layerStyle,
        data: data,
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          let newData = {
            "type": "FeatureCollection",
            "features": [{
              "geometry": {
                "type": "Point",
                "coordinates": [
                  122,
                  53
                ]
              },
              "properties": {
                "SmID": "1"
              },
              "type": "Feature"
            }]
          }
          wrapper.setProps({data: newData});
          wrapper.vm.$nextTick();
          expect(wrapper.vm.data).toBe(newData);
          done()
        } catch (exception) {
          console.log("案例失败：" + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });
});