import MeasureViewModel from '../MeasureViewModel';
import drawEvent from 'vue-iclient/src/mapboxgl/_types/draw-event';
import { convertMeasureArea } from '../measure-unit';

const dashboardConfig = {
  measureUnits: {
    distance: ['meters', 'chains'],
    area: ['meters', 'mu']
  },
  measureUnitConversions: {
    distance: {
      chains: {
        label: 'Chains',
        toMeters: 20.1168
      }
    },
    area: {
      mu: {
        label: 'Mu',
        toSquareMeters: 666.6666667
      }
    }
  }
};

describe('MeasureViewModel', () => {
  let viewModel;

  beforeEach(() => {
    viewModel = new MeasureViewModel({
      componentName: 'Measure',
      continueDraw: true,
      dashboardConfig
    });
    viewModel.fire = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('stores dashboard config and resolves labels for built-in and custom units', () => {
    expect(viewModel.getUnitLabel('distance', 'chains')).toBe('Chains');
    expect(viewModel.getUnitLabel('area', 'meters')).toBe('unit.squaremeters');

    const nextDashboardConfig = {
      measureUnits: {
        distance: ['nauticalmiles']
      }
    };

    viewModel.setDashboardConfig(nextDashboardConfig);

    expect(viewModel.dashboardConfig).toEqual(nextDashboardConfig);
    expect(viewModel.getUnitLabel('distance', 'nauticalmiles')).toBe('unit.nauticalmiles');
  });

  it('updates line popups and result when switching to a custom distance unit', () => {
    const popupNode = {
      setText: jest.fn()
    };

    viewModel.lenTipNodesList = {
      id: [{}, popupNode]
    };
    viewModel.cacheLengthUnitList = {
      id: [{ value: 1, unit: 'kilometers' }]
    };
    viewModel.activeMode = 'draw_line_string';
    viewModel.mode = 'draw_line_string';
    viewModel.activeUnit = 'kilometers';
    viewModel.result = 1;

    viewModel.updateUnit('chains', 'draw_line_string');

    expect(viewModel.cacheLengthUnitList.id[0]).toEqual(
      expect.objectContaining({
        value: '49.7097',
        unit: 'chains'
      })
    );
    expect(viewModel.cacheLengthUnitList.id[0].rawValue).toBeCloseTo(49.70969537898652, 10);
    expect(popupNode.setText).toHaveBeenCalledWith('49.7097 Chains');
    expect(viewModel.result).toBeCloseTo(49.70969537898652, 10);
    expect(viewModel.fire).toHaveBeenCalledWith('update-unit', {
      result: '49.7097',
      mode: 'draw_line_string'
    });
    expect(viewModel.activeUnit).toBe('chains');
  });

  it('keeps line popup values in sync when switching across extreme custom distance units', () => {
    const popupNode = {
      setText: jest.fn()
    };
    const extremeDashboardConfig = {
      measureUnits: {
        distance: ['kilometers', 'light_year_custom', 'nanometer_custom']
      },
      measureUnitConversions: {
        distance: {
          light_year_custom: {
            label: 'Light year',
            toMeters: 9460730472580800
          },
          nanometer_custom: {
            label: 'Nanometer',
            toMeters: 0.000000001
          }
        }
      }
    };

    viewModel.setDashboardConfig(extremeDashboardConfig);
    viewModel.lenTipNodesList = {
      id: [{}, popupNode]
    };
    viewModel.cacheLengthUnitList = {
      id: [{ value: '1.0000', unit: 'kilometers' }]
    };
    viewModel.activeMode = 'draw_line_string';
    viewModel.mode = 'draw_line_string';
    viewModel.activeUnit = 'kilometers';
    viewModel.result = 1;

    viewModel.updateUnit('light_year_custom', 'draw_line_string');
    popupNode.setText.mockClear();

    viewModel.updateUnit('nanometer_custom', 'draw_line_string');

    expect(popupNode.setText).toHaveBeenCalledWith(`${viewModel._getFormatResult(viewModel.result)} Nanometer`);
    expect(viewModel.result).toBeCloseTo(1000000000000, 3);
    expect(viewModel.fire).toHaveBeenLastCalledWith('update-unit', {
      result: viewModel._getFormatResult(viewModel.result),
      mode: 'draw_line_string'
    });
  });

  it('updates polygon hover popup and result when switching to a custom area unit', () => {
    viewModel.tipHoverDiv = {
      setText: jest.fn()
    };
    viewModel.cachePolygonUnit = {
      value: 1000,
      unit: 'meters'
    };
    viewModel.mode = 'draw_polygon';
    viewModel.activeUnit = 'meters';
    viewModel.result = 1000;

    viewModel.updateUnit('mu', 'draw_polygon');

    expect(viewModel.tipHoverDiv.setText).toHaveBeenCalledWith('1.5000 Mu');
    expect(viewModel.result).toBeCloseTo(1.499999999925, 10);
    expect(viewModel.fire).toHaveBeenCalledWith('update-unit', {
      result: '1.5000',
      mode: 'draw_polygon'
    });
    expect(viewModel.activeUnit).toBe('mu');
  });

  it('keeps polygon popup and result in sync when switching units after finishing a draw', () => {
    const hoverPopup = {
      setLngLat: jest.fn().mockReturnThis(),
      setText: jest.fn().mockReturnThis()
    };
    const feature = {
      id: 'polygon-1',
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [87.38848464248667, 48.80281323462705],
            [126.93926589247138, 36.451689761316274],
            [101.62676589247422, 53.169433033115894],
            [87.38848464248667, 48.80281323462705]
          ]
        ]
      }
    };

    viewModel.activeMode = 'draw_polygon';
    viewModel.mode = 'draw_polygon';
    viewModel.activeUnit = 'hectares';
    viewModel.map = {
      off: jest.fn()
    };
    viewModel.tipHoverDiv = hoverPopup;
    viewModel.cachePolygonUnit = {
      value: 1,
      unit: 'hectares'
    };
    viewModel.setPopupStyle = jest.fn();
    jest.spyOn(viewModel, '_isDrawing').mockReturnValue(true);

    viewModel._finishDraw({ features: [feature] });

    const finalAreaInHectares = viewModel.result;
    const expectedMuValue = convertMeasureArea(finalAreaInHectares, 'hectares', 'mu', dashboardConfig);

    expect(viewModel.cachePolygonUnit).toEqual({
      value: finalAreaInHectares,
      unit: 'hectares'
    });

    hoverPopup.setText.mockClear();
    viewModel.updateUnit('mu', 'draw_polygon');

    expect(hoverPopup.setText).toHaveBeenCalledWith(`${viewModel._getFormatResult(expectedMuValue)} Mu`);
    expect(viewModel.result).toBeCloseTo(expectedMuValue, 10);
  });

  it('restarts drawing when mode changes during continuous editing', () => {
    jest.spyOn(drawEvent.$options, 'getDrawingState').mockReturnValue(true);
    viewModel.draw = {
      changeMode: jest.fn()
    };
    viewModel.map = {
      on: jest.fn()
    };
    viewModel.mode = 'draw_line_string';
    viewModel.result = 12.3456;
    viewModel.isEditing = true;
    viewModel.mapTarget = 'map';
    viewModel.measureNodeDistanceBind = jest.fn();

    viewModel._changeMode();

    expect(viewModel.draw.changeMode).toHaveBeenCalledWith('draw_line_string');
    expect(viewModel.map.on).toHaveBeenCalledWith('mousedown', viewModel.continueDrawBind);
    expect(viewModel.map.on).toHaveBeenCalledWith('mousedown', viewModel.measureNodeDistanceBind);
    expect(viewModel.fire).toHaveBeenCalledWith('measure-finished', {
      result: '12.3456'
    });
  });

  it('resets drawing state and unregisters listeners when continuing a draw', () => {
    jest.spyOn(drawEvent.$options, 'getDrawingState').mockReturnValue(true);
    viewModel.draw = {};
    viewModel.mapTarget = 'map';
    viewModel.map = {
      off: jest.fn()
    };
    viewModel.popupFollowMouseBind = jest.fn();
    viewModel.continueDrawBind = jest.fn();
    const resetDrawSpy = jest.spyOn(viewModel, '_resetDraw').mockImplementation(() => {});

    viewModel._continueDraw();

    expect(resetDrawSpy).toHaveBeenCalledWith(true);
    expect(viewModel.map.off).toHaveBeenCalledWith('mousemove', viewModel.popupFollowMouseBind);
    expect(viewModel.map.off).toHaveBeenCalledWith('mousedown', viewModel.continueDrawBind);
  });

  it('stores non-continuous area popups and removes tracked popups', () => {
    viewModel.continueDraw = false;
    viewModel.activeUnit = 'mu';
    viewModel.map = {};
    viewModel.setPopupStyle = jest.fn();
    const hoverPopup = {
      remove: jest.fn()
    };
    const linePopup = {
      remove: jest.fn()
    };
    viewModel.tipHoverDiv = hoverPopup;
    viewModel.lenTipNodesList = {
      line: [linePopup]
    };
    const feature = {
      id: 'polygon-1',
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]]
      }
    };

    viewModel._updateAreaPopupNodes(1.5, feature);

    expect(hoverPopup.remove).toHaveBeenCalled();
    expect(viewModel.areaTipNodesList['polygon-1'].text).toBe('1.5000 Mu');

    const areaPopup = viewModel.areaTipNodesList['polygon-1'];
    jest.spyOn(areaPopup, 'remove');
    viewModel._removePopups();

    expect(linePopup.remove).toHaveBeenCalled();
    expect(areaPopup.remove).toHaveBeenCalled();
    expect(viewModel.areaTipNodesList).toEqual({});
  });

  it('removes selected measurement popups when trashing features', () => {
    const linePopup = {
      remove: jest.fn()
    };
    const areaPopup = {
      remove: jest.fn()
    };
    viewModel.draw = {
      getSelectedIds: jest.fn(() => ['line-1', 'area-1']),
      delete: jest.fn()
    };
    viewModel.ids = ['line-1', 'area-1'];
    viewModel.lenTipNodesList = {
      'line-1': [linePopup]
    };
    viewModel.areaTipNodesList = {
      'area-1': areaPopup
    };

    viewModel.trash();

    expect(viewModel.draw.delete).toHaveBeenCalledWith('line-1');
    expect(viewModel.draw.delete).toHaveBeenCalledWith('area-1');
    expect(linePopup.remove).toHaveBeenCalled();
    expect(areaPopup.remove).toHaveBeenCalled();
    expect(viewModel.ids).toEqual([]);
  });

  it('resets drawing state when removing draw', () => {
    const setDrawingStateSpy = jest.spyOn(drawEvent.$options, 'setDrawingState');
    viewModel.mapTarget = 'map';
    viewModel.draw = {
      changeMode: jest.fn(),
      delete: jest.fn()
    };
    viewModel.ids = [];
    viewModel.map = { off: jest.fn() };
    jest.spyOn(viewModel, '_resetDraw').mockImplementation(() => {});

    viewModel.removeDraw();

    expect(setDrawingStateSpy).toHaveBeenCalledWith('map', 'Measure', false);
  });

  it('resets drawing state when component removed', () => {
    const setDrawingStateSpy = jest.spyOn(drawEvent.$options, 'setDrawingState');
    viewModel.mapTarget = 'map';
    viewModel.draw = {
      delete: jest.fn()
    };
    viewModel.ids = [];
    viewModel.map = { off: jest.fn() };

    viewModel.removed();

    expect(setDrawingStateSpy).toHaveBeenCalledWith('map', 'Measure', false);
  });

  it('binds draw listeners when map is set', () => {
    const draw = { changeMode: jest.fn() };
    const getDrawSpy = jest.spyOn(drawEvent.$options, 'getDraw').mockReturnValue(draw);
    const setDrawingStateSpy = jest.spyOn(drawEvent.$options, 'setDrawingState');
    const map = { on: jest.fn() };

    viewModel.setMap({ map, mapTarget: 'map' });

    expect(viewModel.map).toBe(map);
    expect(viewModel.mapTarget).toBe('map');
    expect(getDrawSpy).toHaveBeenCalledWith({ mapTarget: 'map' });
    expect(viewModel.draw).toBe(draw);
    expect(setDrawingStateSpy).toHaveBeenCalledWith('map', 'Measure', false);
    expect(map.on).toHaveBeenCalledWith('draw.create', viewModel._finishDrawBind);
    expect(map.on).toHaveBeenCalledWith('draw.modechange', viewModel._changeModeBind);
  });

  it('opens a draw mode and starts measuring', () => {
    const setPopupStyle = jest.fn();
    const tipNode = { remove: jest.fn() };
    const setDrawingStateSpy = jest.spyOn(drawEvent.$options, 'setDrawingState');
    viewModel.map = { on: jest.fn(), off: jest.fn() };
    viewModel.mapTarget = 'map';
    viewModel.draw = { changeMode: jest.fn(), delete: jest.fn() };
    viewModel.ids = ['previous-feature'];
    viewModel.lenTipNodesList = { id: [tipNode] };

    viewModel.openDraw('draw_line_string', 'kilometers', setPopupStyle);

    expect(setDrawingStateSpy).toHaveBeenCalledWith('map', 'Measure', true);
    expect(viewModel.draw.delete).toHaveBeenCalledWith(['previous-feature']);
    expect(viewModel.ids).toBeNull();
    expect(tipNode.remove).toHaveBeenCalled();
    expect(viewModel.isEditing).toBe(true);
    expect(viewModel.mode).toBe('draw_line_string');
    expect(viewModel.activeMode).toBe('draw_line_string');
    expect(viewModel.activeUnit).toBe('kilometers');
    expect(viewModel.setPopupStyle).toBe(setPopupStyle);
    expect(viewModel.result).toBe(0);
    expect(viewModel.isOpenMoveEvent).toBe(true);
    expect(viewModel.draw.changeMode).toHaveBeenCalledWith('draw_line_string');
    expect(viewModel.map.on).toHaveBeenCalledWith('mousedown', viewModel.measureNodeDistanceBind);
    expect(viewModel.fire).toHaveBeenCalledWith('measure-start', { result: viewModel._getFormatResult(0) });
  });

  it('formats distance result when a line measurement finishes', () => {
    jest.spyOn(viewModel, '_isDrawing').mockReturnValue(true);
    viewModel.map = { on: jest.fn(), off: jest.fn() };
    viewModel.mapTarget = 'map';
    viewModel.activeMode = 'draw_line_string';
    viewModel.activeUnit = 'kilometers';
    viewModel.cacheLengthUnitList = {};
    viewModel.lenTipNodesList = {};
    const feature = {
      id: 'line-1',
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 0]
        ]
      }
    };

    viewModel._finishDraw({ features: [feature] });

    expect(viewModel.result).toBeCloseTo(111.19, 1);
    expect(viewModel.ids).toEqual(['line-1']);
    expect(viewModel.map.off).toHaveBeenCalledWith('mousemove', viewModel.popupFollowMouseBind);
    expect(viewModel.fire).toHaveBeenCalledWith('measure-finished', {
      result: viewModel._getFormatResult(viewModel.result),
      mode: 'draw_line_string'
    });
  });

  it('tracks measure nodes and shows distance tips while drawing lines', () => {
    jest.spyOn(viewModel, '_isDrawing').mockReturnValue(true);
    viewModel.map = { on: jest.fn(), off: jest.fn() };
    viewModel.activeMode = 'draw_line_string';
    viewModel.activeUnit = 'kilometers';
    viewModel.measureNodes = [];
    viewModel.result = 0;
    viewModel.isOpenMoveEvent = true;

    viewModel._measureNodeDistance({ lngLat: { lng: 0, lat: 0 } });

    expect(viewModel.map.on).toHaveBeenCalledWith('mousemove', viewModel.popupFollowMouseBind);
    expect(viewModel.isOpenMoveEvent).toBe(false);
    expect(viewModel.measureNodes).toEqual([[0, 0]]);
    expect(viewModel.lenTipNodesList.id).toHaveLength(1);
    expect(viewModel.lenTipNodesList.id[0].text).toBeTruthy();

    viewModel._measureNodeDistance({ lngLat: { lng: 1, lat: 0 } });

    expect(viewModel.measureNodes).toHaveLength(2);
    expect(viewModel.lenTipNodesList.id).toHaveLength(2);
    expect(viewModel.cacheLengthUnitList.id).toHaveLength(1);
    expect(viewModel.cacheLengthUnitList.id[0].unit).toBe('kilometers');
  });

  it('follows mouse and updates hover popup for lines and polygons', () => {
    jest.spyOn(viewModel, '_isDrawing').mockReturnValue(true);
    viewModel.map = { on: jest.fn(), off: jest.fn() };
    viewModel.measureNodes = [
      [0, 0],
      [1, 0]
    ];
    viewModel.activeUnit = 'kilometers';
    viewModel.activeMode = 'draw_line_string';
    viewModel.setPopupStyle = jest.fn();

    viewModel._popupFollowMouse({ lngLat: { lng: 2, lat: 0 } });

    expect(viewModel.tipHoverDiv).not.toBeNull();
    expect(viewModel.tipHoverDiv._lngLat.toArray()).toEqual([2, 0]);
    expect(viewModel.tipHoverDiv.text).toBe(
      `${viewModel._getFormatResult(viewModel.result)} ${viewModel.getUnitLabel('distance', 'kilometers')}`
    );
    expect(viewModel.setPopupStyle).toHaveBeenCalled();
    expect(viewModel.cachePolygonUnit).toEqual({
      value: viewModel.result,
      unit: 'kilometers'
    });

    viewModel.activeMode = 'draw_polygon';
    viewModel.meanNodes = viewModel.measureNodes;
    viewModel._popupFollowMouse({ lngLat: { lng: 2, lat: 1 } });

    expect(viewModel.cachePolygonUnit.value).toBe(viewModel.result);
    expect(viewModel.tipHoverDiv.text).toBe(
      `${viewModel._getFormatResult(viewModel.result)} ${viewModel.getUnitLabel('area', 'kilometers')}`
    );
  });

  it('keeps active unit when there is nothing to convert', () => {
    viewModel.activeMode = 'draw_line_string';
    viewModel.mode = 'draw_line_string';
    viewModel.activeUnit = 'kilometers';
    viewModel.lenTipNodesList = {};

    viewModel.updateUnit('chains', 'draw_line_string');

    expect(viewModel.activeUnit).toBe('chains');

    viewModel.cachePolygonUnit = {};
    viewModel.updateUnit('mu', 'draw_polygon');

    expect(viewModel.activeUnit).toBe('chains');

    viewModel.fire.mockClear();
    viewModel.updateUnit('mu', 'unknown_mode');

    expect(viewModel.activeUnit).toBe('chains');
    expect(viewModel.fire).not.toHaveBeenCalled();
  });

  it('ignores drawing lifecycle events when not drawing', () => {
    jest.spyOn(viewModel, '_isDrawing').mockReturnValue(false);
    viewModel.draw = { changeMode: jest.fn() };
    viewModel.map = { on: jest.fn(), off: jest.fn() };
    viewModel.isEditing = true;

    viewModel._changeMode();
    viewModel._continueDraw();

    expect(viewModel.draw.changeMode).not.toHaveBeenCalled();
    expect(viewModel.map.off).not.toHaveBeenCalled();
  });

  it('clears tracked nodes when the finished line id is updated', () => {
    viewModel.lenTipNodesList = { id: [], 'line-1': [{ remove: jest.fn() }] };
    viewModel.cacheLengthUnitList = { id: [], 'line-1': [{ value: 1, unit: 'meters' }] };

    viewModel._updateLenPopupNodes('line-1');

    expect(viewModel.lenTipNodesList.id).toBeUndefined();
    expect(viewModel.cacheLengthUnitList.id).toBeUndefined();
    // 临时 id 的节点为空时会把已有记录覆盖为空数组，随后被整体清理
    expect(viewModel.lenTipNodesList['line-1']).toBeUndefined();
    expect(viewModel.cacheLengthUnitList['line-1']).toBeUndefined();
  });

  it('keeps finished line nodes when the temporary nodes are not empty', () => {
    const tipNode = { remove: jest.fn() };
    const temporaryNode = { remove: jest.fn() };
    viewModel.lenTipNodesList = { id: [temporaryNode], 'line-2': [tipNode] };
    viewModel.cacheLengthUnitList = { id: [{ value: 1, unit: 'meters' }] };

    viewModel._updateLenPopupNodes('line-2');

    expect(viewModel.lenTipNodesList.id).toBeUndefined();
    expect(viewModel.cacheLengthUnitList.id).toBeUndefined();
    // 临时 id 下的节点非空时会被迁移到当前 id，并覆盖旧记录
    expect(viewModel.lenTipNodesList['line-2']).toHaveLength(1);
    expect(viewModel.lenTipNodesList['line-2'][0]).toBe(temporaryNode);
    expect(viewModel.cacheLengthUnitList['line-2']).toEqual([{ value: 1, unit: 'meters' }]);
  });

  it('clears all features through remove draw', () => {
    const removeDrawSpy = jest.spyOn(viewModel, 'removeDraw').mockImplementation(() => {});

    viewModel.clearAllFeatures();

    expect(removeDrawSpy).toHaveBeenCalled();
  });
});
