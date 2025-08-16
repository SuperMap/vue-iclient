import { mount, config } from '@vue/test-utils';
import SmBaseLayerSwitcher from '../BaseLayerSwitcher.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded';
import cloneDeep from 'lodash.clonedeep';

describe('SmBaseLayerSwitcher', () => {
  let wrapper;
  let mapWrapper;
  const layerToAdd = {
    type: 'raster',
    id: 'China',
    source: {
      type: 'raster',
      tiles: ['http://test']
    }
  };
  const layers = [
    {
      thumbnail: './static/material/image/image112.png',
      sources: {
        wmts100: {
          tiles: [
            'http://localhost:8195/portalproxy/97d2edb85b0cb5d4/iserver/services/map-China100-2/wmts100?service=WMTS&request=GetTile&version=1.0.0&style=default&layer=China&tilematrixSet=Custom_China&format=image%2Fpng&tilematrix={z}&tilerow={y}&tilecol={x}'
          ],
          maxzoom: 12,
          tileSize: 256,
          bounds: [-180, -85.05112877980652, 180, 85.05112877980648],
          type: 'raster',
          minzoom: 0
        }
      },
      layers: [
        {
          maxzoom: 12,
          id: 'wmts100',
          source: 'wmts100',
          type: 'raster',
          minzoom: 0
        }
      ],
      id: '08fe7910710711f08319296972a93911',
      title: 'wmts100'
    },
    {
      thumbnail: '',
      sources: {
        'map-test4490/wmts100': {
          tiles: [
            'http://localhost:8195/portalproxy/ece28f3745965e6e/iserver/services/map-test4490/wmts100?service=WMTS&request=GetTile&version=1.0.0&style=default&layer=Countries&tilematrixSet=GoogleMapsCompatible_Countries&format=image%2Fpng&tilematrix={z}&tilerow={y}&tilecol={x}'
          ],
          maxzoom: 22,
          tileSize: 256,
          bounds: [-180, -90, 180, 83.62359619140625],
          type: 'raster',
          minzoom: 0
        }
      },
      layers: [
        {
          maxzoom: 22,
          id: 'map-test4490/wmts100',
          source: 'map-test4490/wmts100',
          type: 'raster',
          minzoom: 0
        }
      ],
      id: 'c4317580710b11f0853c9fffbfac1622',
      title: 'map-test4490/wmts100'
    }
  ];

  beforeAll(() => {
    wrapper = null;
    config.mapLoad = false;
  });

  beforeEach(() => {
    wrapper = null;
    mapWrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    config.mapLoad = false;
    if (wrapper) {
      wrapper.destroy();
    }
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  afterAll(() => {
    config.mapLoad = true;
  });

  it('render default correctly', async done => {
    mapWrapper = await createEmptyMap();
    mapWrapper.vm.viewModel.map.addLayer(layerToAdd);
    wrapper = mount(SmBaseLayerSwitcher, {
      propsData: {
        layers: cloneDeep(layers),
        defaultLayer: '08fe7910710711f08319296972a93911'
      }
    });
    await mapSubComponentLoaded(wrapper);
    const layerItems = wrapper.findAll('.layer-item');
    expect(layerItems.length).toBe(3);
    expect(layerItems.at(1).contains('.active-item')).toBe(true);
    done();
  });

  it('change baseLayer', async done => {
    mapWrapper = await createEmptyMap();
    mapWrapper.vm.viewModel.map.addLayer(layerToAdd);
    wrapper = mount(SmBaseLayerSwitcher, {
      propsData: {
        layers: cloneDeep(layers)
      }
    });
    await mapSubComponentLoaded(wrapper);
    const layerItems = wrapper.findAll('.layer-item');
    expect(layerItems.length).toBe(3);
    expect(layerItems.at(0).contains('.active-item')).toBe(true);
    layerItems.at(1).trigger('click');
    expect(layerItems.at(1).contains('.active-item')).toBe(true);
    done();
  });

  it('change layers when otherlayer is selected', async done => {
    mapWrapper = await createEmptyMap();
    mapWrapper.vm.viewModel.map.addLayer(layerToAdd);
    wrapper = mount(SmBaseLayerSwitcher, {
      propsData: {
        layers: cloneDeep(layers),
        defaultLayer: '08fe7910710711f08319296972a93911'
      }
    });
    await mapSubComponentLoaded(wrapper);
    let layerItems = wrapper.findAll('.layer-item');
    expect(layerItems.length).toBe(3);
    expect(layerItems.at(1).contains('.active-item')).toBe(true);
    expect(wrapper.vm.selectedId).toBe(layers[0].id);
    const nextLayers = cloneDeep(layers.slice(1));
    wrapper.setProps({
      layers: nextLayers
    });
    await wrapper.vm.$nextTick();
    layerItems = wrapper.findAll('.layer-item');
    expect(layerItems.length).toBe(2);
    expect(layerItems.at(0).contains('.active-item')).toBe(true);
    expect(wrapper.vm.selectedId).toBe(wrapper.vm.baseLayer.id);
    done();
  });

  it('change layers when baselayer is selected', async done => {
    mapWrapper = await createEmptyMap();
    mapWrapper.vm.viewModel.map.addLayer(layerToAdd);
    wrapper = mount(SmBaseLayerSwitcher, {
      propsData: {
        layers: cloneDeep(layers)
      }
    });
    await mapSubComponentLoaded(wrapper);
    let layerItems = wrapper.findAll('.layer-item');
    expect(layerItems.length).toBe(3);
    expect(layerItems.at(0).contains('.active-item')).toBe(true);
    expect(wrapper.vm.selectedId).toBe(wrapper.vm.baseLayer.id);
    const nextLayers = cloneDeep(layers.slice(1));
    wrapper.setProps({
      layers: nextLayers
    });
    await wrapper.vm.$nextTick();
    layerItems = wrapper.findAll('.layer-item');
    expect(layerItems.length).toBe(2);
    expect(layerItems.at(0).contains('.active-item')).toBe(true);
    expect(wrapper.vm.selectedId).toBe(wrapper.vm.baseLayer.id);
    done();
  });

  it ('not show origin layer', async (done) => {
    mapWrapper = await createEmptyMap();
    mapWrapper.vm.viewModel.map.addLayer(layerToAdd);
    wrapper = mount(SmBaseLayerSwitcher, {
      propsData: {
        layers: cloneDeep(layers),
        baseLayerInfo: {
          show: false,
          title: '',
          thumbnail: ''
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    const layerItems = wrapper.findAll('.layer-item');
    expect(layerItems.length).toBe(2);
    const activeItem = wrapper.find('.layer-item.active-item');
    expect(activeItem.exists()).toBe(false);
    layerItems.at(0).trigger('click');
    expect(layerItems.at(0).contains('.active-item')).toBe(true);
    expect(layerItems.at(1).contains('.active-item')).toBe(false);
    wrapper.setProps({
      layers: cloneDeep(layers).slice(1)
    });
    const nextLayerItems = wrapper.findAll('.layer-item');
    expect(nextLayerItems.length).toBe(1);
    expect(nextLayerItems.at(0).contains('.active-item')).toBe(false);
    expect(wrapper.vm.selectedId).toBe(wrapper.vm.baseLayer.id);
    done();
  });

  it ('empty layers', async (done) => {
    mapWrapper = await createEmptyMap();
    wrapper = mount(SmBaseLayerSwitcher, {
      propsData: {
        layers: cloneDeep(layers),
        baseLayerInfo: {
          show: false,
          title: '',
          thumbnail: ''
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    const layerItems = wrapper.findAll('.layer-item');
    expect(layerItems.length).toBe(2);
    done();
  });

  it ('set baselayer thumbnail', async (done) => {
    mapWrapper = await createEmptyMap();
    mapWrapper.vm.viewModel.map.addLayer(layerToAdd);
    wrapper = mount(SmBaseLayerSwitcher, {
      propsData: {
        baseLayerInfo: {
          show: true,
          title: 'custom-title',
          thumbnail: 'http://fake.png'
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    const layerItems = wrapper.findAll('.layer-item');
    expect(layerItems.length).toBe(1);
    expect(wrapper.vm.displayLayers.length).toBe(1);
    expect(wrapper.vm.displayLayers[0].thumbnail).toBe('http://fake.png');
    done();
  });

  it ('set baselayer title', async (done) => {
    mapWrapper = await createEmptyMap();
    mapWrapper.vm.viewModel.map.addLayer(layerToAdd);
    wrapper = mount(SmBaseLayerSwitcher, {
      propsData: {
        baseLayerInfo: {
          show: true,
          title: 'custom-title',
          thumbnail: 'http://fake.png'
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    const layerItems = wrapper.findAll('.layer-item');
    expect(layerItems.length).toBe(1);
    expect(wrapper.vm.displayLayers.length).toBe(1);
    expect(wrapper.vm.displayLayers[0].title).toBe('custom-title');
    expect(wrapper.vm.baseLayer.title).toBe('custom-title');
    wrapper.vm.viewModel.baseLayer.layers = [
      {
        id: 'custom-layer',
        type: 'raster',
        metadata: {
          title: 'title1'
        }
      }
    ];
    wrapper.setProps({
      baseLayerInfo: {
        show: false,
        title: 'custom-title',
        thumbnail: 'http://fake.png'
      }
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.layer-item').length).toBe(0);
    expect(wrapper.vm.displayLayers.length).toBe(0);
    expect(wrapper.vm.baseLayer.title).not.toBe('custom-title');
    expect(wrapper.vm.baseLayer.layers[0].metadata.title).not.toBe('custom-title');
    expect(wrapper.vm.baseLayer.layers[0].metadata.title).toBe('title1');
    wrapper.setProps({
      baseLayerInfo: {
        show: true,
        title: 'custom-title',
        thumbnail: 'http://fake.png'
      }
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.layer-item').length).toBe(1);
    expect(wrapper.vm.displayLayers.length).toBe(1);
    expect(wrapper.vm.baseLayer.title).toBe('custom-title');
    expect(wrapper.vm.baseLayer.layers[0].metadata.title).toBe('custom-title');
    done();
  });
});

