import { mount } from '@vue/test-utils';
import '@libs/mapboxgl/mapbox-gl-enhance.js';
import SmVideoPlus from '../../VideoPlus.vue';
import SmVideoLayer from '../VideoLayer.vue';
import CircleStyle from '../../../_types/CircleStyle'
import mockVideo from 'video.js';

let data = {
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
      "最低气温_Num": "-53.0",
      "最高气温_Num": "33.0"
    },
    "type": "Feature"
  }]
}

describe('SmVideoLayer.vue', () => {
  let wrapper;
  let videoPlusWrapper;
  let layerStyle = new CircleStyle();
  let src = 'http://fakeurl:8081/test.mp4';
  let videoWidth = '1920';
  let videoHeight = '1080';
  beforeEach(() => {
    wrapper = null;
    mockVideo.mockImplementation(e => {
      if (e) {
        return {
          el_: {
            firstChild: {
              id: 'video_id'
            }
          },
          on(type, callback) {
            callback();
          },
          one() {},
          play() {},
          pause() {},
          currentTime() {},
          getTech() {},
          mergeOptions() {},
          registerTech() {}
        }
      }
    });
    videoPlusWrapper = mount(SmVideoPlus, {
      propsData: {
        videoHeight,
        videoWidth,
        src
      }
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
    if (videoPlusWrapper) {
      videoPlusWrapper.destroy();
    }
  });

  it('render', done => {
    wrapper = mount(SmVideoLayer, {
      propsData: {
        target: "video",
        layerStyle: layerStyle,
        data: data,
      }
    });
    setTimeout(() => {
      done();
    }, 2000);
  });

  xit('change data', async done => {
    wrapper = mount(SmVideoLayer, {
      propsData: {
        target: "video",
        layerStyle: layerStyle,
        data: data,
      }
    });
    let newData = {
      type: 'FeatureCollection',
      features: [
        {
          geometry: {
            type: 'Point',
            coordinates: [200, 200]
          },
          properties: {
            SmID: '1'
          },
          type: 'Feature'
        }
      ]
    };
    await wrapper.setProps({ data: newData });
    wrapper.vm.$nextTick();
    done();
  });
});