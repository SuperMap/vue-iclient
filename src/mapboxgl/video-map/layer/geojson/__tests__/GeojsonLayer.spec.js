import { mount } from '@vue/test-utils';
import '@libs/mapboxgl/mapbox-gl-enhance.js';
import SmVideoMap from '../../../VideoMap.vue';
import SmVideoMapGeojsonLayer from '../GeojsonLayer.vue';
import mapEvent from '@types_mapboxgl/video-map-event';
import CircleStyle from '../../../../_types/CircleStyle'

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

describe('SmVideoMapGeojsonLayer.vue', () => {
  let wrapper;
  let videoMapWrapper;
  let layerStyle = new CircleStyle();
  let src = 'http://fakeurl:8081/test.mp4';
  let videoWidth = '1920';
  let videoHeight = '1080';
  let videoParameters = {
    cx: 959.9995045134173,
    cy: 539.9901454012562,
    fx: 1520.152911079442,
    fy: 1575.1348617395925,
    videoWidth: 1920,
    videoHeight: 1080,
    pitch: -24.96093939608592,
    roll: -8.415413323689824,
    yaw: -7.289473927703427,
    x: 13355976.039998194,
    y: 3570816.8299734485,
    z: 84.61937489086995
  };
  beforeEach(() => {
    wrapper = null;
    videoMapWrapper = mount(SmVideoMap, {
      propsData: {
        videoHeight,
        videoWidth,
        src,
        videoParameters
      }
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
    if (videoMapWrapper) {
      videoMapWrapper.destroy();
    }
  });

  it('render', done => {

    wrapper = mount(SmVideoMapGeojsonLayer, {
      propsData: {
        mapTarget: "map",
        layerStyle: layerStyle,
        data: data,
      }
    });

    videoMapWrapper.vm.$on('load', () => {
      try {
        // expect(wrapper.vm.src).toBe(src);
        done();
      } catch (exception) {
        console.log('VideoMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        done();
      }
    });
  });
});
