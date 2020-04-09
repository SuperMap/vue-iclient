import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';

/**
 * @class ScaleViewModel
 * @description scale viewModel.
 * @param {Object} map - map 对象。
 * @param {Object} options - 可选参数。
 * @param {string} [options.unit='metric] - 比例尺单位。
 * @param {number} [options.maxWidth=100] - 比例尺单位。
 * @fires ScaleViewModel#scaleupdated
 * @extends mapboxgl.Evented
 */
export default class ScaleViewModel extends mapboxgl.Evented {
  constructor(options) {
    super();
    options = options || {};
    this.options = {
      unit: options.unit || 'metric',
      maxWidth: options.maxWidth || 100
    };
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
    this.onMoveEvt = this.onMoveEvt.bind(this);
    this.map.on('move', this.onMoveEvt);
    this.updateScale(this.map, this.options);
  }

  onMoveEvt() {
    this.updateScale(this.map, this.options);
  }

  setUnit(unit) {
    this.options.unit = unit;
    this.updateScale(this.map, this.options);
  }

  setMaxWidth(maxWidth) {
    this.options.maxWidth = maxWidth;
    this.updateScale(this.map, this.options);
  }

  updateScale(map, options) {
    const maxWidth = options && options.maxWidth || 100;

    const y = map._container.clientHeight / 2;
    const maxMeters = this._getDistance(map.unproject([0, y]), map.unproject([maxWidth, y]));

    if (options && options.unit === 'imperial') {
      const maxFeet = 3.2808 * maxMeters;
      if (maxFeet > 5280) {
        const maxMiles = maxFeet / 5280;
        this._setScale(maxWidth, maxMiles, 'mi');
      } else {
        this._setScale(maxWidth, maxFeet, 'ft');
      }
    } else if (options && options.unit === 'nautical') {
      const maxNauticals = maxMeters / 1852;
      this._setScale(maxWidth, maxNauticals, 'nm');
    } else {
      this._setScale(maxWidth, maxMeters, 'm');
    }
  }
  removed() {
    this.map.off('move', this.onMoveEvt);
  }
  _setScale(maxWidth, maxDistance, unit) {
    let distance = this._getRoundNum(maxDistance);
    const ratio = distance / maxDistance;

    if (unit === 'm' && distance >= 1000) {
      distance = distance / 1000;
      unit = 'km';
    }
    let containerWidth = `${maxWidth * ratio}px`;
    let containerContent = distance + unit;
    /**
         * @event ScaleViewModel#scaleupdated
         * @description scale 更新成功。
         * @property {string} containerWidth - scale width。
         * @property {string} containerContent - scale content。
         */
    this.fire('scaleupdated', {
      containerWidth,
      containerContent
    });
  }

  _getDistance(latlng1, latlng2) {
    const R = 6371000;
    const rad = Math.PI / 180;
    const lat1 = latlng1.lat * rad;
    const lat2 = latlng2.lat * rad;
    const a = Math.sin(lat1) * Math.sin(lat2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.cos((latlng2.lng - latlng1.lng) * rad);
    const maxMeters = R * Math.acos(Math.min(a, 1));
    return maxMeters;
  }

  _getDecimalRoundNum(d) {
    const multiplier = Math.pow(10, Math.ceil(-Math.log(d) / Math.LN10));
    return Math.round(d * multiplier) / multiplier;
  }

  _getRoundNum(num) {
    const pow10 = Math.pow(10, (`${Math.floor(num)}`).length - 1);
    let d = num / pow10;

    d = d >= 10 ? 10
      : d >= 5 ? 5
        : d >= 3 ? 3
          : d >= 2 ? 2
            : d >= 1 ? 1 : this._getDecimalRoundNum(d);

    return pow10 * d;
  }
}
