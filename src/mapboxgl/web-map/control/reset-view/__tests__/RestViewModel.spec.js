import ResetViewModel from '../RestViewModel';

describe('ResetViewModel', () => {
  let viewModel;
  let mockMap;
  let mockMapData;

  beforeEach(() => {
    viewModel = new ResetViewModel();
    mockMap = {
      flyTo: jest.fn()
    };
    mockMapData = {
      mapOptions: {
        center: [120, 30],
        zoom: 10,
        bearing: 45,
        pitch: 60
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setMap', () => {
    it('should set map and mapOptions correctly', () => {
      viewModel.setMap({ mapData: mockMapData, map: mockMap });

      expect(viewModel.map).toBe(mockMap);
      expect(viewModel.mapOptions).toBe(mockMapData.mapOptions);
    });
  });

  describe('resetView', () => {
    it('should call flyTo with correct parameters and default duration', () => {
      viewModel.setMap({ mapData: mockMapData, map: mockMap });
      viewModel.resetView();

      expect(mockMap.flyTo).toHaveBeenCalledWith({
        center: [120, 30],
        zoom: 10,
        bearing: 45,
        pitch: 60,
        duration: 1000
      });
    });

    it('should call flyTo with custom duration', () => {
      viewModel.setMap({ mapData: mockMapData, map: mockMap });
      viewModel.resetView(2000);

      expect(mockMap.flyTo).toHaveBeenCalledWith({
        center: [120, 30],
        zoom: 10,
        bearing: 45,
        pitch: 60,
        duration: 2000
      });
    });

    it('should not call flyTo when map is null', () => {
      viewModel.resetView();

      expect(mockMap.flyTo).not.toHaveBeenCalled();
    });

    it('should handle empty mapOptions', () => {
      viewModel.setMap({ mapData: { mapOptions: {} }, map: mockMap });
      viewModel.resetView();

      expect(mockMap.flyTo).toHaveBeenCalledWith({
        center: undefined,
        zoom: undefined,
        bearing: undefined,
        pitch: undefined,
        duration: 1000
      });
    });

    it('should handle partial mapOptions', () => {
      const partialMapData = {
        mapOptions: {
          center: [110, 25],
          zoom: 8
        }
      };
      viewModel.setMap({ mapData: partialMapData, map: mockMap });
      viewModel.resetView(500);

      expect(mockMap.flyTo).toHaveBeenCalledWith({
        center: [110, 25],
        zoom: 8,
        bearing: undefined,
        pitch: undefined,
        duration: 500
      });
    });
  });

  describe('removed', () => {
    it('should set map and mapOptions to null', () => {
      viewModel.setMap({ mapData: mockMapData, map: mockMap });
      viewModel.removed();

      expect(viewModel.map).toBeNull();
      expect(viewModel.mapOptions).toBeNull();
    });

    it('should not throw error when called without setMap', () => {
      expect(() => viewModel.removed()).not.toThrow();
      expect(viewModel.map).toBeNull();
      expect(viewModel.mapOptions).toBeNull();
    });
  });
});