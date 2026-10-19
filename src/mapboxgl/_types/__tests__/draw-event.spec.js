import drawEvent, { defaultStyles } from '../draw-event';
import mapEvent from '../map-event';

jest.mock('vue-iclient/static/libs/mapbox-gl-draw/mapbox-gl-draw', () => {
  class MapboxDraw {
    constructor(options) {
      this.options = options;
      this.mode = 'simple_select';
      this.onAdd = jest.fn();
      this.onRemove = jest.fn();
      this.changeMode = jest.fn(mode => {
        this.mode = mode;
      });
      this.getMode = jest.fn(() => this.mode);
    }
  }
  MapboxDraw.modes = {
    simple_select: {},
    direct_select: {}
  };
  return { __esModule: true, default: MapboxDraw };
});

describe('draw-event', () => {
  const mapTarget = 'drawEventMap';
  let map;

  beforeEach(() => {
    map = { id: mapTarget };
    mapEvent.$options.mapCache[mapTarget] = map;
    delete drawEvent.$options.drawList[mapTarget];
    delete drawEvent.$options.mapList[mapTarget];
    delete drawEvent.$options.drawStates[mapTarget];
  });

  afterEach(() => {
    delete drawEvent.$options.drawList[mapTarget];
    delete drawEvent.$options.mapList[mapTarget];
    delete drawEvent.$options.drawStates[mapTarget];
    delete mapEvent.$options.mapCache[mapTarget];
    jest.restoreAllMocks();
  });

  describe('drawing state', () => {
    it('stores and reads drawing state per component', () => {
      drawEvent.$options.setDrawingState(mapTarget, 'Measure', true);

      expect(drawEvent.$options.getDrawingState(mapTarget, 'Measure')).toBe(true);
      expect(drawEvent.$options.getDrawingState('otherMap', 'Measure')).toBeUndefined();
      expect(drawEvent.$options.getDrawingState(mapTarget, 'Draw')).toBeUndefined();
    });

    it('only keeps one drawing component per map', () => {
      drawEvent.$options.setDrawingState(mapTarget, 'Draw', true);
      drawEvent.$options.setDrawingState(mapTarget, 'Measure', true);

      expect(drawEvent.$options.getDrawingState(mapTarget, 'Draw')).toBe(false);
      expect(drawEvent.$options.getDrawingState(mapTarget, 'Measure')).toBe(true);
    });

    it('removes a component state and keeps map draw while others remain', () => {
      const draw = { onRemove: jest.fn() };
      drawEvent.$options.drawList[mapTarget] = draw;
      drawEvent.$options.mapList[mapTarget] = map;
      drawEvent.$options.setDrawingState(mapTarget, 'Measure', true);
      drawEvent.$options.setDrawingState(mapTarget, 'Draw', true);

      drawEvent.$options.deleteDrawingState(mapTarget, 'Measure');

      expect(drawEvent.$options.getDrawingState(mapTarget, 'Measure')).toBeUndefined();
      expect(drawEvent.$options.drawList[mapTarget]).toBe(draw);
    });

    it('removes map draw when the last component state is deleted', () => {
      const deleteDrawOfMapSpy = jest.spyOn(drawEvent.$options, 'deleteDrawOfMap');
      drawEvent.$options.setDrawingState(mapTarget, 'Measure', true);

      drawEvent.$options.deleteDrawingState(mapTarget, 'Measure');

      expect(deleteDrawOfMapSpy).toHaveBeenCalledWith(mapTarget);
    });

    it('ignores deleting state of an unknown map', () => {
      expect(() => drawEvent.$options.deleteDrawingState('unknownMap', 'Measure')).not.toThrow();
    });

    it('keeps map draw when an unknown component state is deleted', () => {
      const draw = { onRemove: jest.fn() };
      drawEvent.$options.drawList[mapTarget] = draw;
      drawEvent.$options.mapList[mapTarget] = map;
      drawEvent.$options.setDrawingState(mapTarget, 'Measure', true);

      drawEvent.$options.deleteDrawingState(mapTarget, 'NotExist');

      expect(drawEvent.$options.getDrawingState(mapTarget, 'Measure')).toBe(true);
      expect(draw.onRemove).not.toHaveBeenCalled();
    });
  });

  describe('isMapDrawing', () => {
    it('returns false when the map target or draw instance is missing', () => {
      expect(drawEvent.$options.isMapDrawing()).toBe(false);
      expect(drawEvent.$options.isMapDrawing(mapTarget)).toBe(false);

      drawEvent.$options.drawList[mapTarget] = {};
      expect(drawEvent.$options.isMapDrawing(mapTarget)).toBe(false);
    });

    it('returns false for non drawing modes and non string modes', () => {
      drawEvent.$options.drawList[mapTarget] = { getMode: () => 'simple_select' };
      expect(drawEvent.$options.isMapDrawing(mapTarget)).toBe(false);

      drawEvent.$options.drawList[mapTarget] = { getMode: () => 'direct_select' };
      expect(drawEvent.$options.isMapDrawing(mapTarget)).toBe(false);

      drawEvent.$options.drawList[mapTarget] = { getMode: () => 1 };
      expect(drawEvent.$options.isMapDrawing(mapTarget)).toBe(false);
    });

    it('returns true for drawing modes', () => {
      drawEvent.$options.drawList[mapTarget] = { getMode: () => 'draw_line_string' };
      expect(drawEvent.$options.isMapDrawing(mapTarget)).toBe(true);

      drawEvent.$options.drawList[mapTarget] = { getMode: () => 'draw_polygon' };
      expect(drawEvent.$options.isMapDrawing(mapTarget)).toBe(true);
    });
  });

  describe('getDraw', () => {
    it('creates a draw instance and adds it to the map', () => {
      const draw = drawEvent.$options.getDraw({ mapTarget });

      expect(draw).toBe(drawEvent.$options.drawList[mapTarget]);
      expect(draw.onAdd).toHaveBeenCalledWith(map);
      expect(drawEvent.$options.mapList[mapTarget]).toBe(map);
      expect(draw.options.styles).toHaveLength(11);
      expect(draw.options.modes.simple_select.clickOnFeature).toEqual(expect.any(Function));
      expect(draw.options.modes.direct_select.dragFeature).toEqual(expect.any(Function));
    });

    it('reuses the existing draw instance for the same map', () => {
      const draw = drawEvent.$options.getDraw({ mapTarget });
      draw.onAdd.mockClear();

      expect(drawEvent.$options.getDraw({ mapTarget })).toBe(draw);
      expect(draw.onAdd).not.toHaveBeenCalled();
    });

    it('does not create a draw instance when create is false', () => {
      expect(drawEvent.$options.getDraw({ mapTarget, create: false })).toBeUndefined();
      expect(drawEvent.$options.drawList[mapTarget]).toBeUndefined();
    });

    it('creates a new draw instance when the map instance changed', () => {
      const firstDraw = drawEvent.$options.getDraw({ mapTarget });
      const nextMap = { id: 'nextMap' };
      mapEvent.$options.mapCache[mapTarget] = nextMap;

      const secondDraw = drawEvent.$options.getDraw({ mapTarget });

      expect(secondDraw).not.toBe(firstDraw);
      expect(secondDraw.onAdd).toHaveBeenCalledWith(nextMap);
    });

    it('uses custom styles when creating draw instance', () => {
      const styles = { ...defaultStyles, 'line-static': { 'line-color': '#000000' } };
      const draw = drawEvent.$options._createDraw(mapTarget, styles);

      expect(draw.options.styles[0].paint['line-color']).toBe('#000000');
    });

    it('exposes disabled default draw interactions', () => {
      const draw = drawEvent.$options._createDraw(mapTarget);
      const { simple_select: simpleSelect, direct_select: directSelect } = draw.options.modes;

      expect(() => {
        simpleSelect.dragMove();
        simpleSelect.clickOnVertex();
        directSelect.dragFeature();
      }).not.toThrow();
    });

    it('selects and re-renders clicked features', () => {
      const draw = drawEvent.$options._createDraw(mapTarget);
      const clickOnFeature = draw.options.modes.simple_select.clickOnFeature;
      const modeInstance = {
        stopExtendedInteractions: jest.fn(),
        getSelectedIds: () => ['feature-a'],
        isSelected: () => false,
        doRender: jest.fn(),
        setSelected: jest.fn()
      };

      clickOnFeature.call(modeInstance, {}, {
        originalEvent: {},
        featureTarget: { properties: { id: 'feature-b' } }
      });

      expect(modeInstance.stopExtendedInteractions).toHaveBeenCalled();
      expect(modeInstance.doRender).toHaveBeenCalledWith('feature-a');
      expect(modeInstance.setSelected).toHaveBeenCalledWith('feature-b');
      expect(modeInstance.doRender).toHaveBeenCalledWith('feature-b');
    });

    it('keeps existing selection when shift clicking a selected feature', () => {
      const draw = drawEvent.$options._createDraw(mapTarget);
      const clickOnFeature = draw.options.modes.simple_select.clickOnFeature;
      const modeInstance = {
        stopExtendedInteractions: jest.fn(),
        getSelectedIds: () => [],
        isSelected: () => true,
        doRender: jest.fn(),
        setSelected: jest.fn()
      };

      clickOnFeature.call(modeInstance, {}, {
        originalEvent: { shiftKey: true },
        featureTarget: { properties: { id: 'feature-c' } }
      });

      expect(modeInstance.setSelected).not.toHaveBeenCalled();
      expect(modeInstance.doRender).toHaveBeenCalledWith('feature-c');
    });
  });

  describe('deleteDrawOfMap', () => {
    it('removes the draw instance and map caches', () => {
      const draw = drawEvent.$options.getDraw({ mapTarget });

      drawEvent.$options.deleteDrawOfMap(mapTarget);

      expect(draw.onRemove).toHaveBeenCalledWith(map);
      expect(drawEvent.$options.drawList[mapTarget]).toBeUndefined();
      expect(drawEvent.$options.mapList[mapTarget]).toBeUndefined();
      expect(drawEvent.$options.drawStates[mapTarget]).toBeUndefined();
    });

    it('does nothing when draw or map is missing', () => {
      expect(() => drawEvent.$options.deleteDrawOfMap('unknownMap')).not.toThrow();
    });
  });
});
