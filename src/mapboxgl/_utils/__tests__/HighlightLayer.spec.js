import HighlightLayer from '../HightlighLayer';
import Map from '@mocks/map';

describe('HighlightLayer', () => {
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
    },
    stokeLine: {
      paint: {
        'line-width': 3,
        'line-color': '#01ffff',
        'line-opacity': 1
      }
    }
  };

  let map;
  const uniqueName = 'Test';
  let viewModel;

  beforeEach(() => {
    map = new Map({
      style: { center: [0, 0], zoom: 1, layers: [], sources: {} }
    });
    viewModel = new HighlightLayer({ name: uniqueName, style: highlightStyle });
    viewModel.map = map;
  });

  it('toogle show highlight layers', done => {
    const pointLayer = {
      id: 'pointLayer',
      type: 'circle'
    };
    viewModel.addHighlightLayers(pointLayer);
    const layers = map.getStyle().layers;
    expect(layers.length).toBe(1);
    expect(layers[0].id).toBe(`${pointLayer.id}-${uniqueName}-SM-highlighted`);
    expect(viewModel.targetLayerIds).toEqual([pointLayer.id]);
    viewModel.removeHighlightLayers();
    expect(map.getStyle().layers.length).toBe(0);
    expect(viewModel.targetLayerIds).toEqual([pointLayer.id]);
    viewModel.setTargetLayers([]);
    expect(viewModel.targetLayerIds).toEqual([]);
    done();
  });

  it('map click target layer by specified filterExp', done => {
    viewModel.registerMapClick();
    viewModel.once('mapselectionchanged', ({ features }) => {
      expect(features.length).toBeGreaterThan(0);
      const layers = map.getStyle().layers;
      const mockLayerName = 'China';
      expect(layers.length).toBe(2);
      expect(layers[0].id).toBe(`${mockLayerName}-${uniqueName}-SM-highlighted`);
      expect(layers[1].id).toBe(`${mockLayerName}-${uniqueName}-SM-highlighted-StrokeLine`);
      expect(layers[0].filter).toEqual(viewModel.filterExp);
      expect(layers[1].filter).toEqual(viewModel.filterExp);
      expect(viewModel.targetLayerIds).toEqual([mockLayerName]);
      viewModel.removeHighlightLayers();
      expect(map.getStyle().layers.length).toBe(0);
      expect(viewModel.targetLayerIds).toEqual([mockLayerName]);
      viewModel.unregisterMapClick();
      done();
    });
    expect(viewModel.filterExp).toBeUndefined();
    const filterExp = ['all', ['==', 'key1', 'value1']];
    viewModel.setFilterExp(filterExp);
    expect(viewModel.filterExp).toEqual(filterExp);
    viewModel.map.fire('click', { target: map, point: { x: 10, y: 5 } });
  });

  it('map click target layer by specified filterFields', done => {
    viewModel.registerMapClick();
    viewModel.once('mapselectionchanged', ({ features }) => {
      expect(features.length).toBeGreaterThan(0);
      const layers = map.getStyle().layers;
      const mockLayerName = 'China';
      expect(layers.length).toBe(2);
      expect(layers[0].id).toBe(`${mockLayerName}-${uniqueName}-SM-highlighted`);
      expect(layers[1].id).toBe(`${mockLayerName}-${uniqueName}-SM-highlighted-StrokeLine`);
      const filterExp = viewModel.createFilterExp(features[0], viewModel.filterFields);
      expect(layers[0].filter).toEqual(filterExp);
      expect(layers[1].filter).toEqual(filterExp);
      expect(viewModel.targetLayerIds).toEqual([mockLayerName]);
      viewModel.removeHighlightLayers();
      expect(map.getStyle().layers.length).toBe(0);
      expect(viewModel.targetLayerIds).toEqual([mockLayerName]);
      viewModel.unregisterMapClick();
      done();
    });
    expect(viewModel.filterFields).toBeUndefined();
    const filterFields = ['title', 'subtitle', 'imgUrl', 'description', 'index'];
    viewModel.setFilterFields(filterFields);
    expect(viewModel.filterFields).toEqual(filterFields);
    viewModel.map.fire('click', { target: map, point: { x: 10, y: 5 } });
  });

  it('map click empty', done => {
    viewModel.registerMapClick();
    viewModel.once('mapselectionchanged', ({ features }) => {
      expect(features.length).toBe(0);
      viewModel.unregisterMapClick();
      done();
    });
    viewModel.map.fire('click', { target: map, point: { x: 0, y: 5 } });
  });

  it('map canvas style', done => {
    const canvaStyle = {};
    const events = {};
    jest.spyOn(map, 'getCanvas').mockImplementation(() => ({
      style: canvaStyle
    }));
    jest.spyOn(map, 'on').mockImplementation((type, layerId, cb) => {
      events[type] = cb ? cb : layerId;
    });
    const targetIds = ['Test1'];
    viewModel.registerLayerMouseEvents(targetIds);
    events.mousemove();
    expect(viewModel.targetLayerIds).toEqual(targetIds);
    expect(canvaStyle.cursor).toBe('pointer');
    events.mouseleave();
    expect(canvaStyle.cursor).toBe('');
    viewModel.unregisterLayerMouseEvents();
    done();
  });
});

