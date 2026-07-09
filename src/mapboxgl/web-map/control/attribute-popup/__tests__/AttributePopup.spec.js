import { mount, config } from '@vue/test-utils';
import SmAttributePopup from '../AttributePopup.vue';
import AttributePopup from '../index';
import mapEvent from 'vue-iclient/src/mapboxgl/_types/map-event';
import { addListener, removeListener } from 'resize-detector';

const eventHandlers = {};

const createMockViewModel = () => ({
  on: jest.fn((event, handler) => {
    eventHandlers[event] = handler;
  }),
  setTargetLayers: jest.fn(),
  setHighlightStyle: jest.fn(),
  setMultiSelection: jest.fn(),
  setFeatureFieldsMap: jest.fn(),
  setDisplayFieldsMap: jest.fn(),
  setClickTolerance: jest.fn(),
  queryFeaturesByLayerId: jest.fn(),
  setHighlightLayerFilter: jest.fn(),
  clear: jest.fn(),
  setMap: jest.fn(),
  webmap: {
    _handler: {
      getPopupInfos: jest.fn().mockReturnValue([])
    }
  }
});

jest.mock('../AttributePopupViewModel', () => {
  return jest.fn().mockImplementation(() => createMockViewModel());
});

jest.mock('vue-iclient/src/common/_utils/util', () => ({
  setPopupArrowStyle: jest.fn()
}));

jest.mock('resize-detector', () => ({
  addListener: jest.fn(),
  removeListener: jest.fn()
}));

describe('AttributePopup.vue', () => {
  let wrapper;

  const popupInfosFixture = [
    {
      title: 'Point Layer',
      layerId: 'layer1',
      identifyField: 'name'
    },
    {
      title: 'Line Layer',
      layerId: ['layer2', 'layer2-strokeLine']
    }
  ];

  beforeEach(() => {
    config.mapLoad = false;
    wrapper = null;
    Object.keys(eventHandlers).forEach(key => delete eventHandlers[key]);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    config.mapLoad = true;
    if (wrapper) {
      wrapper.destroy();
    }
  });

  const mountPopup = (propsData = {}, options = {}) => {
    return mount(AttributePopup, {
      propsData,
      stubs: {
        PopupContent: {
          template: '<div class="popup-content-stub" ref="content"></div>'
        },
        SelectLayer: {
          name: 'SmSelectLayer',
          template: '<div class="select-layer-stub"></div>',
          props: ['show', 'layerInfos']
        },
        ...options.stubs
      },
      ...options
    });
  };

  it('render index correctly', () => {
    wrapper = mountPopup();
    expect(wrapper.find('.sm-component-attribute-popup').exists()).toBeTruthy();
  });

  it('renders with default props', () => {
    wrapper = mountPopup();
    expect(wrapper.vm.clickTolerance).toBe(5);
    expect(wrapper.vm.multiSelect).toBe(false);
    expect(wrapper.vm.useMapPopup).toBe(true);
    expect(wrapper.vm.popupInfos).toEqual([]);
    expect(wrapper.vm.popupConfig).toEqual({});
  });

  it('renders with custom props', () => {
    wrapper = mount(SmAttributePopup, {
      propsData: {
        clickTolerance: 10,
        multiSelect: true,
        popupConfig: {
          width: '400px',
          height: '300px'
        }
      },
      stubs: { PopupContent: true, SelectLayer: true }
    });
    expect(wrapper.vm.clickTolerance).toBe(10);
    expect(wrapper.vm.multiSelect).toBe(true);
  });

  it('normalizes popupInfosValue and filters strokeLine ids', () => {
    wrapper = mountPopup({
      useMapPopup: false,
      popupInfos: [
        { title: 'Layer A', layerId: 'layer-a' },
        { title: 'Layer B', layerId: ['layer-b', 'layer-b-strokeLine'] }
      ]
    });
    expect(wrapper.vm.popupInfosValue).toEqual([
      { title: 'Layer A', layerId: ['layer-a'] },
      { title: 'Layer B', layerId: ['layer-b'] }
    ]);
    expect(wrapper.vm.highlightLayerIds).toEqual(['layer-a', 'layer-b']);
    expect(wrapper.vm.sourceLayers).toEqual([['layer-a'], ['layer-b']]);
  });

  it('uses map popup config when useMapPopup is true', () => {
    wrapper = mountPopup({ useMapPopup: true });
    expect(wrapper.vm.popupConfigValue).toEqual({
      maxHeight: '394px',
      maxWidth: '280px',
      autoResize: true,
      valueWordWrap: 'wrap'
    });
  });

  it('computes selectedLayers and showPopupContent', async () => {
    wrapper = mountPopup({
      useMapPopup: false,
      popupInfos: popupInfosFixture
    });
    wrapper.vm.clickedLayers = [{ id: 'layer1', type: 'circle' }];
    wrapper.vm.showSelectLayer = false;
    wrapper.vm.currentLayerId = 'layer1';
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isSelectLayer).toBe(true);
    expect(wrapper.vm.selectedLayers).toEqual([
      { id: 'layer1', type: 'circle', name: 'Point Layer' }
    ]);
    expect(wrapper.vm.showPopupContent).toBe(true);
    expect(wrapper.vm.currentLayerName).toBe('Point Layer');
    expect(wrapper.vm.popupInfo.title).toBe('Point Layer');
    expect(wrapper.vm.identifyField).toBe('name');
  });

  it('computes enablePopupDatas and pagination content', () => {
    wrapper = mountPopup();
    wrapper.vm.allPopupDatas = [
      [{ title: 'name', value: 'A' }],
      [{ title: 'name', value: 'B' }]
    ];
    wrapper.vm.allPupDatasDisabled = [false, true];
    wrapper.vm.lnglats = [[1, 1], [2, 2]];
    wrapper.vm.currentIndex = 0;

    expect(wrapper.vm.enablePopupDatasLength).toBe(1);
    expect(wrapper.vm.paginationContent).toBe('1/1');
    expect(wrapper.vm.currentData).toEqual([{ title: 'name', value: 'A' }]);
    expect(wrapper.vm.enableLngLats).toEqual([[1, 1]]);
  });

  it('show popup content when isRender is true', async () => {
    wrapper = mountPopup({
      popupConfig: { width: '400px' }
    });
    wrapper.vm.isRender = true;
    wrapper.vm.showSelectLayer = false;
    wrapper.vm.currentLayerId = 'layer1';
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.content').exists()).toBeTruthy();
  });

  it('hide popup content when isRender is false', async () => {
    wrapper = mountPopup();
    wrapper.vm.isRender = false;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.sm-component-attribute-popup').isVisible()).toBe(false);
  });

  it('showSelectLayer works correctly', async () => {
    wrapper = mountPopup({
      useMapPopup: false,
      popupInfos: popupInfosFixture
    });
    expect(wrapper.vm.showSelectLayer).toBe(true);
    wrapper.vm.clickedLayers = [{ id: 'layer1', type: 'circle' }];
    await wrapper.vm.$nextTick();
    expect(wrapper.find({ name: 'SmSelectLayer' }).exists()).toBeTruthy();
    wrapper.vm.handleClose();
    expect(wrapper.vm.showSelectLayer).toBe(false);
  });

  it('changeIndex updates currentIndex', async () => {
    wrapper = mountPopup({
      popupInfos: [
        { title: 'Layer1', layerId: 'layer1' },
        { title: 'Layer2', layerId: 'layer2' },
        { title: 'Layer3', layerId: 'layer3' }
      ]
    });
    wrapper.vm.allPopupDatas = [
      [{ properties: { id: 1 } }],
      [{ properties: { id: 2 } }],
      [{ properties: { id: 3 } }]
    ];
    wrapper.vm.currentIndex = 1;
    await wrapper.vm.$nextTick();
    wrapper.vm.changeIndex(1);
    expect(wrapper.vm.currentIndex).toBe(2);
    wrapper.vm.changeIndex(-1);
    expect(wrapper.vm.currentIndex).toBe(1);
  });

  it('changeIndex does not go below 0', async () => {
    wrapper = mountPopup();
    wrapper.vm.allPopupDatas = [[{ properties: { id: 1 } }]];
    wrapper.vm.currentIndex = 0;
    await wrapper.vm.$nextTick();
    wrapper.vm.changeIndex(-1);
    expect(wrapper.vm.currentIndex).toBe(0);
  });

  it('changeIndex does not exceed max index', async () => {
    wrapper = mountPopup();
    wrapper.vm.allPopupDatas = [
      [{ properties: { id: 1 } }],
      [{ properties: { id: 2 } }]
    ];
    wrapper.vm.currentIndex = 1;
    await wrapper.vm.$nextTick();
    wrapper.vm.changeIndex(1);
    expect(wrapper.vm.currentIndex).toBe(1);
  });

  it('handleClose resets state', async () => {
    wrapper = mountPopup();
    wrapper.vm.removePopup = jest.fn();
    wrapper.vm.removed = jest.fn();
    wrapper.vm.showSelectLayer = true;
    wrapper.vm.currentLayerId = 'test-layer';
    wrapper.vm.handleClose();
    expect(wrapper.vm.showSelectLayer).toBe(false);
    expect(wrapper.vm.currentLayerId).toBe('');
    expect(wrapper.vm.removePopup).toHaveBeenCalled();
    expect(wrapper.vm.removed).toHaveBeenCalled();
  });

  it('handleSelect sets layer and queries features', () => {
    wrapper = mountPopup();
    wrapper.vm.handleSelect('layer1');
    expect(wrapper.vm.currentLayerId).toBe('layer1');
    expect(wrapper.vm.showSelectLayer).toBe(false);
    expect(wrapper.vm.viewModel.queryFeaturesByLayerId).toHaveBeenCalledWith('layer1');
  });

  it('handleReturn shows select layer and clears current layer', () => {
    wrapper = mountPopup();
    wrapper.vm.removed = jest.fn();
    wrapper.vm.currentLayerId = 'layer1';
    wrapper.vm.handleReturn();
    expect(wrapper.vm.showSelectLayer).toBe(true);
    expect(wrapper.vm.currentLayerId).toBe('');
    expect(wrapper.vm.removed).toHaveBeenCalled();
  });

  it('handleCheckedChange updates highlight filter and disabled state', () => {
    wrapper = mountPopup({
      useMapPopup: false,
      popupInfos: [{ title: 'Layer1', layerId: 'layer1', identifyField: 'name' }]
    });
    wrapper.vm.currentLayerId = 'layer1';
    wrapper.vm.identifyFieldsOptions = [
      { label: 'A', value: 'A', checked: true },
      { label: 'B', value: 'B', checked: false }
    ];
    wrapper.vm.handleCheckedChange({ target: { checked: false } }, 0);
    expect(wrapper.vm.viewModel.setHighlightLayerFilter).toHaveBeenCalledWith('layer1', {
      field: 'name',
      values: ['A']
    });
    expect(wrapper.vm.allPupDatasDisabled[0]).toBe(true);
  });

  describe('getCurrentLayerId', () => {
    it('returns empty when no clicked layers', () => {
      wrapper = mountPopup();
      expect(wrapper.vm.getCurrentLayerId()).toBe('');
    });

    it('returns currentLayerId in secondary multiple click mode', () => {
      wrapper = mountPopup({
        useMapPopup: false,
        popupInfos: popupInfosFixture
      });
      wrapper.vm.clickedLayers = [{ id: 'layer1', type: 'circle' }];
      wrapper.vm.isSecMultipleClick = true;
      wrapper.vm.currentLayerId = 'layer1';
      expect(wrapper.vm.getCurrentLayerId()).toBe('layer1');
    });

    it('returns single clicked layer id when only one selected layer', () => {
      wrapper = mountPopup({
        useMapPopup: false,
        popupInfos: popupInfosFixture
      });
      wrapper.vm.clickedLayers = [{ id: 'layer1', type: 'circle' }];
      wrapper.vm.isSecMultipleClick = false;
      expect(wrapper.vm.getCurrentLayerId()).toBe('layer1');
    });

    it('returns empty when multiple selected layers exist', () => {
      wrapper = mountPopup({
        useMapPopup: false,
        popupInfos: popupInfosFixture
      });
      wrapper.vm.clickedLayers = [
        { id: 'layer1', type: 'circle' },
        { id: 'layer2', type: 'line' }
      ];
      expect(wrapper.vm.getCurrentLayerId()).toBe('');
    });
  });

  it('loaded method calls lodedCb and registers mapEvent listener', async () => {
    wrapper = mountPopup();
    const lodedCbSpy = jest.spyOn(wrapper.vm, 'lodedCb');
    const onSpy = jest.spyOn(mapEvent, '$on');
    const mockWebmap = {
      _handler: {
        getPopupInfos: jest.fn().mockReturnValue([{ title: 'test', layerId: 'layer1' }])
      }
    };
    wrapper.vm.viewModel = {
      ...createMockViewModel(),
      webmap: mockWebmap
    };
    wrapper.vm.$options.loaded.call(wrapper.vm);
    expect(lodedCbSpy).toHaveBeenCalled();
    expect(onSpy).toHaveBeenCalledWith('load-webmap-view-model', wrapper.vm.lodedCb);
    onSpy.mockRestore();
  });

  it('lodedCb removes popup and sets layer ids', async () => {
    wrapper = mountPopup();
    wrapper.vm.removePopup = jest.fn();
    wrapper.vm.removed = jest.fn();
    wrapper.vm.setLayerIds = jest.fn();
    const mockWebmap = {
      _handler: {
        getPopupInfos: jest.fn().mockReturnValue([{ title: 'test', layerId: 'layer1' }])
      }
    };
    wrapper.vm.viewModel = {
      ...createMockViewModel(),
      webmap: mockWebmap
    };
    wrapper.vm.lodedCb(mockWebmap);
    expect(wrapper.vm.removePopup).toHaveBeenCalled();
    expect(wrapper.vm.removed).toHaveBeenCalled();
    expect(mockWebmap._handler.getPopupInfos).toHaveBeenCalled();
    expect(wrapper.vm.setLayerIds).toHaveBeenCalledWith(wrapper.vm.highlightLayerIds, wrapper.vm.sourceLayers);
    expect(wrapper.vm.mapPopupInfos).toEqual([{ title: 'test', layerId: 'layer1' }]);
  });

  it('lodedCb uses default webmap when no argument passed', async () => {
    wrapper = mountPopup();
    wrapper.vm.removePopup = jest.fn();
    wrapper.vm.removed = jest.fn();
    wrapper.vm.setLayerIds = jest.fn();
    const mockWebmap = {
      _handler: {
        getPopupInfos: jest.fn().mockReturnValue([{ title: 'test', layerId: 'layer1' }])
      }
    };
    wrapper.vm.viewModel = {
      ...createMockViewModel(),
      webmap: mockWebmap
    };
    wrapper.vm.lodedCb();
    expect(mockWebmap._handler.getPopupInfos).toHaveBeenCalled();
  });

  describe('watchers and events', () => {
    it('handles useMapPopup change', async () => {
      wrapper = mountPopup({ useMapPopup: true });
      wrapper.vm.removePopup = jest.fn();
      wrapper.vm.removed = jest.fn();
      await wrapper.setProps({ useMapPopup: false });
      expect(wrapper.vm.removePopup).toHaveBeenCalled();
      expect(wrapper.vm.removed).toHaveBeenCalled();
    });

    it('adds popup when currentCoordinate changes', async () => {
      wrapper = mountPopup();
      wrapper.vm.addPopup = jest.fn();
      wrapper.vm.currentCoordinate = [110, 30];
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.addPopup).toHaveBeenCalled();
    });

    it('updates target layers when highlightLayerIds change', async () => {
      wrapper = mountPopup({
        useMapPopup: false,
        popupInfos: [{ title: 'Layer1', layerId: 'layer1' }]
      });
      await wrapper.setProps({
        popupInfos: [{ title: 'Layer2', layerId: 'layer2' }]
      });
      expect(wrapper.vm.viewModel.setTargetLayers).toHaveBeenCalled();
    });

    it('updates viewModel when layerStyle, multiSelect and clickTolerance change', async () => {
      wrapper = mountPopup();
      await wrapper.setProps({
        layerStyle: { circle: { paint: {} } },
        multiSelect: true,
        clickTolerance: 8
      });
      expect(wrapper.vm.viewModel.setHighlightStyle).toHaveBeenCalled();
      expect(wrapper.vm.viewModel.setMultiSelection).toHaveBeenCalled();
      expect(wrapper.vm.viewModel.setClickTolerance).toHaveBeenCalledWith(8);
    });

    it('handles clickedLngLat watcher', async () => {
      wrapper = mountPopup({
        useMapPopup: false,
        popupInfos: popupInfosFixture
      });
      wrapper.vm.removePopup = jest.fn();
      wrapper.vm.clickedLayers = [{ id: 'layer1', type: 'circle' }];
      wrapper.vm.clickedLngLat = { lng: 110, lat: 30 };
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.removePopup).toHaveBeenCalled();
      expect(wrapper.vm.currentLayerId).toBe('layer1');
      expect(wrapper.vm.viewModel.queryFeaturesByLayerId).toHaveBeenCalledWith('layer1');
      expect(wrapper.vm.currentCoordinate).toEqual([110, 30]);
    });

    it('hides select layer when only one selected layer matches', async () => {
      wrapper = mountPopup({
        useMapPopup: false,
        popupInfos: popupInfosFixture
      });
      wrapper.vm.clickedLayers = [{ id: 'layer1', type: 'circle' }];
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.showSelectLayer).toBe(false);
    });

    it('keeps select layer visible when multiple layers match', async () => {
      wrapper = mountPopup({
        useMapPopup: false,
        popupInfos: popupInfosFixture
      });
      wrapper.vm.clickedLayers = [
        { id: 'layer1', type: 'circle' },
        { id: 'layer2', type: 'line' }
      ];
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.showSelectLayer).toBe(true);
    });

    it('hides select layer in secondary multiple click mode', async () => {
      wrapper = mountPopup({
        useMapPopup: false,
        popupInfos: popupInfosFixture
      });
      wrapper.vm.isMultipleClick = true;
      wrapper.vm.isSecMultipleClick = true;
      wrapper.vm.clickedLayers = [
        { id: 'layer1', type: 'circle' },
        { id: 'layer2', type: 'line' }
      ];
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.showSelectLayer).toBe(false);
    });

    it('builds identifyFieldsOptions when allPopupDatas changes', async () => {
      wrapper = mountPopup({
        useMapPopup: false,
        popupInfos: [{ title: 'Layer1', layerId: 'layer1', identifyField: 'name' }]
      });
      wrapper.vm.currentLayerId = 'layer1';
      wrapper.vm.allPopupDatas = [
        [{ title: 'name', value: 'A' }],
        [{ title: 'name', value: 'B' }]
      ];
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.identifyFieldsOptions).toEqual([
        { label: 'A', value: 'A', checked: true },
        { label: 'B', value: 'B', checked: true }
      ]);
    });

    it('removes popup when allPopupDatas becomes empty', async () => {
      wrapper = mountPopup();
      wrapper.vm.removePopup = jest.fn();
      wrapper.vm.allPopupDatas = [[{ title: 'name', value: 'A' }]];
      await wrapper.vm.$nextTick();
      wrapper.vm.allPopupDatas = [];
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.removePopup).toHaveBeenCalled();
    });

    it('adjusts currentIndex when enablePopupDatasLength shrinks', async () => {
      wrapper = mountPopup();
      wrapper.vm.allPopupDatas = [
        [{ title: 'name', value: 'A' }],
        [{ title: 'name', value: 'B' }]
      ];
      wrapper.vm.currentIndex = 1;
      await wrapper.vm.$nextTick();
      wrapper.vm.allPupDatasDisabled = [false, true];
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.currentIndex).toBe(0);
    });

    it('updates coordinate when lnglats changes', async () => {
      wrapper = mountPopup();
      wrapper.vm.lnglats = [[1, 1], [2, 2]];
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.currentCoordinate).toEqual([2, 2]);
      expect(wrapper.vm.currentIndex).toBe(1);
    });

    it('clears contentHeight when currentLayerId changes', async () => {
      wrapper = mountPopup();
      wrapper.vm.contentHeight = '100px';
      wrapper.vm.currentLayerId = 'layer1';
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.contentHeight).toBe('');
    });
  });

  describe('registerEvents', () => {
    it('handles layerclick event', async () => {
      wrapper = mountPopup();
      eventHandlers.layerclick({
        layers: [{ id: 'layer1', type: 'circle' }],
        lngLat: { lng: 110, lat: 30 },
        isMultipleClick: false,
        isSecMultipleClick: false
      });
      expect(wrapper.vm.clickedLayers).toEqual([{ id: 'layer1', type: 'circle' }]);
      expect(wrapper.vm.clickedLngLat).toEqual({ lng: 110, lat: 30 });
    });

    it('keeps clickedLayers in secondary multiple click mode', async () => {
      wrapper = mountPopup();
      wrapper.vm.clickedLayers = [{ id: 'existing', type: 'circle' }];
      eventHandlers.layerclick({
        layers: [{ id: 'layer2', type: 'line' }],
        lngLat: { lng: 110, lat: 30 },
        isMultipleClick: true,
        isSecMultipleClick: true
      });
      expect(wrapper.vm.clickedLayers).toEqual([{ id: 'existing', type: 'circle' }]);
    });

    it('handles mapselectionchanged with features', async () => {
      wrapper = mountPopup();
      eventHandlers.mapselectionchanged({
        features: [{ layer: { id: 'layer1' } }],
        popupInfos: [[{ title: 'name', value: 'A' }]],
        lnglats: [[110, 30]],
        targetId: 'layer1'
      });
      expect(wrapper.vm.allPopupDatas).toEqual([[{ title: 'name', value: 'A' }]]);
      expect(wrapper.vm.lnglats).toEqual([[110, 30]]);
      expect(wrapper.vm.activeTargetName).toBe('layer1');
    });

    it('clears popup data when mapselectionchanged has no features', async () => {
      wrapper = mountPopup();
      wrapper.vm.allPopupDatas = [[{ title: 'name', value: 'A' }]];
      eventHandlers.mapselectionchanged({ features: [] });
      expect(wrapper.vm.allPopupDatas).toEqual([]);
      expect(wrapper.vm.lnglats).toEqual([]);
    });
  });

  it('registers debounced resize listener on mounted', async () => {
    wrapper = mountPopup();
    await wrapper.vm.$nextTick();
    expect(addListener).toHaveBeenCalled();
    const resizeCallback = addListener.mock.calls[0][1];
    expect(typeof resizeCallback.cancel).toBe('function');
    resizeCallback({ scrollHeight: 120 });
    await new Promise(resolve => setTimeout(resolve, 150));
    await new Promise(resolve => requestAnimationFrame(resolve));
    expect(wrapper.vm.contentHeight).toBe('120px');
  });

  it('does not update contentHeight when scrollHeight is unchanged', async () => {
    wrapper = mountPopup();
    await wrapper.vm.$nextTick();
    wrapper.vm.contentHeight = '120px';
    const resizeCallback = addListener.mock.calls[0][1];
    resizeCallback({ scrollHeight: 120 });
    await new Promise(resolve => setTimeout(resolve, 150));
    await new Promise(resolve => requestAnimationFrame(resolve));
    expect(wrapper.vm.contentHeight).toBe('120px');
  });

  it('cleans up on beforeDestroy', async () => {
    wrapper = mountPopup();
    wrapper.vm.removed = jest.fn();
    wrapper.vm.clearPopupData = jest.fn();
    const offSpy = jest.spyOn(mapEvent, '$off');
    await wrapper.vm.$nextTick();
    wrapper.destroy();
    expect(offSpy).toHaveBeenCalledWith('load-webmap-view-model', wrapper.vm.lodedCb);
    expect(removeListener).toHaveBeenCalled();
    offSpy.mockRestore();
  });

  it('clearPopupData and setHighlightLayerFilter delegate to viewModel', () => {
    wrapper = mountPopup();
    wrapper.vm.clearPopupData(false);
    expect(wrapper.vm.allPopupDatas).toEqual([]);
    expect(wrapper.vm.viewModel.clear).not.toHaveBeenCalled();
    wrapper.vm.clearPopupData(true);
    expect(wrapper.vm.viewModel.clear).toHaveBeenCalled();
    wrapper.vm.setHighlightLayerFilter('layer1', { field: 'name', values: ['A'] });
    expect(wrapper.vm.viewModel.setHighlightLayerFilter).toHaveBeenCalledWith('layer1', {
      field: 'name',
      values: ['A']
    });
  });
});
