import mapboxgl from '../../../static/libs/mapboxgl/mapbox-gl-enhance';

export default class ChartViewModel extends mapboxgl.Evented {
  constructor(options) {
    super();
    this.options = options;
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
  }

  setPopupContent(coordinates, popupContainer, callback) {
    this.removed();
    popupContainer.style.display = 'block';
    this.popup = new mapboxgl.Popup({
      className: 'sm-mapboxgl-tabel-popup sm-component-chart-result-popup',
      closeOnClick: true,
      closeButton: false,
      maxWidth: 'none',
      anchor: 'bottom'
    });
    this.marker = new mapboxgl.Marker();
    this.popup
      .setLngLat(coordinates)
      .setDOMContent(popupContainer)
      .addTo(this.map);
    this.popup.on('open', () => {
      callback && callback();
    });
    this.marker
      .setLngLat(coordinates)
      .setPopup(this.popup)
      .addTo(this.map);
    this.map.flyTo({ center: coordinates });
  }

  removed() {
    if (this.popup) {
      this.popup.remove();
      this.popup = null;
    }
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }
  }
}
