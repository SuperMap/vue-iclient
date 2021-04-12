import {
  mount,
  createLocalVue
} from '@vue/test-utils';
import SmWebMap from '../../web-map/WebMap';
import SmOpenFile from '../OpenFile.vue';
import mapEvent from '@types_mapboxgl/map-event';
import LineStyle from '../../_types/LineStyle'
import FillStyle from '../../_types/FillStyle'
import CircleStyle from '../../_types/CircleStyle'
import {
  message
} from 'ant-design-vue';

const localVue = createLocalVue()
localVue.prototype.$message = message;

describe('OpenFile.vue', () => {

  let wrapper;
  let mapWrapper;
  const china = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "properties": {
          "id": "81",
          "name": "香港",
          "cp": [
            114.2578,
            22.3242
          ],
          "childNum": 1
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                114.6094,
                22.4121
              ],

              [
                114.6094,
                22.4121
              ]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "id": "82",
          "name": "澳门",
          "cp": [
            113.5547,
            22.1484
          ],
          "childNum": 1
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                113.5986,
                22.1649
              ],

              [
                113.5986,
                22.1649
              ]
            ]
          ]
        }
      }
    ]
  };

  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    wrapper = null;
    jest.restoreAllMocks();
    mapWrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
  })

  afterEach(() => {
    jest.restoreAllMocks();
    if (wrapper && wrapper !== "undefined") {
      wrapper.destroy();
    }
    if (mapWrapper && mapWrapper !== "undefined") {
      mapWrapper.destroy();
    }
  })

  it('default', (done) => {
    const blob = new Blob([JSON.stringify(china)], {
      type: 'application/json'
    });
    const name = './base/resources/china.json';
    const type = 'application/json';
    const file = new File([blob], name, {
      type: type,
    });
    const fileEventObject = {
      target: {
        files: {
          0: file
        },
        value: "./base/resources/china.json"
      }
    };
    wrapper = mount(SmOpenFile, {
      localVue,
    });
    wrapper.vm.$on("loaded", () => {
      try {
        wrapper.vm.viewModel.readFile(fileEventObject);
        wrapper.vm.$on('openfilesucceeded', function (e) {
          try {
            expect(e.features.length).toBe(2);
            done();
          } catch (exception) {
            console.log("'readfile'案例失败：" + exception.name + ":" + exception.message);
            expect(false).toBeTruthy();
            done();
          }
        })
        expect(wrapper.vm.viewModel.readFile(fileEventObject)).toBeTruthy;
        done();
      } catch (exception) {
        console.log("Openfile_default" + exception.name + ":" + exception.message);
        expect(false).toBeTruthy();
        done();
      }
    })
  })


  it('custom setting', (done) => {
    let blob = new Blob([JSON.stringify(china)], {
      type: 'application/json'
    });
    let name = './base/resources/china.json';
    let type = 'application/json';
    let file = new File([blob], name, {
      type: type,
    });
    let fileEventObject = {
      target: {
        files: {
          0: file
        },
        value: "./base/resources/china.json"
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
    wrapper.vm.$on("loaded", () => {
      try {
        wrapper.vm.viewModel.readFile(fileEventObject);
        wrapper.vm.$on('openfilesucceeded', function (e) {
          try {
            expect(e.features.length).toBe(2);
            done();
          } catch (exception) {
            console.log("'readfile'案例失败：" + exception.name + ":" + exception.message);
            expect(false).toBeTruthy();
            done();
          }
        })
        expect(wrapper.vm.viewModel.readFile(fileEventObject)).toBeTruthy;
        done();
      } catch (exception) {
        console.log("Openfile_default" + exception.name + ":" + exception.message);
        expect(false).toBeTruthy();
        done();
      }
    })
  })

  it('fail', (done) => {
    let name = 'test.txt';
    let blob = new Blob(["This is my blob content"], {
      type: "text/plain"
    });
    let file = new File([blob], name, {
      type: "text/plain",
    });
    let fileEventObject = {
      target: {
        files: {
          0: file
        },
      }
    };
    wrapper = mount(SmOpenFile, {
      localVue,
      propsData: {
        addToMap: false,
        clearLastLayer: true
      }
    });
    wrapper.vm.$on("loaded", () => {
      try {
        wrapper.vm.viewModel.readFile(fileEventObject);
        wrapper.vm.$on('openfilefailed', function (e) {
          try {
            expect(e.message).toBe('File format is not supported!');
            done();
          } catch (exception) {
            console.log("'readfile'案例失败：" + exception.name + ":" + exception.message);
            expect(false).toBeTruthy();
            done();
          }
        })
        done();
      } catch (exception) {
        console.log("Openfile_default" + exception.name + ":" + exception.message);
        expect(false).toBeTruthy();
        done();
      }
    })
  })

})