import { mount, config } from '@vue/test-utils';
import SmLayerColor from '../LayerColor';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('LayerColor.vue', () => {
  let wrapper;
  let mapWrapper;

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

  it('filter layer type 统计图表', async done => {
    wrapper = mount(SmLayerColor, {
      propsData: {
        mapTarget: 'map',
        collapsed: false
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.filtercb('chart').show).toBe(false);
    done();
  });

  it('v3 复合图层', async done => {
    wrapper = mount(SmLayerColor, {
      propsData: {
        mapTarget: 'map',
        collapsed: false
      }
    });
    const sourceLayer = {
      id: 'layer1',
      type: 'fill',
      renderLayers: ['layer1', 'layer1-strokeLine', 'l7-symbol']
    };

    await mapSubComponentLoaded(wrapper);
    const styleFn = jest.fn();
    const colorFn = jest.fn();
    jest.spyOn(wrapper.vm.viewModel.map, 'getLayer').mockImplementation(id => {
      if (id === 'layer1') {
        return {
          id: 'ms-fill',
          title: 'radar1',
          type: 'fill'
        };
      }
      if (id === 'layer1-strokeLine') {
        return {
          id: 'me-label',
          title: 'radar1',
          type: 'line'
        };
      }
      if (id === 'l7-symbol') {
        return {
          id: 'me-symbol',
          title: 'radar1',
          type: 'symbol',
          l7layer: { style: styleFn, color: colorFn },
          reRender: jest.fn()
        };
      }
    });
    const setPaintProperty = jest.fn();
    wrapper.vm.viewModel.map.setPaintProperty = setPaintProperty;
    wrapper.vm.handleLayerChange(sourceLayer);

    expect(wrapper.vm.propertyList).toEqual({
      fill: [
        { color: '', name: 'fill-color' },
        { color: '', name: 'fill-outline-color' }
      ],
      line: [{ color: '', name: 'line-color' }],
      symbol: [
        { color: '', name: 'icon-color' },
        { color: '', name: 'icon-halo-color' },
        { color: '', name: 'text-color' },
        { color: '', name: 'text-halo-color' }
      ]
    });
    expect(wrapper.vm.selectLayer).toEqual(sourceLayer);

    wrapper.vm.changePropertyColor('fill-color', '#f00', 'fill');
    expect(setPaintProperty).toBeCalled();

    wrapper.vm.changePropertyColor('line-color', '#f00', 'line');
    expect(setPaintProperty).toBeCalled();

    wrapper.vm.changePropertyColor('text-color', '#f00', 'symbol');
    expect(colorFn).toBeCalled();

    wrapper.vm.changePropertyColor('text-halo-color', '#f00', 'symbol');
    expect(styleFn).toBeCalled();

    done();
  });

  it('render default correctly', async done => {
    wrapper = mount(SmLayerColor, {
      propsData: {
        mapTarget: 'map',
        collapsed: false
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('capture', async done => {
    wrapper = mount(SmLayerColor, {
      propsData: {
        mapTarget: 'map',
        collapsed: false
      }
    });
    await mapSubComponentLoaded(wrapper);
    wrapper.find('.sm-components-icon-layer-picker').trigger('click');
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('reset', async done => {
    wrapper = mount(SmLayerColor, {
      propsData: {
        mapTarget: 'map',
        collapsed: false
      }
    });
    await mapSubComponentLoaded(wrapper);
    wrapper.find('.sm-component-btn-primary').trigger('click');
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('changePropertyColor', async done => {
    wrapper = mount(SmLayerColor, {
      propsData: {
        mapTarget: 'map',
        collapsed: false
      }
    });
    await mapSubComponentLoaded(wrapper);
    jest.spyOn(wrapper.vm.viewModel.map, 'getLayer').mockImplementation(id => {
      return {
        id,
        title: 'radar1',
        type: 'fill'
      };
    });
    const sourceLayer = {
      id: 'layer1',
      type: 'fill',
      renderLayers: ['layer1', 'layer2']
    };
    wrapper.vm.handleLayerChange(sourceLayer);
    expect(wrapper.vm.propertyList).toEqual({
      fill: [
        { color: '', name: 'fill-color' },
        { color: '', name: 'fill-outline-color' }
      ]
    });
    expect(wrapper.vm.selectLayer).toEqual(sourceLayer);
    const spyFn = jest.spyOn(wrapper.vm.viewModel, 'setLayerColor');
    wrapper.vm.changePropertyColor('fill-color', '#f00', 'fill');
    expect(spyFn).toHaveBeenCalledTimes(2);
    done();
  });
});
