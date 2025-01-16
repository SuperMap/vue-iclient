import { mount, config } from '@vue/test-utils';
import SmAnimateMarkerLayer from '../AnimateMarkerLayer.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('AnimateMarkerLayer.vue', () => {
  let wrapper;
  let mapWrapper;
  const colors = ['rab(255,155,20)', '#3AD900', '#0080d9'];
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

  beforeAll(async () => {
    config.mapLoad = false;
    mapWrapper = await createEmptyMap();
  });

  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

  it('render', async done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        textField: 'name'
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('rotatingAperture', async done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        textField: 'name',
        type: 'rotatingAperture',
        width: 150,
        height: 150,
        colors: colors
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    expect(wrapper.vm.viewModel.markersElement[0].className.includes('smanimatemarkerlayer-')).toBe(true);
    done();
  });

  it('haloRing', async done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        textField: 'name',
        type: 'haloRing',
        width: 150,
        height: 150,
        colors: colors
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    expect(wrapper.vm.viewModel.markersElement[0].className.includes('smanimatemarkerlayer-')).toBe(true);
    done();
  });

  it('diffusedAperture', async done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        textField: 'name',
        type: 'diffusedAperture',
        width: 150,
        height: 150,
        colors: colors
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    expect(wrapper.vm.viewModel.markersElement[0].className.includes('smanimatemarkerlayer-')).toBe(true);
    done();
  });

  it('rotatingTextBorder', async done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        textField: 'name',
        type: 'rotatingTextBorder',
        width: 150,
        height: 150,
        colors: colors
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    expect(wrapper.vm.viewModel.markersElement[0].className.includes('smanimatemarkerlayer-')).toBe(true);
    done();
  });

  it('fluorescence', async done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        textField: 'name',
        type: 'fluorescence',
        width: 150,
        height: 150,
        colors: colors
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    expect(wrapper.vm.viewModel.markersElement[0].className.includes('smanimatemarkerlayer-')).toBe(true);
    done();
  });

  it('change fluorescence width', async done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        type: 'fluorescence',
        width: 150
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      width: 600
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change fluorescence colors', async done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        type: 'fluorescence'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      colors: ['#f00', '#f20']
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change rotatingTextBorder width', async done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        width: 200,
        type: 'rotatingTextBorder'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      width: 400
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change rotatingTextBorder colors', async done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        type: 'rotatingTextBorder'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      colors: ['#f00', '#f20']
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change rotatingAperture width', async done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        width: 150,
        type: 'rotatingAperture'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      width: 600
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change rotatingAperture colors', async done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        width: 150,
        type: 'rotatingAperture'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      colors: ['#f00', '#f20']
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change diffusedAperture width', async done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        width: 150,
        type: 'diffusedAperture'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      width: 600
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change diffusedAperture colors', async done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        width: 150,
        type: 'diffusedAperture'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      colors: ['#f00', '#f20']
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change breathingAperture width', async done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        width: 150,
        type: 'breathingAperture'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      width: 600
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change breathingAperture color', async done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        width: 150,
        type: 'breathingAperture'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      colors: ['#f00', '#f20']
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change haloRing width', async done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        width: 150,
        type: 'haloRing'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      width: 600
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change haloRing colors', async done => {
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        features,
        width: 150,
        type: 'haloRing'
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      colors: ['#f00', '#f20']
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change props', async done => {
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
    await mapSubComponentLoaded(wrapper);
    const setFeaturesSpy = jest.spyOn(wrapper.vm.viewModel, 'setFeatures');
    await wrapper.setProps({
      features: newFeatures,
      type: 'fluorescence',
      width: 500,
      height: 500,
      textColor: '#fff',
      textFontSize: 18,
      textField: 'SmCard'
    });
    expect(setFeaturesSpy).toBeCalled();
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change features fitBounds', async done => {
    const newFeatures= {
      features: [
        {
          geometry: {
            type: 'Point',
            coordinates: [122, 53]
          },
          properties: {
            SmID: '10'
          },
          type: 'Feature'
        }
      ],
      type: 'FeatureCollection'
    };
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        textField: 'name'
      }
    });
    await mapSubComponentLoaded(wrapper);
    const mockFn = jest.fn();
    wrapper.vm.viewModel._createMarker = mockFn;
    await wrapper.setProps({
      features
    });
    expect(mockFn.mock.calls).toEqual([[true]]);
    await wrapper.setProps({
      features: newFeatures
    });
    expect(mockFn.mock.calls).toEqual([[ true ], [ false ]]);
    done();
  });

  it('test layerId', async done => {
    const newFeatures= {
      features: [
        {
          geometry: {
            type: 'Point',
            coordinates: [122, 53]
          },
          properties: {
            SmID: '10'
          },
          type: 'Feature'
        }
      ],
      type: 'FeatureCollection'
    };
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        mapTarget: 'map',
        textField: 'name',
        layerId: 'test-id'
      }
    });
    await mapSubComponentLoaded(wrapper);
    const mockFn = jest.fn();
    wrapper.vm.viewModel._createMarker = mockFn;
    await wrapper.setProps({
      features: newFeatures
    });
    expect(mockFn.mock.calls).toEqual([[true]]);
    expect(wrapper.vm.viewModel.layerId).toBe('test-id');
    done();
  });

  it('change layerId', async done => {
    const newFeatures= {
      features: [
        {
          geometry: {
            type: 'Point',
            coordinates: [122, 53]
          },
          properties: {
            SmID: '10'
          },
          type: 'Feature'
        }
      ],
      type: 'FeatureCollection'
    };
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        features: newFeatures,
        mapTarget: 'map',
        textField: 'name',
        layerId: 'test-id1'
      }
    });
    const spy = jest.spyOn(wrapper.vm.viewModel, 'setLayerId');
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      layerId: 'test-id2'
    });
    expect(spy).toHaveBeenCalled();
    expect(wrapper.vm.viewModel.layerId).toBe('test-id2');
    done();
  });

  it('change marker opacity', async done => {
    const newFeatures= {
      features: [
        {
          geometry: {
            type: 'Point',
            coordinates: [122, 53]
          },
          properties: {
            SmID: '10'
          },
          type: 'Feature'
        }
      ],
      type: 'FeatureCollection'
    };
    wrapper = mount(SmAnimateMarkerLayer, {
      propsData: {
        features: newFeatures,
        mapTarget: 'map',
        textField: 'name',
        layerId: 'test-id1'
      }
    });
    await mapSubComponentLoaded(wrapper);
    jest.spyOn(wrapper.vm.map, 'getLayer').mockImplementation(() => {
      return {
        visibility: 'visible',
        getPaintProperty() {
          return 0.5;
        }
      };
    });
    const spy2 = jest.spyOn(wrapper.vm.viewModel.markers[0], 'getElement').mockImplementation(() => {
      return {
       style: {
        display: 'block',
        opacity: undefined
       }
      };
    });
    wrapper.vm.viewModel._updateLayer();
    expect(spy2).toHaveBeenCalledTimes(3);
    done();
  });
});
