import { mount } from '@vue/test-utils';
import SmAnimateMarkerLayer from '../AnimateMarkerLayer.vue';
import SmWebMap from '../../../WebMap.vue';
import mapEvent from '@types_mapboxgl/map-event';
import '@libs/mapboxgl/mapbox-gl-enhance';
const colors = ["rab(255,155,20)", "#3AD900", "#0080d9"];
const features = {
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
        海拔: '296'
      },
      type: 'Feature'
    }
  ],
  type: 'FeatureCollection'
};
describe('AnimateMarkerLayer.vue', () => {
  let wrapper;
  let mapWrapper;
  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    mapWrapper = mount(SmWebMap, {
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
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

  it('render', done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        textField: 'name'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          // const setStyleOptionsSpy = jest.spyOn(wrapper.vm.viewModel, 'setStyleOptions');
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('rotatingAperture', done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        textField: 'name',
        type: 'rotatingAperture',
        width:150,
        height:150,
        colors:colors
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          // const setStyleOptionsSpy = jest.spyOn(wrapper.vm.viewModel, 'setStyleOptions');
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('haloRing', done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        textField: 'name',
        type: 'haloRing',
        width:150,
        height:150,
        colors:colors
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          // const setStyleOptionsSpy = jest.spyOn(wrapper.vm.viewModel, 'setStyleOptions');
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('diffusedAperture', done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        textField: 'name',
        type: 'diffusedAperture',
        width:150,
        height:150,
        colors:colors
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          // const setStyleOptionsSpy = jest.spyOn(wrapper.vm.viewModel, 'setStyleOptions');
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('rotatingTextBorder', done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        textField: 'name',
        type: 'rotatingTextBorder',
        width:150,
        height:150,
        colors:colors
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          // const setStyleOptionsSpy = jest.spyOn(wrapper.vm.viewModel, 'setStyleOptions');
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('fluorescence', done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        textField: 'name',
        type: 'fluorescence',
        width:150,
        height:150,
        colors:colors
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('change fluorescence width', done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        type: 'fluorescence',
        width:150,
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            width: 600
          })
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('change fluorescence colors', done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        type: 'fluorescence'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            colors: ['#f00', '#f20']
          });
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('change rotatingTextBorder width', done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        width: 200,
        type: 'rotatingTextBorder'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            width: 400
          });
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('change rotatingTextBorder colors', done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        type: 'rotatingTextBorder'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            colors: ['#f00', '#f20']
          });
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('change rotatingAperture width', done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        width: 150,
        type: 'rotatingAperture'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            width: 600
          });
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('change rotatingAperture colors', done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        width: 150,
        type: 'rotatingAperture'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            colors: ['#f00', '#f20']
          });
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('change diffusedAperture width', done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        width: 150,
        type: 'diffusedAperture'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            width: 600
          });
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('change diffusedAperture colors', done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        width: 150,
        type: 'diffusedAperture'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            colors: ['#f00', '#f20']
          });
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });
  it('change breathingAperture width', done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        width: 150,
        type: 'breathingAperture'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            width: 600
          });
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('change breathingAperture color', done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        width: 150,
        type: 'breathingAperture'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            colors: ['#f00', '#f20']
          });
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('change haloRing width', done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        width: 150,
        type: 'haloRing'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            width: 600
          });
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('change haloRing colors', done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        width: 150,
        type: 'haloRing'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            colors: ['#f00', '#f20']
          });
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('change props', done => {
    const newFeatures = {
      features: [
        {
          geometry: {
            type: 'Point',
            coordinates: [122.36999999999999, 53.470000000000006]
          },
          properties: {
            SmID: '1',
            SmX: '1.3622166088372886E7'
          },
          type: 'Feature'
        }
      ],
      type: 'FeatureCollection'
    };
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        textField: 'name'
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          const setFeaturesSpy = jest.spyOn(wrapper.vm.viewModel, 'setFeatures');
          wrapper.setProps({
            features: newFeatures,
            type: 'fluorescence',
            width: 500,
            height: 500,
            textColor: '#fff',
            textFontSize: 18,
            textField: 'SmCard'
          })
          expect(setFeaturesSpy).toBeCalled();
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });
});
