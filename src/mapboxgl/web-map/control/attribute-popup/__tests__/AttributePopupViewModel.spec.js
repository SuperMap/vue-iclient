import AttributePopupViewModel from '../AttributePopupViewModel';
import { DataSelectorMode } from 'vue-iclient/src/mapboxgl/layer-highlight/LayerHighlightViewModel';
import Map from '@mocks/map';

describe('AttributePopupViewModel', () => {
  const highlightStyle = {
    line: {
      paint: {
        'line-width': 3,
        'line-color': '#01ffff',
        'line-opacity': 1
      }
    },
    circle: {
      paint: {
        'circle-color': '#01ffff',
        'circle-opacity': 0.6,
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#01ffff',
        'circle-stroke-opacity': 1
      }
    },
    fill: {
      paint: {
        'fill-color': '#01ffff',
        'fill-opacity': 0.6,
        'fill-outline-color': '#01ffff'
      }
    }
  };

  let map;
  let viewModel;

  beforeEach(() => {
    map = new Map({
      style: { center: [0, 0], zoom: 1, layers: [], sources: {} }
    });
  });

  afterEach(() => {
    if (viewModel) {
      viewModel.removed();
    }
  });

  describe('constructor', () => {
    it('initializes with default options', () => {
      viewModel = new AttributePopupViewModel({ name: 'test', style: highlightStyle });
      expect(viewModel.activeTargetId).toBeNull();
      expect(viewModel.clickedFeatures).toEqual({});
      expect(viewModel.dataSelectorMode).toBe(DataSelectorMode.SINGLE);
    });

    it('initializes with custom layerIds', () => {
      const options = { name: 'test', style: highlightStyle, layerIds: ['layer1', 'layer2'] };
      viewModel = new AttributePopupViewModel(options);
      expect(viewModel.highlightOptions.layerIds).toEqual(['layer1', 'layer2']);
    });

    it('initializes with multiSelection enabled', () => {
      const options = { name: 'test', style: highlightStyle, multiSelection: true };
      viewModel = new AttributePopupViewModel(options);
      expect(viewModel.highlightOptions.multiSelection).toBe(true);
    });
  });

  describe('setMap', () => {
    it('sets map and webmap', () => {
      viewModel = new AttributePopupViewModel({ name: 'test', style: highlightStyle });
      const webmap = { getAppreciableLayers: jest.fn().mockReturnValue([]), copyLayer: jest.fn() };
      viewModel.setMap({ map, webmap });
      expect(viewModel.map).toBe(map);
      expect(viewModel.webmap).toBe(webmap);
    });
  });

  describe('handleMapClickCover', () => {
    it('handles click event and fires layerclick event', async () => {
      viewModel = new AttributePopupViewModel({ name: 'test', style: highlightStyle });
      const webmap = { getAppreciableLayers: jest.fn().mockReturnValue([]), copyLayer: jest.fn() };
      viewModel.setMap({ map, webmap });

      const layerClickHandler = jest.fn();
      viewModel.on('layerclick', layerClickHandler);

      const mockFeature = {
        layer: { id: 'layer1' },
        geometry: { type: 'Point', coordinates: [1, 1] },
        properties: { name: 'test' }
      };

      jest.spyOn(map, 'queryRenderedFeatures').mockResolvedValue([mockFeature]);
      map.getLayer = jest.fn().mockReturnValue({ type: 'circle' });

      const mockEvent = {
        target: map,
        point: { x: 100, y: 100 },
        lngLat: { lng: 1, lat: 1 }
      };

      await viewModel.handleMapClickCover(mockEvent);
      expect(layerClickHandler).toHaveBeenCalled();
    });

    it('sets activeTargetId based on dataSelectorMode', async () => {
      viewModel = new AttributePopupViewModel({ name: 'test', style: highlightStyle });
      const webmap = { getAppreciableLayers: jest.fn().mockReturnValue([]), copyLayer: jest.fn() };
      viewModel.setMap({ map, webmap });

      const mockFeature = {
        layer: { id: 'layer1' },
        geometry: { type: 'Point', coordinates: [1, 1] },
        properties: { name: 'test' }
      };

      jest.spyOn(map, 'queryRenderedFeatures').mockResolvedValue([mockFeature]);
      map.getLayer = jest.fn().mockReturnValue({ type: 'circle' });

      const mockEvent = {
        target: map,
        point: { x: 100, y: 100 },
        lngLat: { lng: 1, lat: 1 }
      };

      await viewModel.handleMapClickCover(mockEvent);
      expect(viewModel.activeTargetId).toBeNull();
    });

    it('filters layerIds by existing map layers when activeTargetId is empty', async () => {
      viewModel = new AttributePopupViewModel({
        name: 'test',
        style: highlightStyle,
        layerIds: ['layer1', 'missing-layer']
      });
      const webmap = { getAppreciableLayers: jest.fn().mockReturnValue([]), copyLayer: jest.fn() };
      viewModel.setMap({ map, webmap });

      map.getLayer = jest.fn(id => (id === 'layer1' ? { type: 'circle' } : null));

      const querySpy = jest.spyOn(viewModel, 'queryLayerFeatures').mockResolvedValue([]);
      jest.spyOn(viewModel, 'removeHighlightLayers').mockImplementation(() => {});
      jest.spyOn(viewModel, 'getClickedLayers').mockReturnValue([]);

      const mockEvent = {
        target: map,
        point: { x: 100, y: 100 },
        lngLat: { lng: 1, lat: 1 }
      };

      await viewModel.handleMapClickCover(mockEvent);
      expect(querySpy).toHaveBeenCalledWith(mockEvent, ['layer1']);
    });

    it('queries only activeTargetId layer in multiple selection mode', async () => {
      viewModel = new AttributePopupViewModel({
        name: 'test',
        style: highlightStyle,
        layerIds: ['layer1', 'layer2']
      });
      const webmap = { getAppreciableLayers: jest.fn().mockReturnValue([]), copyLayer: jest.fn() };
      viewModel.setMap({ map, webmap });
      viewModel.dataSelectorMode = DataSelectorMode.MULTIPLE;
      viewModel.activeTargetId = 'layer2';

      const querySpy = jest.spyOn(viewModel, 'queryLayerFeatures').mockResolvedValue([]);
      jest.spyOn(viewModel, 'removeHighlightLayers').mockImplementation(() => {});
      jest.spyOn(viewModel, 'getClickedLayers').mockReturnValue([]);

      const mockEvent = {
        target: map,
        point: { x: 100, y: 100 },
        lngLat: { lng: 1, lat: 1 }
      };

      await viewModel.handleMapClickCover(mockEvent);
      expect(querySpy).toHaveBeenCalledWith(mockEvent, ['layer2']);
    });
  });

  describe('queryFeaturesByLayerId', () => {
    it('queries features for specific layer', async () => {
      viewModel = new AttributePopupViewModel({ name: 'test', style: highlightStyle });
      const webmap = { getAppreciableLayers: jest.fn().mockReturnValue([]), copyLayer: jest.fn() };
      viewModel.setMap({ map, webmap });

      viewModel.e = {
        target: map,
        point: { x: 100, y: 100 },
        lngLat: { lng: 1, lat: 1 }
      };

      const mockFeature = {
        layer: { id: 'layer1' },
        geometry: { type: 'Point', coordinates: [1, 1] },
        properties: { name: 'test' }
      };

      const handleMapSelectionsSpy = jest.spyOn(viewModel, 'handleMapSelections').mockImplementation(() => {});
      jest.spyOn(viewModel, 'queryLayerFeatures').mockResolvedValue([mockFeature]);

      await viewModel.queryFeaturesByLayerId('layer1');
      expect(handleMapSelectionsSpy).toHaveBeenCalledWith([mockFeature]);
      expect(viewModel.activeTargetId).toBeNull();
    });

    it('sets activeTargetId in multiple selection mode', async () => {
      viewModel = new AttributePopupViewModel({ name: 'test', style: highlightStyle, multiSelection: true });
      const webmap = { getAppreciableLayers: jest.fn().mockReturnValue([]), copyLayer: jest.fn() };
      viewModel.setMap({ map, webmap });
      viewModel.dataSelectorMode = DataSelectorMode.MULTIPLE;
      viewModel.e = {
        target: map,
        point: { x: 100, y: 100 },
        lngLat: { lng: 1, lat: 1 }
      };

      const mockFeature = {
        layer: { id: 'layer1' },
        geometry: { type: 'Point', coordinates: [1, 1] },
        properties: { name: 'test' }
      };

      jest.spyOn(viewModel, 'handleMapSelections').mockImplementation(() => {});
      jest.spyOn(viewModel, 'queryLayerFeatures').mockResolvedValue([mockFeature]);

      await viewModel.queryFeaturesByLayerId('layer1');
      expect(viewModel.activeTargetId).toBe('layer1');
    });

    it('returns early if layerId is empty', async () => {
      viewModel = new AttributePopupViewModel({ name: 'test', style: highlightStyle });
      const webmap = { getAppreciableLayers: jest.fn().mockReturnValue([]), copyLayer: jest.fn() };
      viewModel.setMap({ map, webmap });

      const querySpy = jest.spyOn(viewModel, 'queryLayerFeatures');
      await viewModel.queryFeaturesByLayerId('');
      expect(querySpy).not.toHaveBeenCalled();
    });
  });

  describe('setHighlightLayerFilter', () => {
    it('sets filter on highlight layer', () => {
      viewModel = new AttributePopupViewModel({ name: 'test', style: highlightStyle });
      const webmap = { getAppreciableLayers: jest.fn().mockReturnValue([]), copyLayer: jest.fn() };
      viewModel.setMap({ map, webmap });

      viewModel.clickedFeatures = {
        layer1: [
          { properties: { field1: 'value1' } },
          { properties: { field1: 'value2' } }
        ]
      };

      map.getLayer = jest.fn().mockReturnValue({ type: 'circle' });
      map.setFilter = jest.fn();

      jest.spyOn(viewModel, 'getHighlightLayerIds').mockReturnValue(['layer1-test-SM-highlighted']);
      jest.spyOn(viewModel, 'createFilterExps').mockReturnValue(['==', ['get', 'field1'], 'value1']);

      const identifyFields = { field: 'field1', values: ['value1'] };
      viewModel.setHighlightLayerFilter('layer1', identifyFields, true);

      expect(map.setFilter).toHaveBeenCalledWith(
        'layer1-test-SM-highlighted',
        ['==', ['get', 'field1'], 'value1']
      );
    });

    it('delegates to setL7Filter for l7 layers', () => {
      viewModel = new AttributePopupViewModel({ name: 'test', style: highlightStyle });
      const webmap = { getAppreciableLayers: jest.fn().mockReturnValue([]), copyLayer: jest.fn() };
      viewModel.setMap({ map, webmap });

      const l7Layer = { type: 'circle', l7layer: {} };
      map.getLayer = jest.fn().mockReturnValue(l7Layer);
      map.setFilter = jest.fn();
      viewModel.clickedFeatures = {
        layer1: [{ properties: { field1: 'value1' } }]
      };

      const setL7FilterSpy = jest.spyOn(viewModel, 'setL7Filter').mockImplementation(() => {});
      const identifyFields = { field: 'field1', values: ['value1'] };
      viewModel.setHighlightLayerFilter('layer1', identifyFields, true);

      expect(setL7FilterSpy).toHaveBeenCalledWith(l7Layer, [{ properties: { field1: 'value1' } }]);
      expect(map.setFilter).not.toHaveBeenCalled();
    });
  });

  describe('saveClickedFeatures', () => {
    it('listens to mapselectionchanged event', () => {
      viewModel = new AttributePopupViewModel({ name: 'test', style: highlightStyle });
      const webmap = { getAppreciableLayers: jest.fn().mockReturnValue([]), copyLayer: jest.fn() };
      viewModel.setMap({ map, webmap });

      const mockFeatures = [
        { layer: { id: 'layer1' }, properties: { name: 'test' } }
      ];

      viewModel.fire('mapselectionchanged', { features: mockFeatures });

      expect(viewModel.clickedFeatures['layer1']).toEqual(mockFeatures);
    });

    it('handles multiple selection mode', () => {
      viewModel = new AttributePopupViewModel({ name: 'test', style: highlightStyle, multiSelection: true });
      const webmap = { getAppreciableLayers: jest.fn().mockReturnValue([]), copyLayer: jest.fn() };
      viewModel.setMap({ map, webmap });

      viewModel.dataSelectorMode = DataSelectorMode.MULTIPLE;

      const mockFeatures1 = [
        { layer: { id: 'layer1' }, properties: { name: 'test1' } }
      ];
      const mockFeatures2 = [
        { layer: { id: 'layer1' }, properties: { name: 'test2' } }
      ];

      viewModel.fire('mapselectionchanged', { features: mockFeatures1 });
      viewModel.fire('mapselectionchanged', { features: mockFeatures2 });

      expect(viewModel.clickedFeatures['layer1'].length).toBe(2);
    });

    it('removes features when selection is cleared in multiple mode', () => {
      viewModel = new AttributePopupViewModel({ name: 'test', style: highlightStyle, multiSelection: true });
      const webmap = { getAppreciableLayers: jest.fn().mockReturnValue([]), copyLayer: jest.fn() };
      viewModel.setMap({ map, webmap });

      viewModel.dataSelectorMode = DataSelectorMode.MULTIPLE;
      viewModel.activeTargetId = 'layer1';

      viewModel.clickedFeatures = { layer1: [{ layer: { id: 'layer1' } }] };

      viewModel.fire('mapselectionchanged', { features: [] });

      expect(viewModel.clickedFeatures['layer1']).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('clears state and removes highlight layers', () => {
      viewModel = new AttributePopupViewModel({ name: 'test', style: highlightStyle });
      const webmap = { getAppreciableLayers: jest.fn().mockReturnValue([]), copyLayer: jest.fn() };
      viewModel.setMap({ map, webmap });

      viewModel.activeTargetId = 'layer1';
      viewModel.dataSelectorMode = DataSelectorMode.MULTIPLE;

      viewModel.clear();

      expect(viewModel.activeTargetId).toBeNull();
      expect(viewModel.dataSelectorMode).toBe(DataSelectorMode.SINGLE);
    });
  });
});
