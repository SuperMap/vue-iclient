import { mount, createLocalVue, config } from '@vue/test-utils';
import SmOpenFile from '../OpenFile.vue';
import LineStyle from '../../_types/LineStyle';
import FillStyle from '../../_types/FillStyle';
import CircleStyle from '../../_types/CircleStyle';
import { message } from 'ant-design-vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';
const localVue = createLocalVue();
localVue.prototype.$message = message;

describe('OpenFile.vue', () => {
  let wrapper;
  let mapWrapper;
  const china = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: '81',
          name: '香港',
          cp: [114.2578, 22.3242],
          childNum: 1
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [114.6094, 22.4121],

              [114.6094, 22.4121]
            ]
          ]
        }
      },
      {
        type: 'Feature',
        properties: {
          id: '82',
          name: '澳门',
          cp: [113.5547, 22.1484],
          childNum: 1
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [113.5986, 22.1649],

              [113.5986, 22.1649]
            ]
          ]
        }
      }
    ]
  };
  const chinaString = JSON.stringify(china);

  beforeAll(async () => {
    config.mapLoad = false;
    mapWrapper = await createEmptyMap();
  });

  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    config.mapLoad = true;
    if (wrapper) {
      wrapper.destroy();
    }
  });

  afterAll(() => {
    config.mapLoad = true;
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  it('default', async done => {
    jest.spyOn(global, 'FileReader').mockImplementation(function () {
      this.onloadend = function (event) {};
      const event = {
        target: {
          result: chinaString
        }
      };
      this.readAsText = function () {
        this.onloadend(event);
      };
    });
    const blob = new Blob([JSON.stringify(china)], {
      type: 'application/json'
    });
    const name = './base/resources/china.json';
    const type = 'application/json';
    const file = new File([blob], name, {
      type: type
    });
    const fileEventObject = {
      target: {
        files: {
          0: file
        },
        value: './base/resources/china.json'
      }
    };
    wrapper = mount(SmOpenFile, {
      localVue,
      props: {
        clearLastLayer: true
      }      
    });
    await mapSubComponentLoaded(wrapper);
    const openFileSucceededFn = jest.fn();
    wrapper.vm.$on({ 'open-file-succeeded': openFileSucceededFn });
    expect(wrapper.find('.sm-component-open-file__input').exists()).toBe(true);
    wrapper.vm.fileSelect(fileEventObject);
    expect(openFileSucceededFn.mock.called).toBeTruthy;
    done();
  });

  it('custom setting', async done => {
    let type = 'application/json';
    let name = './base/resources/china.json';
    let blob = new Blob([JSON.stringify(china)], {
      type: type
    });
    let file = new File([blob], name, {
      type: type
    });
    let fileEventObject = {
      target: {
        files: {
          0: file
        },
        value: './base/resources/china.json'
      }
    };
    wrapper = mount(SmOpenFile, {
      localVue,
      propsData: {
        layerStyle: {
          line: new LineStyle(),
          circle: new CircleStyle(),
          fill: new FillStyle()
        },
        addToMap: false,
        clearLastLayer: true
      }
    });
    await mapSubComponentLoaded(wrapper);
    const openFileSucceededFn = jest.fn();
    expect(wrapper.find('#input_file').exists()).toBe(true);
    wrapper.vm.$on({ 'open-file-succeeded': openFileSucceededFn });
    wrapper.vm.fileSelect(fileEventObject);
    expect(openFileSucceededFn.mock.called).toBeTruthy;
    done();
  });

  it('fileType is error', async done => {
    let name = './base/resources/test';
    let blob = new Blob(['This is my blob content'], {
      type: 'text/plain'
    });
    let file = new File([blob], name, {
      type: 'text/plain'
    });
    let fileEventObject = {
      target: {
        files: {
          0: file
        },
        value: './base/resources/test.txt'
      }
    };
    wrapper = mount(SmOpenFile, {
      localVue,
      propsData: {
        addToMap: false,
        clearLastLayer: true
      }
    });
    await mapSubComponentLoaded(wrapper);
    const errorFileFormatFn = jest.fn();
    expect(wrapper.find('#input_file').exists()).toBe(true);
    wrapper.vm.$on({ 'error-file-format': errorFileFormatFn });
    wrapper.vm.fileSelect(fileEventObject);
    expect(errorFileFormatFn.mock.called).toBeTruthy;
    done();
  });

  it('open csv data', async done => {
    jest.spyOn(global, 'FileReader').mockImplementation(function () {
      this.onloadend = function (event) {};
      const event = {
        target: {
          result: new ArrayBuffer(10)
        }
      };
      this.readAsArrayBuffer = function () {
        this.onloadend(event);
      };
    });
    const blob = new Blob([JSON.stringify(china)], {
      type: 'application/vnd.ms-excel'
    });
    const name = './base/resources/china.csv';
    const type = 'application/vnd.ms-excel';
    const file = new File([blob], name, {
      type: type
    });
    const fileEventObject = {
      target: {
        files: {
          0: file
        },
        value: './base/resources/china.csv'
      }
    };
    wrapper = mount(SmOpenFile, {
      localVue
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.find('.sm-component-open-file__input').exists()).toBe(true);
    wrapper.vm.fileSelect(fileEventObject);
    done();
  });
});
