import L from 'vue-iclient/src/leaflet/leaflet-wrapper';

export default class ChartViewModel extends L.Evented {
  constructor(map, options) {
    super(null);
    this.map = map;
    this.options = options;
  }

  setPopupContent(coordinates, popupContainer, callback) {
    this.clear();
    const fromatCoordinates = L.GeoJSON.coordsToLatLng(coordinates);
    popupContainer.style.display = 'block';
    this.popup = new L.Popup({
      className: 'sm-leaflet-tabel-popup sm-component-chart-result-popup',
      closeOnClick: true,
      maxWidth: 800
    });
    this.marker = new L.Marker();
    this.popup.setLatLng(fromatCoordinates).setContent(popupContainer);
    this.map.on('popupopen', () => {
      callback && callback();
    });
    this.marker
      .setLatLng(fromatCoordinates)
      .bindPopup(this.popup)
      .addTo(this.map);
    this.map.flyTo(fromatCoordinates);
  }

  clear() {
    if (this.popup) {
      this.popup.remove();
      this.popup = null;
    }
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }
    if (this.map) {
      this.map.off('popupopen', () => {});
    }
  }
}
