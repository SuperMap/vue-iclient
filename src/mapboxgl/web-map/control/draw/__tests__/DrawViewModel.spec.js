import DrawViewModel from '../DrawViewModel';
import drawEvent from 'vue-iclient/src/mapboxgl/_types/draw-event';
import turfLength from '@turf/length';
import turfArea from '@turf/area';
import { convertArea } from '@turf/helpers';

jest.mock('@turf/length');
jest.mock('@turf/area');
jest.mock('@turf/helpers');

describe('DrawViewModel', () => {
  let viewModel;
  let mockMap;
  let mockDraw;

  beforeEach(() => {
    viewModel = new DrawViewModel('Draw');
    mockMap = {
      center: [0, 0],
      on: jest.fn(),
      setFilter: jest.fn(),
      getPaintProperty: jest.fn(),
      getFilter: jest.fn(),
      setPaintProperty: jest.fn()
    };
    
    mockDraw = {
      changeMode: jest.fn(),
      delete: jest.fn(),
      getSelectedIds: jest.fn().mockReturnValue([])
    };

    jest.spyOn(drawEvent.$options, 'getDraw').mockReturnValue(mockDraw);
    jest.spyOn(drawEvent.$options, 'getDrawingState').mockReturnValue(true);
    jest.spyOn(drawEvent.$options, 'setDrawingState').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('setMap', done => {
    const viewModel = new DrawViewModel('Draw');
    expect(viewModel.componentName).toBe('Draw');
    const listenList = {};
    const mapInfo = {
      map: {
        center: [0, 0],
        on: jest.fn().mockImplementation((type, layerId, cb) => {
          listenList[type] = cb || layerId;
          listenList[type]({
            features: [
              {
                id: 1,
                type: 'feature',
                properties: { field: 'test', id: 1 },
                geometry: { coodinates: [], tpe: 'Point' }
              }
            ]
          });
        }),
        setFilter: jest.fn(),
        getPaintProperty: jest.fn()
      },
      mapTarget: 'map'
    };
    jest.spyOn(drawEvent.$options, 'getDrawingState').mockReturnValue(true);
    const draw = {
        changeMode: jest.fn(),
        delete: jest.fn(),
        getSelectedIds: jest.fn().mockReturnValue([1])
      };
    jest.spyOn(drawEvent.$options, 'getDraw').mockReturnValue(draw);
    viewModel.setMap(mapInfo);
    expect(viewModel.map).toEqual(mapInfo.map);
    expect(viewModel.mapTarget).toBe(mapInfo.mapTarget);
    expect(listenList['draw.create']).toBeTruthy();
    expect(listenList['draw.selectionchange']).toBeTruthy();
    expect(listenList['mouseout']).toBeTruthy();
    expect(listenList['mouseover']).toBeTruthy();
    expect(viewModel.draw).toEqual(draw);
    expect(viewModel.featureIds).toEqual([1]);
    done();
  });

  it('should initialize with correct properties', () => {
    expect(viewModel.componentName).toBe('Draw');
    expect(viewModel.featureIds).toEqual([]);
    expect(viewModel.activeFeature).toEqual({});
    expect(viewModel.dashedLayerIds).toEqual([]);
    expect(viewModel.layerStyleList).toEqual({});
  });

  it('should handle draw create event', () => {
    // First set the map so draw is initialized
    const mapInfo = {
      map: mockMap,
      mapTarget: 'map'
    };
    viewModel.setMap(mapInfo);
    
    const mockEvent = {
      features: [{ id: 'test-feature' }]
    };
    
    viewModel._drawCreate(mockEvent);
    
    // Since _isDrawing returns true (mocked), feature should be added
    expect(viewModel.featureIds).toContain('test-feature');
  });

  it('should not add feature when not drawing', () => {
    jest.spyOn(drawEvent.$options, 'getDrawingState').mockReturnValue(false);
    
    const mockEvent = {
      features: [{ id: 'test-feature2' }]
    };
    
    viewModel._drawCreate(mockEvent);
    
    // Feature should not be added since not drawing
    expect(viewModel.featureIds).not.toContain('test-feature2');
  });

  it('should handle selection change with feature', () => {
    // Initialize map and draw
    const mapInfo = {
      map: mockMap,
      mapTarget: 'map'
    };
    viewModel.setMap(mapInfo);
    
    const mockEvent = {
      features: [{
        id: 'selected-feature',
        geometry: { type: 'Point', coordinates: [0, 0] }
      }]
    };
    
    // Mock turf functions
    turfLength.mockReturnValue(5);
    
    viewModel.fire = jest.fn();
    viewModel._selectionChange(mockEvent);
    
    expect(viewModel.activeFeature.id).toEqual('selected-feature');
    expect(viewModel.fire).toHaveBeenCalledWith('draw-create', expect.any(Object));
  });

  it('should handle selection change without features', () => {
    const mockEvent = {
      features: []
    };
    
    viewModel.fire = jest.fn();
    viewModel._selectionChange(mockEvent);
    
    expect(viewModel.fire).not.toHaveBeenCalled();
  });

  it('should calculate result for Point geometry', () => {
    const mockFeature = {
      geometry: { 
        type: 'Point', 
        coordinates: [1, 1] 
      }
    };
    
    turfLength.mockReturnValue(10);
    viewModel.fire = jest.fn();
    viewModel.map = mockMap;
    viewModel._calcResult(mockFeature);
    
    expect(turfLength).toHaveBeenCalledWith(mockFeature, { units: 'kilometers' });
    expect(viewModel.fire).toHaveBeenCalledWith('draw-create', expect.any(Object));
  });

  it('should calculate result for LineString geometry', () => {
    const mockFeature = {
      geometry: { 
        type: 'LineString', 
        coordinates: [[0, 0], [1, 1]] 
      }
    };
    
    turfLength.mockReturnValue(15);
    viewModel.fire = jest.fn();
    viewModel.map = mockMap;
    viewModel._calcResult(mockFeature);
    
    expect(turfLength).toHaveBeenCalledWith(mockFeature, { units: 'kilometers' });
    expect(viewModel.fire).toHaveBeenCalledWith('draw-create', expect.any(Object));
  });

  it('should calculate result for Polygon geometry', () => {
    const mockFeature = {
      geometry: { 
        type: 'Polygon', 
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] 
      }
    };
    
    turfArea.mockReturnValue(1000);
    convertArea.mockReturnValue(20);
    viewModel.fire = jest.fn();
    viewModel.map = mockMap;
    viewModel._calcResult(mockFeature);
    
    expect(turfArea).toHaveBeenCalledWith(mockFeature);
    expect(convertArea).toHaveBeenCalledWith(1000, 'meters', 'kilometers');
    expect(viewModel.fire).toHaveBeenCalledWith('draw-create', expect.any(Object));
  });

  it('should calculate max latitude in coordinates', () => {
    const coordinates = [[0, 1], [1, 3], [2, 2]];
    const result = viewModel._calcMaxLatitudeInCoordinate(coordinates);
    expect(result).toEqual([1, 3]); // Max latitude is 3 at index 1
  });

  it('should get feature style', () => {
    viewModel.layerStyleList = {
      'LineString': {
        'feature-1': { color: 'red' }
      },
      'Point': {
        'feature-1': { size: 5 },
        'feature-2': { size: 10 }
      }
    };
    
    const result = viewModel._getFetureStyle('feature-1');
    // Should merge styles from both LineString and Point
    expect(result).toEqual({ color: 'red', size: 5 });
  });

  it('should open draw mode', () => {
    // Initialize map and draw first
    const mapInfo = {
      map: mockMap,
      mapTarget: 'test-target'
    };
    viewModel.setMap(mapInfo);
    
    viewModel.openDraw('draw_polygon');
    
    expect(drawEvent.$options.setDrawingState).toHaveBeenCalledWith(
      'test-target', 
      'Draw', 
      true
    );
    expect(mockDraw.changeMode).toHaveBeenCalledWith('draw_polygon');
  });

  it('should trash specific feature by id', () => {
    // Initialize map and draw first
    const mapInfo = {
      map: mockMap,
      mapTarget: 'test-target'
    };
    viewModel.setMap(mapInfo);
    
    viewModel.dashedLayerIds = ['feature-1', 'feature-2'];
    viewModel.layerStyleList = {
      'LineString': {
        'feature-1': { color: 'red' }
      }
    };
    
    viewModel.trash('feature-1');
    
    expect(mockDraw.delete).toHaveBeenCalledWith('feature-1');
    expect(viewModel.dashedLayerIds).toEqual(['feature-2']);
    expect(viewModel.layerStyleList.LineString).toEqual({});
  });

  it('should trash selected features', () => {
    // Initialize map and draw first
    const mapInfo = {
      map: mockMap,
      mapTarget: 'test-target'
    };
    viewModel.setMap(mapInfo);
    
    viewModel.featureIds = ['feature-1', 'feature-2'];
    mockDraw.getSelectedIds.mockReturnValue(['feature-1']);
    
    viewModel.trash();
    
    expect(mockDraw.delete).toHaveBeenCalledWith('feature-1');
    expect(viewModel.featureIds).toEqual(['feature-2']);
  });

  it('should set layer style', () => {
    viewModel.activeFeature = { id: 'test-feature' };
    viewModel.map = mockMap;
    viewModel.setFilter = jest.fn();
    viewModel.setPaintProperty = jest.fn();
    
    const layerStyle = {
      'LineString': {
        'line-color': '#ff0000'
      }
    };
    
    viewModel.setLayerStyle(layerStyle);
    
    expect(viewModel.layerStyleList['LineString']['test-feature']).toEqual({
      'line-color': '#ff0000'
    });
    expect(viewModel.setFilter).toHaveBeenCalled();
    expect(viewModel.setPaintProperty).toHaveBeenCalledWith(
      'LineString', 
      layerStyle.LineString, 
      false
    );
  });

  it('should set dash filter data', () => {
    viewModel.dashedLayerIds = ['feature-1', 'feature-2'];
    const result = viewModel.setDashFilterData(['!in', 'id']);
    expect(result).toEqual(['!in', 'id', 'feature-1', 'feature-2']);
  });

  it('should set filter', () => {
    viewModel.dashedLayerIds = ['feature-1'];
    // 不设置linesStaticFilter，让它为undefined，这样会触发getFilter调用
    viewModel.map = mockMap;
    
    // Mock getFilter to return initial filter
    mockMap.getFilter.mockReturnValue(['initial', 'filter']);
    
    viewModel.setFilter();
    
    expect(mockMap.getFilter).toHaveBeenCalledWith('draw-line-static.cold');
    expect(mockMap.setFilter).toHaveBeenCalledTimes(4); // Called 4 times for different layers
  });

  it('should set paint property for LineString', () => {
    viewModel.map = mockMap;
    viewModel.layerStyleList = { 'LineString': { 'test-feature': { 'line-color': '#ff0000' } } };
    viewModel.activeFeature = { id: 'test-feature' };
    viewModel.defaultStyle = { 'line-color': '#000000' };
    viewModel.setValueOfPaintKey = jest.fn().mockReturnValue(['match', ['get', 'id'], 'test-feature', '#ff0000', '#000000']);
    
    const paint = { 'line-color': '#ff0000' };
    viewModel.setPaintProperty('LineString', paint, false);
    
    expect(mockMap.setPaintProperty).toHaveBeenCalledWith(
      'draw-line-static.cold', 
      'line-color', 
      expect.any(Array)
    );
  });

  it('should set value of paint key', () => {
    viewModel.layerStyleList = { 'LineString': { 'test-feature': { 'line-color': '#ff0000' } } };
    viewModel.activeFeature = { id: 'test-feature' };
    viewModel.defaultStyle = { 'line-color': '#000000' };
    
    const result = viewModel.setValueOfPaintKey('LineString', 'line-color');
    expect(result).toEqual(['match', ['get', 'id'], 'test-feature', '#ff0000', '#000000']);
  });

  it('should get default style', () => {
    viewModel.map = mockMap;
    mockMap.getPaintProperty
      .mockReturnValueOnce('#000000')   // line-color
      .mockReturnValueOnce(2)           // line-width
      .mockReturnValueOnce([5, 5])      // line-dasharray
      .mockReturnValueOnce(0.3)         // fill-opacity
      .mockReturnValueOnce(5);          // circle-radius
    
    viewModel._getDefaultStyle();
    
    expect(viewModel.defaultStyle).toEqual({
      'line-color': '#000000',
      'line-width': 2,
      'line-dasharray': [5, 5],
      'fill-opacity': 0.3,
      'circle-radius': 5
    });
  });

  it('should remove and cleanup', () => {
    // Initialize map and draw first
    const mapInfo = {
      map: mockMap,
      mapTarget: 'test-target'
    };
    viewModel.setMap(mapInfo);
    
    viewModel.featureIds = ['feature-1'];
    viewModel.draw = mockDraw;
    
    viewModel.removed();
    
    expect(mockDraw.delete).toHaveBeenCalledWith(['feature-1']);
    expect(viewModel.draw).toBeNull();
  });

  it('should clear all features', () => {
    // Initialize map and draw first
    const mapInfo = {
      map: mockMap,
      mapTarget: 'test-target'
    };
    viewModel.setMap(mapInfo);
    
    viewModel.featureIds = ['feature-1'];
    viewModel.activeFeature = { id: 'active-feature' };
    viewModel.dashedLayerIds = ['dashed-1'];
    viewModel.layerStyleList = { test: 'data' };
    viewModel.draw = mockDraw;
    
    viewModel.clearAllFeatures();
    
    expect(mockDraw.delete).toHaveBeenCalledWith(['feature-1']);
    expect(viewModel.featureIds).toEqual([]);
    expect(viewModel.activeFeature).toEqual({});
    expect(viewModel.dashedLayerIds).toEqual([]);
    expect(viewModel.layerStyleList).toEqual({});
  });

  it('should check if drawing', () => {
    viewModel.mapTarget = 'test-target';
    viewModel.draw = mockDraw;
    
    const result = viewModel._isDrawing();
    
    expect(drawEvent.$options.getDrawingState).toHaveBeenCalledWith('test-target', 'Draw');
    expect(result).toBe(true);
  });
});