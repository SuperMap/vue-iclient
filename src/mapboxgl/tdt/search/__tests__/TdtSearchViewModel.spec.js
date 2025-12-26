import TdtSearchViewModel from '../TdtSearchViewModel';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import flushPromises from 'flush-promises';

jest.mock('../../_utils/service', () => {
  const actual = jest.requireActual('../../_utils/service');
  return Object.assign({}, actual, {
    tiandituSearch: jest.fn(),
    tiandituTransit: jest.fn(),
    toBBoxString: jest.fn(() => '0,0,1,1')
  });
});

import { tiandituSearch, tiandituTransit, request, tdtSetHighlightIcon, resetSearchSourceData, clearSearchResultLayer } from '../../_utils/service';

describe('TdtSearchViewModel', () => {
  let wrapper;
  let map;
  let vm;

  beforeAll(async () => {
    wrapper = await createEmptyMap();
    map = wrapper.vm.viewModel.map;
  });

  beforeEach(() => {
    vm = new TdtSearchViewModel({ data: { tk: 'testtk' } });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('setMap without map should return Error', () => {
    const res = vm.setMap({});
    expect(res).toBeInstanceOf(Error);
    expect(res.message).toBe('Cannot find map');
  });

  it('setMap registers map and can show point popup', () => {
    vm.setMap({ map });
    expect(vm.map).toBe(map);
    // ensure easeTo exists on the mock map
    map.easeTo = jest.fn();
    const easeSpy = map.easeTo;
    vm.showPointPopup([104, 30], { name: 'X', phone: 'P', address: 'A' }, 'Point');
    expect(vm.resultPopup).toBeDefined();
    expect(easeSpy).toHaveBeenCalledWith({ center: [104, 30] });
  });

  it('showLineHoverPopup creates hover popup with HTML', () => {
    vm.setMap({ map });
    const e = {
      features: [
        { geometry: { coordinates: [104.1, 30.2] }, properties: { name: 'Line1' } }
      ],
      lngLat: [104.1, 30.2]
    };
    vm.showLineHoverPopup(e);
    expect(vm.hoverPopup).toBeDefined();
  });

  it('_getPopupContent returns DOM and start/end are not appended currently', () => {
    vm.setMap({ map });
    const data = { name: 'N', phone: 'P', address: 'A', lonlat: '104,30' };
    const dom = vm._getPopupContent('Point', data);
    expect(dom.querySelector('.region').textContent).toContain('N');
    const phone = dom.querySelector('.phone');
    expect(phone.textContent).toContain('P');

    // note: the operate-group is not appended into content (code has content.appendChild(group) commented out)
    const start = dom.querySelector('.start-item');
    const end = dom.querySelector('.end-item');
    expect(start).toBeNull();
    expect(end).toBeNull();
  });

  it('_setPosition parses lonlat and calls _transformMsg', () => {
    const spy = jest.spyOn(vm, '_transformMsg');
    vm._setPosition('start', { name: 'X', lonlat: '100,20' });
    expect(spy).toHaveBeenCalledWith('start', [100, 20], 'X');
  });

  it('_transformMsg without name calls _getPointInfo', () => {
    const spy = jest.spyOn(vm, '_getPointInfo').mockImplementation(() => {});
    vm._transformMsg('start', [1, 2], undefined);
    expect(spy).toHaveBeenCalledWith('start', [1, 2]);
  });

  it('_resetPoint fires reset-position event with expected payload', () => {
    const handler = jest.fn();
    vm.on('reset-position', handler);
    vm._resetPoint('start', 'Home', [100, 20]);
    expect(handler).toHaveBeenCalled();
    const arg = handler.mock.calls[0][0];
    expect(arg.data).toEqual({ start: 'Home', startLnglat: [100, 20] });
  });

  it('_convertName returns expected strings for various addressComponents', () => {
    // case: poiDistance > roadDistance and roadDistance > 10 -> return road + 附近
    expect(vm._convertName({ poi: 'P', poi_distance: 20, road: 'R', road_distance: 11 })).toBe('R附近');
    // case: poiDistance < roadDistance but poiDistance <= 10 -> return poi
    expect(vm._convertName({ poi: 'P', poi_distance: 5, road: 'R', road_distance: 10 })).toBe('P');
    // no poi -> unknown
    expect(vm._convertName({})).toBe('未知地点');
  });

  it('_generateLinesFeatures parses linepoint into coordinates', () => {
    const data = { linepoint: '104.019416,30.64978;104.019437,30.648794;' };
    const f = vm._generateLinesFeatures(data);
    expect(f.geometry.coordinates.length).toBe(2);
    expect(f.geometry.coordinates[0][0]).toBeCloseTo(104.019416);
  });

  it('_generateAreaFeatures converts region string to polygon feature', () => {
    const area = { points: [{ region: '100,0,101,1' }], bound: '100,0,101,1' };
    const f = vm._generateAreaFeatures(area);
    expect(f.geometry.type).toBe('Polygon');
    expect(typeof f.geometry.coordinates[0][0][0]).toBe('number');
  });

  it('_searchFromTianditu resolves when tiandituSearch returns count', async () => {
    vm.setMap({ map });
    tiandituSearch.mockResolvedValue({ count: '1', pois: [] });
    const res = await vm._searchFromTianditu();
    expect(res).toBeDefined();
  });

  it('_searchFromTianditu rejects with null on cancel', async () => {
    vm.setMap({ map });
    tiandituSearch.mockRejectedValue({ isCancel: true });
    try {
      await vm._searchFromTianditu();
    } catch (e) {
      expect(e).toBeNull();
    }
  });

  it('showLineDetail calls transit and fires event and caches result', async () => {
    vm.setMap({ map });
    const transitData = { linename: 'L1', linepoint: '104,30;105,31', uuid: 'u1', station: [] };
    tiandituTransit.mockResolvedValue(transitData);
    const addLinesSpy = jest.spyOn(vm, '_addLines');
    const eventHandler = jest.fn();
    vm.on('get-transit-data-succeeded', eventHandler);

    vm.showLineDetail('u1', true);
    await flushPromises();

    expect(vm.groupLineList.u1).toBeDefined();
    expect(eventHandler).toHaveBeenCalled();
    // calling again should use cache and call _addLines
    vm.showLineDetail('u1', true);
    expect(addLinesSpy).toHaveBeenCalled();
  });

  it('reset and removed call underlying cleanup methods', () => {
    vm.setMap({ map });
    const removePopupSpy = jest.spyOn(vm, '_removeResultPopup');
    const clearLayerSpy = jest.spyOn(vm, '_clearSearchResultLayer');
    vm.reset();
    expect(removePopupSpy).toHaveBeenCalled();
    vm.removed();
    expect(clearLayerSpy).toHaveBeenCalled();
  });

  it('registerPointsEvent handles click/mouseenter/mouseleave', () => {
    // ensure map.on supports layer parameter like mapbox: (type, layer, handler)
    map._listeners = {};
    const originalOn = map.on.bind(map);
    map.on = (type, a, b) => {
      if (typeof a === 'function') return originalOn(type, a);
      if (typeof b === 'function') return originalOn(type, b);
    };

    // provide persistent canvas to allow cursor checks
    const canvas = { style: {} };
    map.getCanvas = () => canvas;

    vm = new TdtSearchViewModel({ data: { tk: 'testtk' } });
    vm.setMap({ map });
    const spy = jest.spyOn(vm, 'showPointPopup');
    const event = { features: [{ properties: { name: 'A', phone: 'P', address: 'Addr', lonlat: '1,2' }, geometry: { coordinates: [104, 30] } }], lngLat: [1, 2] };

    // call the point-specific click handler directly (avoid triggering line handlers)
    const clickListeners = (map._listeners && map._listeners.click) || [];
    const pointClickHandler = clickListeners.find(fn => fn.toString().indexOf("'LineString'") === -1);
    expect(pointClickHandler).toBeDefined();
    pointClickHandler.call(map, event);
    expect(spy).toHaveBeenCalled();

    // call the point-specific mouseenter & mouseleave handlers directly
    const enterListeners = (map._listeners && map._listeners.mouseenter) || [];
    const pointEnter = enterListeners.find(fn => fn.toString().indexOf('showLineHoverPopup') === -1);
    pointEnter.call(map, event);
    expect(map.getCanvas().style.cursor).toBe('pointer');
    const leaveListeners = (map._listeners && map._listeners.mouseleave) || [];
    const pointLeave = leaveListeners.find(fn => fn.toString().indexOf('_removeHoverPopup') === -1);
    pointLeave.call(map, event);
    expect(map.getCanvas().style.cursor).toBe('');
  });

  it('registerLinesEvent handles click/mouseenter/mouseleave and hover popup removal', () => {
    // patch map.on to support (type, layer, handler)
    map._listeners = {};
    const originalOn = map.on.bind(map);
    map.on = (type, a, b) => {
      if (typeof a === 'function') return originalOn(type, a);
      if (typeof b === 'function') return originalOn(type, b);
    };

    // provide persistent canvas to allow cursor checks
    const canvas = { style: {} };
    map.getCanvas = () => canvas;

    vm = new TdtSearchViewModel({ data: { tk: 'testtk' } });
    vm.setMap({ map });
    const pointSpy = jest.spyOn(vm, 'showPointPopup');
    const hoverSpy = jest.spyOn(vm, 'showLineHoverPopup');
    const clickEvent = { features: [{ properties: { name: 'LinePoint' }, geometry: { coordinates: [100, 0] } }], lngLat: [100, 0] };
    map.fire('click', clickEvent);
    expect(pointSpy).toHaveBeenCalled();

    // mouseenter should show hover popup and set cursor
    map.fire('mouseenter', clickEvent);
    expect(hoverSpy).toHaveBeenCalled();
    expect(map.getCanvas().style.cursor).toBe('pointer');
    // simulate existing hoverPopup and ensure leave removes it
    vm.hoverPopup = { remove: jest.fn() };
    map.fire('mouseleave', {});
    expect(vm.hoverPopup).toBeNull();
  });

  it('_getPointInfo calls request and fires reset-position', async () => {
    vm.setMap({ map });
    const mockRes = { result: { addressComponent: { poi: 'P', poi_distance: 5, road: 'R', road_distance: 2 } } };
    const reqSpy = jest.spyOn(require('../../_utils/service'), 'request').mockResolvedValue(mockRes);
    const handler = jest.fn();
    vm.on('reset-position', handler);

    vm._getPointInfo('start', [100, 20]);
    await flushPromises();

    expect(reqSpy).toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it('_addPointsOfLine adds source and layers when not present', () => {
    vm.setMap({ map });
    const features = { type: 'FeatureCollection', features: [{ geometry: { type: 'Point', coordinates: [100, 0] }, properties: { serialNum: 1 } }] };
    vm._addPointsOfLine(features);
    const src = map.getSource(vm.searchResultPointsOfLine);
    expect(src).toBeDefined();
    expect(map.getLayer(`${vm.searchResultPointsOfLine}-fill`)).toBeDefined();
    expect(map.getLayer(`${vm.searchResultPointsOfLine}-stroke`)).toBeDefined();
  });

  it('_addLines adds source/layer and calls fitBounds', () => {
    vm.setMap({ map });
    map.fitBounds = jest.fn();
    const feature = {
      type: 'Feature',
      properties: { station: [{ lonlat: '104,30' }, { lonlat: '105,31' }] },
      geometry: { type: 'LineString', coordinates: [[104, 30], [105, 31]] }
    };
    vm._addLines(feature);
    expect(map.getSource(vm.searchResultLine)).toBeDefined();
    expect(map.getLayer(vm.searchResultLine)).toBeDefined();
    expect(map.fitBounds).toHaveBeenCalled();
  });

  it('_addPolygon adds source/layers and calls fitBounds', () => {
    vm.setMap({ map });
    map.fitBounds = jest.fn();
    const feature = { type: 'Feature', properties: { bound: '100,0,101,1' }, geometry: { type: 'Polygon' } };
    vm._addPolygon(feature);
    expect(map.getSource(vm.searchResultPolygon)).toBeDefined();
    expect(map.getLayer(`${vm.searchResultPolygon}-stroke`)).toBeDefined();
    expect(map.getLayer(vm.searchResultPolygon)).toBeDefined();
    expect(map.fitBounds).toHaveBeenCalled();
  });

  it('setHighlightIcon and _resetSearchSourceData and _clearSearchResultLayer call service helpers', () => {
    vm.setMap({ map });
    const tdtSpy = jest.spyOn(require('../../_utils/service'), 'tdtSetHighlightIcon');
    vm.setHighlightIcon('hot1');
    expect(tdtSpy).toHaveBeenCalledWith(map, vm.searchResultPoints, 'hot1');

    const resetSpy = jest.spyOn(require('../../_utils/service'), 'resetSearchSourceData');
    vm._resetSearchSourceData();
    expect(resetSpy).toHaveBeenCalledWith(map);

    const clearSpy = jest.spyOn(require('../../_utils/service'), 'clearSearchResultLayer');
    vm._clearSearchResultLayer();
    expect(clearSpy).toHaveBeenCalledWith(map);
  });

  it('_showResultToMap handles statistics and returns expected structure', () => {
    vm.setMap({ map });
    const data = {
      count: '3',
      statistics: { priorityCitys: ['a'], allAdmins: [] },
      prompt: []
    };
    const res = vm._showResultToMap(data);
    expect(res.type).toBe('Statistics');
    expect(res.result.count).toBe(3);
    expect(res.result.data.priorityCitys).toEqual(['a']);
  });

  it('_addPolygon updates source when it already exists', () => {
    vm.setMap({ map });
    const feature = { type: 'Feature', properties: { bound: '100,0,101,1' }, geometry: { type: 'Polygon' } };
    // first call creates the source/layers
    vm._addPolygon(feature);
    const source = map.getSource(vm.searchResultPolygon);
    expect(source).toBeDefined();
    // call again should update the underlying source data
    vm._addPolygon(feature);
    expect(map._sources[vm.searchResultPolygon].data).toEqual(feature);
  });

  it('_removeHoverPopup and _removeResultPopup remove and nullify', () => {
    vm.hoverPopup = { remove: jest.fn() };
    vm.resultPopup = { remove: jest.fn() };
    vm._removeHoverPopup();
    expect(vm.hoverPopup).toBeNull();
    vm._removeResultPopup();
    expect(vm.resultPopup).toBeNull();
  });
});
