import LayerHighlightViewModel from '../LayerHighlightViewModel';
import Map from '@mocks/map';

describe('LayerHighlightViewModel', () => {
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
  const mockLayerName = 'China';
  const copyLayerSpy = jest.fn();
  let viewModel;

  beforeEach(() => {
    map = new Map({
      style: { center: [0, 0], zoom: 1, layers: [], sources: {} }
    });

    viewModel = new LayerHighlightViewModel({ name: uniqueName, style: highlightStyle });
    const webmap = { copyLayer: copyLayerSpy };
    viewModel.setMap({ map, webmap });
  });

  afterEach(() => {
    viewModel.removed();
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
    expect(viewModel.highlightOptions.layerIds).toEqual([pointLayer.id]);
    viewModel.removeHighlightLayers();
    expect(map.getStyle().layers.length).toBe(0);
    expect(viewModel.highlightOptions.layerIds).toEqual([pointLayer.id]);
    viewModel.setTargetLayers([]);
    expect(viewModel.highlightOptions.layerIds).toEqual([]);
    done();
  });

  it('map click l7 animate marker', done => {
    const setSelectedDatas = jest.fn();
    jest.spyOn(map, 'queryRenderedFeatures').mockImplementation(() => [
      {
        type: 'Feature',
        properties: {
          smpid: 7,
          type: '分类5',
          _id: 177554
        },
        layer: { paint: {}, l7layer: {}, setSelectedDatas },
        geometry: {
          type: 'Point',
          coordinates: [122.20916748046851, 31.332525032307764]
        }
      }
    ]);
    const viewModel = new LayerHighlightViewModel({ name: uniqueName, style: highlightStyle, layerIds: ['动画点'] });
    const webmap = { copyLayer: copyLayerSpy };
    viewModel.setMap({ map, webmap });
    
    viewModel.once('mapselectionchanged', ({ features }) => {
      expect(features.length).toBeGreaterThan(0);
      expect(copyLayerSpy).toBeCalled()
      expect(setSelectedDatas).toBeCalled()
      viewModel.removeHighlightLayers();
      expect(setSelectedDatas).toBeCalled()
      viewModel.unregisterMapClick();
      done();
    });
    expect(viewModel.featureFields).toBeUndefined();
    const featureFieldsMap = { [mockLayerName]: ['type'] };
    viewModel.setFeatureFieldsMap(featureFieldsMap);
    expect(viewModel.highlightOptions.featureFieldsMap).toEqual(featureFieldsMap);
    viewModel.map.fire('click', { target: map, point: { x: 10, y: 5 } });
  });
  it('map click ms fill extrusion', done => {
    jest.spyOn(map, 'queryRenderedFeatures').mockImplementation(() => [
      {
        type: 'Feature',
        properties: {
          type: '分类5',
          _id: 177554
        },
        layer: {id:'3d填充面', type: 'fill-extrusion', paint: {} },
        geometry: {
          type: 'Polygon',
          coordinates: [[[122.20916748046851, 31.332525032307764]]]
        }
      }
    ]);
    const viewModel = new LayerHighlightViewModel({ name: uniqueName, style: highlightStyle, layerIds: ['3d填充面'] });
    const webmap = { copyLayer: copyLayerSpy };
    viewModel.setMap({ map, webmap });
    
    viewModel.once('mapselectionchanged', () => {
      const layers = map.getStyle().layers;
      expect(layers.length).toBe(1);
      expect(layers[0].id).toBe(`3d填充面-${uniqueName}-SM-highlighted`);
      expect(layers[0].paint).toEqual({"fill-extrusion-color": "#01ffff", "fill-extrusion-opacity": 0.6});
      viewModel.unregisterMapClick();
      done();
    });
    expect(viewModel.featureFields).toBeUndefined();
    const featureFieldsMap = { '3d填充面': ['type'] };
    viewModel.setFeatureFieldsMap(featureFieldsMap);
    expect(viewModel.highlightOptions.featureFieldsMap).toEqual(featureFieldsMap);
    viewModel.map.fire('click', { target: map, point: { x: 10, y: 5 } });
  });

  it('map click target layer by specified featureFields', done => {
    viewModel.once('mapselectionchanged', ({ features }) => {
      expect(features.length).toBeGreaterThan(0);
      const layers = map.getStyle().layers;
      expect(layers.length).toBe(2);
      expect(layers[0].id).toBe(`${mockLayerName}-${uniqueName}-SM-highlighted`);
      expect(layers[1].id).toBe(`${mockLayerName}-${uniqueName}-SM-highlighted-StrokeLine`);
      expect(layers[0].filter[0]).toBe('any');
      expect(layers[1].filter[0]).toBe('any');
      expect(viewModel.highlightOptions.layerIds).toEqual([mockLayerName]);
      viewModel.removeHighlightLayers();
      expect(map.getStyle().layers.length).toBe(0);
      expect(viewModel.highlightOptions.layerIds).toEqual([mockLayerName]);
      viewModel.unregisterMapClick();
      done();
    });
    expect(viewModel.featureFields).toBeUndefined();
    const featureFieldsMap = { [mockLayerName]: ['title', 'subtitle', 'imgUrl', 'description', 'index'] };
    viewModel.setFeatureFieldsMap(featureFieldsMap);
    expect(viewModel.highlightOptions.featureFieldsMap).toEqual(featureFieldsMap);
    viewModel.map.fire('click', { target: map, point: { x: 10, y: 5 } });
  });

  it('map click target layer by pressing ctrl', done => {
    const keyboardEvents = {};
    jest.spyOn(window, 'addEventListener').mockImplementation((type, cb) => {
      keyboardEvents[type] = cb;
    });
    viewModel.once('mapselectionchanged', ({ features, dataSelectorMode }) => {
      expect(features.length).toBe(0);
      expect(dataSelectorMode).toBe('SINGLE');
      viewModel.once('mapselectionchanged', ({ features, dataSelectorMode }) => {
        expect(dataSelectorMode).toBe('MULTIPLE');
        expect(features.length).toBeGreaterThan(0);
        const layers = map.getStyle().layers;
        expect(layers.length).toBe(2);
        expect(layers[0].id).toBe(`${mockLayerName}-${uniqueName}-SM-highlighted`);
        expect(layers[1].id).toBe(`${mockLayerName}-${uniqueName}-SM-highlighted-StrokeLine`);
        expect(layers[0].filter[0]).toBe('any');
        expect(layers[1].filter[0]).toBe('any');
        done();
      });
      Promise.resolve().then(() => {
        viewModel.map.fire('click', { target: map, point: { x: 10, y: 5 } });
      });
    });
    viewModel.setTargetLayers(['layer1']);
    viewModel.setMultiSelection(true);
    expect(keyboardEvents.keydown).not.toBeUndefined();
    expect(keyboardEvents.keyup).not.toBeUndefined();
    keyboardEvents.keydown({ ctrlKey: 'Control' });
  });

  it('map click same feature by smid', done => {
    viewModel.setTargetLayers(['layer1']);
    const keyboardEvents = {};
    jest.spyOn(window, 'addEventListener').mockImplementation((type, cb) => {
      keyboardEvents[type] = cb;
    });
    viewModel.once('mapselectionchanged', ({ features, dataSelectorMode }) => {
      expect(features.length).toBe(0);
      expect(dataSelectorMode).toBe('SINGLE');
      viewModel.once('mapselectionchanged', ({ features, dataSelectorMode }) => {
        expect(dataSelectorMode).toBe('MULTIPLE');
        expect(features.length).toBeGreaterThan(0);
        const layers = map.getStyle().layers;
        expect(layers.length).toBe(2);
        expect(layers[0].id).toBe(`${mockLayerName}-${uniqueName}-SM-highlighted`);
        expect(layers[1].id).toBe(`${mockLayerName}-${uniqueName}-SM-highlighted-StrokeLine`);
        const layer1Filter = layers[0].filter;
        const layer2Filter = layers[1].filter;
        expect(layer1Filter[0]).toBe('any');
        expect(layer2Filter[0]).toBe('any');
        viewModel.once('mapselectionchanged', ({ features: nextFeatures, dataSelectorMode }) => {
          expect(dataSelectorMode).toBe('MULTIPLE');
          expect(nextFeatures.length).toBe(features.length);
          const layers = map.getStyle().layers;
          expect(layers.length).toBe(2);
          expect(layers[0].id).toBe(`${mockLayerName}-${uniqueName}-SM-highlighted`);
          expect(layers[1].id).toBe(`${mockLayerName}-${uniqueName}-SM-highlighted-StrokeLine`);
          const nextLayer1Filter = layers[0].filter;
          const nextLayer2Filter = layers[1].filter;
          expect(nextLayer1Filter).toEqual(layer1Filter);
          expect(nextLayer2Filter).toEqual(layer2Filter);
          done();
        });
        Promise.resolve().then(() => {
          viewModel.map.fire('click', { target: map, point: { x: 10, y: 5 } });
        });
      });
      Promise.resolve().then(() => {
        viewModel.map.fire('click', { target: map, point: { x: 10, y: 5 } });
      });
    });
    viewModel.setMultiSelection(true);
    expect(keyboardEvents.keydown).not.toBeUndefined();
    expect(keyboardEvents.keyup).not.toBeUndefined();
    keyboardEvents.keydown({ ctrlKey: 'Control' });
  });

  it('map click same feature by geometry', done => {
    viewModel.setTargetLayers(['layer1']);
    const keyboardEvents = {};
    jest.spyOn(window, 'addEventListener').mockImplementation((type, cb) => {
      keyboardEvents[type] = cb;
    });
    jest.spyOn(map, 'queryRenderedFeatures').mockImplementation(() => {
      return [
        {
          type: 'feature',
          properties: {
            index: 1
          },
          geometry: {
            type: 'MultiPolygon',
            coordinates: [
              [
                [
                  [116.452409755349, 40.92656164358],
                  [116.483357386004, 40.9069469918439],

                  [116.442423257771, 40.9417511118507],
                  [116.452409755349, 40.92656164358]
                ]
              ],
              [
                [
                  [116.560117987415, 40.9749988417875],

                  [116.547892153981, 40.9705907375336],
                  [116.552270926448, 40.980672910927],
                  [116.560117987415, 40.9749988417875]
                ]
              ]
            ]
          }
        }
      ];
    });
    viewModel.once('mapselectionchanged', ({ features, dataSelectorMode }) => {
      expect(features.length).toBe(0);
      expect(dataSelectorMode).toBe('SINGLE');
      viewModel.once('mapselectionchanged', ({ features, dataSelectorMode }) => {
        expect(dataSelectorMode).toBe('MULTIPLE');
        expect(features.length).toBeGreaterThan(0);
        viewModel.once('mapselectionchanged', ({ features: nextFeatures, dataSelectorMode }) => {
          expect(dataSelectorMode).toBe('MULTIPLE');
          expect(nextFeatures.length).toBe(features.length);
          viewModel.once('mapselectionchanged', ({ features: nextFeatures, dataSelectorMode }) => {
            expect(dataSelectorMode).toBe('MULTIPLE');
            expect(nextFeatures.length).toBe(features.length);
            done();
          });
          jest.spyOn(map, 'queryRenderedFeatures').mockImplementation(() => {
            return [
              {
                type: 'feature',
                properties: {
                  index: 1
                },
                geometry: {
                  type: 'MultiPolygon',
                  coordinates: [
                    [
                      [
                        [116.452409755349, 40.92656164358],
                        [116.483357386004, 40.9069469918439],

                        [116.442423257771, 40.9417511118507],
                        [116.452409755349, 40.92656164358]
                      ]
                    ]
                  ]
                }
              }
            ];
          });
          Promise.resolve().then(() => {
            viewModel.map.fire('click', { target: map, point: { x: 5, y: 5 } });
          });
        });
        Promise.resolve().then(() => {
          viewModel.map.fire('click', { target: map, point: { x: 10, y: 5 } });
        });
      });
      Promise.resolve().then(() => {
        viewModel.map.fire('click', { target: map, point: { x: 10, y: 5 } });
      });
    });
    viewModel.setMultiSelection(true);
    expect(keyboardEvents.keydown).not.toBeUndefined();
    expect(keyboardEvents.keyup).not.toBeUndefined();
    keyboardEvents.keydown({ ctrlKey: 'Control' });
  });

  it('updateHighlightDatas', done => {
    const pointLayer = {
      id: mockLayerName,
      type: 'circle'
    };
    map.addLayer(pointLayer);
    const layers = map.getStyle().layers;
    expect(layers.length).toBe(1);
    viewModel.once('mapselectionchanged', ({ features, dataSelectorMode }) => {
      expect(dataSelectorMode).toBe('ALL');
      expect(features.length).toBeGreaterThan(0);
      const layers = map.getStyle().layers;
      expect(layers.length).toBe(2);
      expect(layers[0].id).toBe(mockLayerName);
      expect(layers[1].id).toBe(`${mockLayerName}-${uniqueName}-SM-highlighted`);
      expect(layers[1].filter[0]).toBe('any');
      done();
    });
    viewModel.updateHighlightDatas({
      features: [{ properties: { name: '11' }, geometry: { type: 'Point', coordinates: [0, 0] } }],
      layerId: mockLayerName
    });
    expect(viewModel.dataSelectorMode).toBe('ALL');
  });

  it('map click empty', done => {
    viewModel.setTargetLayers(['layer1']);
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
    viewModel.setTargetLayers(targetIds);
    events.mousemove();
    expect(viewModel.highlightOptions.layerIds).toEqual(targetIds);
    expect(canvaStyle.cursor).toBe('pointer');
    events.mouseleave();
    expect(canvaStyle.cursor).toBe('');
    done();
  });
});
