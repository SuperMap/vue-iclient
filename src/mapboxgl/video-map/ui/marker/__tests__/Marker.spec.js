import { mount } from '@vue/test-utils';
import '@libs/mapboxgl/mapbox-gl-enhance.js';
import SmVideoMap from '../../../VideoMap.vue';
import SmVideoMapMarker from '../Marker.vue';
import mapEvent from '@types_mapboxgl/video-map-event';

describe('SmVideoMapGeojsonLayer.vue', () => {
  let wrapper;
  let videoMapWrapper;
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
    wrapper = mount(SmVideoMapMarker, {
      propsData: {
        mapTarget: "map",
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
