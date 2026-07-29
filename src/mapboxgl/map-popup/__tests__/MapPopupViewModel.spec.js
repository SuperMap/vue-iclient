import MapPopupViewModel from '../MapPopupViewModel';
import Map from '@mocks/map';
import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';

const mockPopup = {
  setLngLat: jest.fn().mockReturnThis(),
  setDOMContent: jest.fn().mockReturnThis(),
  addTo: jest.fn().mockReturnThis(),
  remove: jest.fn()
};
jest.spyOn(mapboxgl, 'Popup').mockImplementation(() => mockPopup);

describe('MapPopupViewModel', () => {
  let map;
  let viewModel;

  beforeEach(() => {
    map = new Map({
      style: { center: [0, 0], zoom: 1, layers: [], sources: {} }
    });
    viewModel = new MapPopupViewModel(map);
  });

  afterEach(() => {
    viewModel.removed();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('creates instance with map', () => {
      expect(viewModel.map).toBe(map);
      expect(viewModel.popup).toBeNull();
    });
  });

  describe('setMap', () => {
    it('sets the map instance', () => {
      const newMap = new Map({
        style: { center: [0, 0], zoom: 1, layers: [], sources: {} }
      });
      viewModel.setMap({ map: newMap });
      expect(viewModel.map).toBe(newMap);
    });
  });

  describe('addPopup', () => {
    it('creates popup with coordinates and container', () => {
      const coordinates = [110, 30];
      const popupContainer = document.createElement('div');

      const popup = viewModel.addPopup(coordinates, popupContainer);

      expect(popup).toBeDefined();
      expect(mapboxgl.Popup).toHaveBeenCalled();
    });

    it('removes existing popup before adding new one', () => {
      const coordinates = [110, 30];
      const popupContainer = document.createElement('div');

      viewModel.addPopup(coordinates, popupContainer);
      const firstPopup = viewModel.popup;

      viewModel.addPopup(coordinates, popupContainer);
      const secondPopup = viewModel.popup;

      expect(firstPopup).toBe(secondPopup);
    });

    it('returns null when popupContainer is null', () => {
      const coordinates = [110, 30];
      const popup = viewModel.addPopup(coordinates, null);
      expect(popup).toBeNull();
    });
  });

  describe('removePopup', () => {
    it('removes popup and sets to null', () => {
      const coordinates = [110, 30];
      const popupContainer = document.createElement('div');

      viewModel.addPopup(coordinates, popupContainer);
      expect(viewModel.popup).not.toBeNull();

      viewModel.removePopup();
      expect(viewModel.popup).toBeNull();
    });

    it('does nothing when popup is already null', () => {
      expect(() => viewModel.removePopup()).not.toThrow();
    });
  });

  describe('removed', () => {
    it('calls removePopup', () => {
      const coordinates = [110, 30];
      const popupContainer = document.createElement('div');

      viewModel.addPopup(coordinates, popupContainer);
      viewModel.removed();

      expect(viewModel.popup).toBeNull();
    });
  });
});
