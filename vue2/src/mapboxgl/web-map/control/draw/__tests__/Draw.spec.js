import { mount, config } from '@vue/test-utils';
import SmDraw from '../Draw.vue';
import LineStyle from 'vue-iclient-core/controllers/mapboxgl/types/LineStyle';
import CircleStyle from 'vue-iclient-core/controllers/mapboxgl/types/CircleStyle';
import FillStyle from 'vue-iclient-core/controllers/mapboxgl/types/FillStyle';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('Draw.vue', () => {
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

  it('render default correctly', async done => {
    wrapper = mount(SmDraw, {
      propsData: {
        mapTarget: 'map'
      },
      sync: false
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('start draw', async done => {
    wrapper = mount(SmDraw, {
      propsData: {
        mapTarget: 'map',
        collapsed: false
      },
      sync: false
    });
    await mapSubComponentLoaded(wrapper);
    const drawItem = wrapper.find('.sm-component-draw__draw-item');
    expect(drawItem.exists()).toBe(true);
    expect(wrapper.vm.mapTarget).toBe('map');
    drawItem.trigger('click');
    setTimeout(() => {
      done();
    }, 500);
  });

  it('change layerStyle', async done => {
    const newLayerStyle = {
      circle: new CircleStyle({
        'circle-radius': 6,
        'circle-color': '#3fb1e3',
        'circle-opacity': 1
      }),
      line: new LineStyle({
        'line-opacity': 1,
        'line-color': '#3fb1e3'
      }),
      fill: new FillStyle({
        'fill-opacity': 0.8,
        'fill-color': '#3fb1e3',
        'fill-translate': [0, 0]
      })
    };
    wrapper = mount(SmDraw, {
      propsData: {
        mapTarget: 'map',
        collapsed: false
      },
      sync: false
    });
    await mapSubComponentLoaded(wrapper);
    wrapper.setProps({
      layerStyle: newLayerStyle
    });
    setTimeout(() => {
      done();
    }, 500);
  });
});
