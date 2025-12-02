import { mount } from '@vue/test-utils';
import SmMiniMap from '../MiniMap.vue';
import MiniMapViewModel from '../MiniMapViewModel';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import iportal_serviceProxy from 'vue-iclient/test/unit/mocks/data/iportal_serviceProxy';
import uniqueLayer_point from 'vue-iclient/test/unit/mocks/data/WebMap/uniqueLayer_point';
import layerData from 'vue-iclient/test/unit/mocks/data/layerData';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap';

describe('MiniMap.vue', () => {
  let wrapper;
  let mapWrapper;

  beforeEach(async () => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_point,
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    mapWrapper = await createEmptyMap({
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  it('render default correctly', done => {
    wrapper = mount(SmMiniMap, {
      propsData: {
        mapTarget: 'map'
      }
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  describe('MiniMapViewModel', () => {
    let viewModel;
    let mockParentMap;
    let mockMiniMap;
    let mockContainer;

    beforeEach(() => {
      viewModel = new MiniMapViewModel();

      // 模拟父级地图对象
      mockParentMap = {
        getStyle: jest.fn().mockReturnValue({}),
        getCRS: jest.fn().mockReturnValue({}),
        getBounds: jest.fn().mockReturnValue({
          _ne: { lng: 10, lat: 10 },
          _sw: { lng: 0, lat: 0 }
        }),
        getCenter: jest.fn().mockReturnValue({ lng: 5, lat: 5 }),
        getZoom: jest.fn().mockReturnValue(10),
        fitBounds: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        _localIdeographFontFamily: undefined
      };

      // 模拟小地图对象
      mockMiniMap = {
        on: jest.fn((event, handler) => {
          if (event === 'load') {
            // 立即执行load回调以触发后续初始化
            setTimeout(() => handler && handler(), 0);
          }
        }),
        off: jest.fn(),
        getCanvasContainer: jest.fn().mockReturnValue({
          addEventListener: jest.fn()
        }),
        getBounds: jest.fn().mockReturnValue({
          _ne: { lng: 10, lat: 10 },
          _sw: { lng: 0, lat: 0 }
        }),
        fitBounds: jest.fn(),
        getCenter: jest.fn().mockReturnValue({ lng: 5, lat: 5 }),
        setCenter: jest.fn(),
        getZoom: jest.fn().mockReturnValue(5),
        setZoom: jest.fn(),
        getStyle: jest.fn().mockReturnValue({}),
        setStyle: jest.fn(),
        addSource: jest.fn(),
        addLayer: jest.fn(),
        getSource: jest.fn().mockReturnValue({
          setData: jest.fn(),
          _data: {
            properties: {
              bounds: null
            }
          }
        }),
        remove: jest.fn(),
        resize: jest.fn(),
        queryRenderedFeatures: jest.fn().mockReturnValue([]),
        dragPan: { disable: jest.fn() },
        scrollZoom: { disable: jest.fn() },
        boxZoom: { disable: jest.fn() },
        dragRotate: { disable: jest.fn() },
        keyboard: { disable: jest.fn() },
        doubleClickZoom: { disable: jest.fn() },
        touchZoomRotate: { disable: jest.fn() }
      };

      mockContainer = document.createElement('div');

      // 模拟mapboxgl.Map构造函数
      global.mapboxgl = Object.assign(global.mapboxgl || {}, {
        Evented: class Evented {
          on() {}
          fire() {}
        },
        Map: jest.fn().mockImplementation(() => mockMiniMap)
      });
    });

    it('should initialize correctly', () => {
      expect(viewModel.options).toBeTruthy();
      expect(viewModel._ticking).toBe(false);
      expect(viewModel._isDragging).toBe(false);
      expect(viewModel._isCursorOverFeature).toBe(false);
    });

    it('should set map correctly', () => {
      viewModel.setMap({ map: mockParentMap });
      expect(viewModel._parentMap).toBe(mockParentMap);
    });


    it('should load mini map with correct settings', () => {
      // 为了测试loadMiniMap，我们需要先初始化一些前置条件
      viewModel.setMap({ map: mockParentMap });
      viewModel.setContainer(mockContainer);
      viewModel._parentMap = mockParentMap;
      viewModel._miniMap = mockMiniMap;
      
      // 手动调用loadMiniMap
      viewModel.loadMiniMap();
      
      // 检查交互禁用
      expect(mockMiniMap.dragPan.disable).toHaveBeenCalled();
      expect(mockMiniMap.scrollZoom.disable).toHaveBeenCalled();
      
      // 检查事件监听
      expect(mockParentMap.on).toHaveBeenCalledWith('move', expect.any(Function));
      expect(mockParentMap.on).toHaveBeenCalledWith('styledata', expect.any(Function));
      expect(mockMiniMap.on).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(mockMiniMap.on).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(mockMiniMap.on).toHaveBeenCalledWith('mouseup', expect.any(Function));
    });

    it('should handle resize', () => {
      viewModel.setMap({ map: mockParentMap });
      viewModel.setContainer(mockContainer);
      
      // 初始化_miniMap引用
      viewModel._miniMap = mockMiniMap;
      
      viewModel.resize();
      expect(mockMiniMap.resize).toHaveBeenCalled();
    });

    it('should handle mouse events', () => {
      viewModel.setMap({ map: mockParentMap });
      viewModel.setContainer(mockContainer);
      viewModel.loadMiniMap();
      
      // 初始化_trackingRect并确保它有_data属性
      const trackingRectMock = {
        setData: jest.fn(),
        _data: {
          properties: {
            bounds: {
              _ne: { lat: 10, lng: 10 },
              _sw: { lat: 0, lng: 0 }
            }
          }
        }
      };
      viewModel._trackingRect = trackingRectMock;
      mockMiniMap.getSource.mockReturnValue(trackingRectMock);

      // 创建两个不同的事件对象避免冲突
      const mockMouseDownEvent = {
        lngLat: { lng: 5, lat: 5 },
        point: { x: 10, y: 10 }
      };
      
      const mockMouseMoveEvent = {
        lngLat: { lng: 5, lat: 5 },
        point: [[5], [15]]  // 符合mock函数预期的格式
      };

      // 测试鼠标按下
      viewModel._isCursorOverFeature = true;
      viewModel._mouseDown(mockMouseDownEvent);
      expect(viewModel._isDragging).toBe(true);
      expect(viewModel._currentPoint).toEqual([5, 5]);

      // 测试鼠标移动（非拖拽）
      viewModel._ticking = true;
      viewModel._mouseMove(mockMouseMoveEvent);
      expect(viewModel._ticking).toBe(false);

      // 测试鼠标移动（拖拽）
      viewModel._isDragging = true;
      viewModel._previousPoint = [6, 6];
      mockMiniMap.queryRenderedFeatures.mockReturnValue([{ id: 1 }]);
      
      viewModel._mouseMove(mockMouseMoveEvent);
      
      expect(mockParentMap.fitBounds).toHaveBeenCalled();
      // 由于_moveTrackingRect改变了_previousPoint的值，这里应该是新的值
      expect(viewModel._previousPoint).toEqual([5, 5]);
      expect(viewModel._currentPoint).toEqual([5, 5]);

      // 测试鼠标抬起
      viewModel._mouseUp(mockMouseDownEvent);
      expect(viewModel._isDragging).toBe(false);
      expect(viewModel._ticking).toBe(false);
    });

    it('should move tracking rect', () => {
      viewModel._trackingRect = mockMiniMap.getSource();
      
      const bounds = {
        _ne: { lng: 10, lat: 10 },
        _sw: { lng: 0, lat: 0 }
      };
      
      viewModel._trackingRect._data.properties.bounds = bounds;
      
      const newBounds = viewModel._moveTrackingRect([1, 1]);
      
      expect(newBounds._ne.lng).toBe(9);
      expect(newBounds._ne.lat).toBe(9);
      expect(newBounds._sw.lng).toBe(-1);
      expect(newBounds._sw.lat).toBe(-1);
    });

    it('should convert bounds to points', () => {
      const bounds = {
        _ne: { lng: 10, lat: 10 },
        _sw: { lng: 0, lat: 0 }
      };
      
      viewModel._convertBoundsToPoints(bounds);
      
      const coords = viewModel._trackingRectCoordinates[0];
      expect(coords[0]).toEqual([10, 10]); // ne
      expect(coords[1]).toEqual([0, 10]);  // sw.lng, ne.lat
      expect(coords[2]).toEqual([0, 0]);   // sw
      expect(coords[3]).toEqual([10, 0]);  // ne.lng, sw.lat
      expect(coords[4]).toEqual([10, 10]); // 回到ne闭合
    });

    it('should handle bounds edge cases', () => {
      // 测试超出范围的经纬度
      let latlng = viewModel._handleBounds({ lng: 200, lat: 100 });
      expect(latlng.lng).toBe(180);
      expect(latlng.lat).toBe(90);
      
      latlng = viewModel._handleBounds({ lng: -200, lat: -100 });
      expect(latlng.lng).toBe(-180);
      expect(latlng.lat).toBe(-90);
    });

    it('should adjust zoom', () => {
      viewModel.setMap({ map: mockParentMap });
      viewModel.setContainer(mockContainer);
      viewModel._miniMap = mockMiniMap;
      
      viewModel._zoomAdjust();
      
      expect(mockMiniMap.setCenter).toHaveBeenCalledWith({ lng: 5, lat: 5 });
      expect(mockMiniMap.setZoom).toHaveBeenCalledWith(5); // 10 - 5 = 5
    });

    it('should set style', () => {
      viewModel.setMap({ map: mockParentMap });
      viewModel.setContainer(mockContainer);
      viewModel._miniMap = mockMiniMap;
      
      viewModel._setStyle();
      
      expect(mockMiniMap.setStyle).toHaveBeenCalled();
    });

    it('should add rect layers', () => {
      viewModel.setMap({ map: mockParentMap });
      viewModel.setContainer(mockContainer);
      viewModel._miniMap = mockMiniMap;
      
      viewModel._addRectLayers();
      
      expect(mockMiniMap.addSource).toHaveBeenCalledWith('trackingRect', expect.any(Object));
      expect(mockMiniMap.addLayer).toHaveBeenCalledTimes(2); // outline and fill
    });

    it('should cleanup on removal', () => {
      viewModel.setMap({ map: mockParentMap });
      viewModel.setContainer(mockContainer);
      viewModel._miniMap = mockMiniMap;
      
      viewModel.removed();
      
      expect(mockParentMap.off).toHaveBeenCalledWith('move', expect.any(Function));
      expect(mockParentMap.off).toHaveBeenCalledWith('styledata', expect.any(Function));
      expect(mockMiniMap.off).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(mockMiniMap.off).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(mockMiniMap.off).toHaveBeenCalledWith('mouseup', expect.any(Function));
      expect(mockMiniMap.remove).toHaveBeenCalled();
    });
  });
});