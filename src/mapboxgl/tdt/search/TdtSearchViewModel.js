import mapboxgl from '../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import {
  config,
  request,
  tiandituSearch,
  tiandituTransit,
  sourceNames,
  getStatisticsResult,
  tdtSetHighlightIcon,
  resetSearchSourceData,
  toBBoxString,
  addPoints,
  clearSearchResultLayer,
  generatePointsFeatures
} from '../_utils/service';
import bbox from '@turf/bbox';
import transformScale from '@turf/transform-scale';
import { geti18n } from '../../../common/_lang';

export default class TdtSearchViewModel extends mapboxgl.Evented {
  constructor(options) {
    super();
    this.options = options || {};
    this.groupLineList = {};
    this.data = options.data;
    this.searchResultPoints = sourceNames.searchResultPoints;
    this.searchResultLine = sourceNames.searchResultLine;
    this.searchResultPolygon = sourceNames.searchResultPolygon;
    this.searchResultPointsOfLine = sourceNames.searchResultPointsOfLine;
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    if (map) {
      this.map = map;
      this.registerEvents();
    } else {
      return new Error(`Cannot find map`);
    }
  }

  registerEvents() {
    this.registerPointsEvent();
    this.registerLinesEvent();
  }

  registerPointsEvent() {
    this.map.on('click', this.searchResultPoints, e => {
      const properties = e.features[0].properties;
      this.showPointPopup(e.lngLat, properties);
    });

    this.map.on('mouseenter', this.searchResultPoints, () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', this.searchResultPoints, () => {
      this.map.getCanvas().style.cursor = '';
    });
  }

  registerLinesEvent() {
    this.map.on('click', `${this.searchResultPointsOfLine}-stroke`, e => {
      const properties = e.features[0].properties;
      this.showPointPopup(e.lngLat, properties, 'LineString');
    });
    this.map.on('mouseenter', `${this.searchResultPointsOfLine}-stroke`, e => {
      this.map.getCanvas().style.cursor = 'pointer';
      this.showLineHoverPopup(e);
    });

    this.map.on('mouseleave', `${this.searchResultPointsOfLine}-stroke`, () => {
      this.map.getCanvas().style.cursor = '';
      this._removeHoverPopup();
    });
  }

  showPointPopup(coordinate, pointInfo, from = 'Point') {
    this._removeResultPopup();
    const content = this._getPopupContent(from, pointInfo);
    this.resultPopup = new mapboxgl.Popup({
      anchor: 'bottom',
      offset: [0, -10],
      className: 'tdt-search-popup'
    })
      .setLngLat(coordinate)
      .setDOMContent(content)
      .addTo(this.map);
    this.map.easeTo({
      center: coordinate
    });
  }

  showLineHoverPopup(e) {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const properties = e.features[0].properties;
    const popDom = `<div style='padding: 5px;'>
    <div style='background: #0099ff; line-height: 28px; padding: 0 10px; font-size: 12px; color: #fff'>${
  properties.name
}</div>
    </div>`;
    this.hoverPopup = new mapboxgl.Popup({
      closeButton: false,
      offset: [0, -10],
      className: 'tdt-search-line-hover-popup'
    })
      .setLngLat(coordinates)
      .setHTML(popDom)
      .addTo(this.map);
  }

  setData(data) {
    this.data = Object.assign(this.data, data);
    this.style = 0;
  }
  _getPopupContent(from, data) {
    const container = document.createElement('div');
    container.className = 'popup-container';
    container.innerHTML = `
      <div class="title" title=${data.name}>
        <div class="region">${data.name}</div>
      </div>
    `;
    const content = document.createElement('div');
    content.className = 'content';
    content.innerHTML = `
      ${
  from === 'Point'
    ? `<div>
          <div class="phone">${geti18n().t('tdtSearch.phone')}： ${data.phone || geti18n().t('tdtSearch.noData')}</div>
          <div class="address">${geti18n().t('tdtSearch.address')}： ${data.address ||
              geti18n().t('tdtSearch.noData')}</div>
        </div>`
    : ''
}
      ${
  from === 'LineString'
    ? `<div>
        <div class="address">${geti18n().t('tdtSearch.transport')}： ${data.address ||
              geti18n().t('tdtSearch.noData')}</div>
      </div>`
    : ''
}
    `;
    const group = document.createElement('div');
    group.className = 'operate-group';
    const startItem = document.createElement('div');
    startItem.className = 'start-item';
    startItem.onclick = () => this._setPosition('start', data);
    startItem.innerHTML = '<span>设为起点</span>';
    const endItem = document.createElement('div');
    endItem.className = 'end-item';
    endItem.onclick = () => this._setPosition('end', data);
    endItem.innerHTML = '<span>设为终点</span>';
    group.appendChild(startItem);
    group.appendChild(endItem);
    // content.appendChild(group);
    container.appendChild(content);
    return container;
  }

  _setPosition(type, data) {
    const { name, lonlat } = data;
    let coordinates = lonlat.split(' ');
    coordinates = coordinates.length < 2 ? lonlat.split(',') : coordinates;
    this._transformMsg(type, [+coordinates[0], +coordinates[1]], name);
  }

  _transformMsg(type, coordinates, name) {
    if (coordinates) {
      if (!name) {
        this._getPointInfo(type, coordinates);
      } else {
        this._resetPoint(type, name, coordinates);
      }
    }
  }

  _getPointInfo(type, coordinates) {
    const url = config.GEOCODE_URL;
    const postStr = {
      lon: coordinates[0],
      lat: coordinates[1],
      ver: 1
    };
    const params = {
      postStr: JSON.stringify(postStr),
      type: 'geocode',
      tk: this.options.data.tk
    };
    request(url, params).then(res => {
      const { addressComponent = {} } = res.result;
      const name = this._convertName(addressComponent);
      this._resetPoint(type, name, coordinates);
    });
  }

  _resetPoint(type, name, coordinates) {
    const coordinatesType = {
      start: 'startLnglat',
      end: 'endLnglat'
    };
    const data = {
      [type]: name,
      [coordinatesType[type]]: coordinates
    };
    this.fire('reset-position', { data });
  }

  _convertName(addressComponent) {
    const { poi, poi_distance: poiDistance, road, road_distance: roadDistance } = addressComponent;
    if (poi && poiDistance) {
      return poiDistance > roadDistance
        ? roadDistance > 10
          ? `${road}附近`
          : road
        : poiDistance > 10
          ? `${poi}附近`
          : poi;
    }
    return '未知地点';
  }

  /**
   * @function SearchViewModel.prototype.search
   * @description 开始搜索。
   * @param {String} keyWord - 搜索关键字。
   */
  search(keyWord, params) {
    this.keyWord = keyWord;
    return this._searchFromTianditu(params);
  }

  // queryType: '1' 表示搜索，queryType: '4' 表示普通建议词搜索，queryType: '7' 表示纯POI搜索（不搜公交线）
  _searchFromTianditu(params = {}) {
    const data = this.options.data || {};
    const commonData = {
      keyWord: this.keyWord,
      queryType: '4',
      start: '0',
      count: '10',
      level: Math.round(this.map.getZoom()) + 1,
      mapBound: this._toBBoxString() // 如果params里没有mapBound， 就重新获取一个（例如search）
    };
    return tiandituSearch(data.searchUrl || 'https://api.tianditu.gov.cn/search', {
      postStr: JSON.stringify(Object.assign({}, commonData, params)),
      type: 'query',
      tk: data.tk
    })
      .then(res => {
        if (+res.count || (!+res.count && res.prompt)) {
          return res;
        }
      })
      .catch(error => {
        const err = error && error.isCancel ? null : error;
        return Promise.reject(err);
      });
  }

  _toBBoxString() {
    return toBBoxString(this.map);
  }

  getFeatureInfo(searchKey, params) {
    const { resultRender } = this.options;
    this.keyWord = searchKey;
    this.groupLineList = {};
    this.reset();
    return this._searchFromTianditu(params).then(data => {
      this.fire('search-selected-info', { data });
      if (resultRender) return;
      const result = this._showResultToMap(data);
      return result;
    });
  }

  _showResultToMap(data) {
    let features;
    let type;
    let result;
    let prompt = data.prompt && data.prompt.find(item => +item.type === 4);
    if (data.pois && data.pois.length) {
      type = 'Point';
      result = data.pois;
      features = this._generatePointsFeatures(result);
      this._addPoints(features);
    } else if (data.lineData && data.lineData.length) {
      type = 'LineString';
      result = data.lineData;
      const firstUuid = data.lineData[0].uuid;
      this.showLineDetail(firstUuid);
    } else if (data.area) {
      type = 'Polygon';
      result = data.area;
      features = this._generateAreaFeatures(data.area);
      this._addPolygon(features);
    } else if (data.statistics) {
      type = 'Statistics';
      result = getStatisticsResult(data.statistics);
    } else {
      result = data.prompt;
    }
    return { type, result: { count: +data.count, data: result, prompt: ((prompt || {}).admins || [])[0] } };
  }

  _generatePointsFeatures(data, splitFlag = ' ') {
    return generatePointsFeatures(data, splitFlag);
  }

  _generateLinesFeatures(data) {
    let coordinates = [];
    const points = data.linepoint.split(';');
    points.forEach(item => {
      const point = item.split(',');
      if (point && point.length === 2) {
        coordinates.push([+point[0], +point[1]]);
      }
    });
    const feature = {
      type: 'Feature',
      properties: data,
      geometry: {
        type: 'LineString',
        coordinates
      }
    };
    return feature;
  }

  _generateAreaFeatures(area) {
    const { points = [] } = area;
    const region = (points[0] || {}).region || '';
    const data = region.split(',');
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          data.map(item => {
            const items = item.split(' ');
            items[0] = +items[0];
            items[1] = +items[1];
            return items;
          })
        ]
      },
      properties: area
    };
    return feature;
  }

  showLineDetail(uuid, addLine = true) {
    if (!uuid) return;

    if (!this.groupLineList[uuid]) {
      this._transitByUuid(uuid).then(res => {
        if (res) {
          this.groupLineList[uuid] = res;
          addLine && this._addLines(this._generateLinesFeatures(res));
          this.fire('get-transit-data-succeeded', { data: this.groupLineList });
        }
      });
    } else {
      addLine && this._addLines(this._generateLinesFeatures(this.groupLineList[uuid]));
    }
  }

  _transitByUuid(uuid) {
    const url = config.BUS_URL;
    const params = {
      postStr: JSON.stringify({ uuid }),
      type: 'busline',
      tk: this.options.data.tk
    };
    return tiandituTransit(url, params);
  }

  _addPoints(features) {
    addPoints(this.map, this.searchResultPoints, features);
  }

  _addPointsOfLine(features) {
    if (features && this.map) {
      const source = this.map.getSource(this.searchResultPointsOfLine);
      const sourceData = features;
      if (source) {
        source.setData(sourceData);
      } else {
        this.map.addSource(this.searchResultPointsOfLine, {
          type: 'geojson',
          data: sourceData
        });

        this.map.addLayer({
          id: `${this.searchResultPointsOfLine}-fill`,
          type: 'circle',
          source: this.searchResultPointsOfLine,
          paint: {
            'circle-radius': 6,
            'circle-color': '#3385ff'
          }
        });
        this.map.addLayer({
          id: `${this.searchResultPointsOfLine}-stroke`,
          type: 'circle',
          source: this.searchResultPointsOfLine,
          paint: {
            'circle-radius': 4,
            'circle-color': '#fff'
          }
        });
      }
    }
  }

  _addLines(feature) {
    if (feature && this.map) {
      const source = this.map.getSource(this.searchResultLine);
      const sourceData = feature;
      const lineFill = `${this.searchResultPointsOfLine}-fill`;
      this._addPointsOfLine(this._generatePointsFeatures(feature.properties.station || [], ','));
      if (source) {
        source.setData(sourceData);
      } else {
        this.map.addSource(this.searchResultLine, {
          type: 'geojson',
          data: sourceData
        });
        this.map.addLayer(
          {
            id: this.searchResultLine,
            type: 'line',
            source: this.searchResultLine,
            layout: {
              'line-cap': 'round'
            },
            paint: {
              'line-width': 8,
              'line-color': 'rgb(92,155,239)',
              'line-opacity': 1
            }
          },
          lineFill
        );
      }

      const bounds = bbox(transformScale(sourceData, 1.7));
      this.map.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]]);
    }
  }

  _addPolygon(feature) {
    if (feature && this.map) {
      const map = this.map;
      if (feature && map) {
        const source = map.getSource(this.searchResultPolygon);
        const sourceData = feature;
        if (source) {
          source.setData(sourceData);
        } else {
          map.addSource(this.searchResultPolygon, {
            type: 'geojson',
            data: sourceData
          });
          map.addLayer({
            id: `${this.searchResultPolygon}-stroke`,
            type: 'line',
            source: this.searchResultPolygon,
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-width': 3,
              'line-dasharray': [0.6, 1.2],
              'line-color': '#0027eb'
            }
          });
          map.addLayer({
            id: this.searchResultPolygon,
            type: 'fill',
            source: this.searchResultPolygon,
            layout: {},
            paint: {
              'fill-color': 'rgb(0, 0, 255)',
              'fill-opacity': 0.1
            }
          });
        }
        const bounds = feature.properties.bound.split(',');
        const mapBound = [[bounds[0], bounds[1]], [bounds[2], bounds[3]]];
        map.fitBounds(mapBound);
      }
    }
  }

  setHighlightIcon(hotPointID) {
    tdtSetHighlightIcon(this.map, this.searchResultPoints, hotPointID);
  }

  _resetSearchSourceData() {
    resetSearchSourceData(this.map);
  }

  _removeHoverPopup() {
    this.hoverPopup && this.hoverPopup.remove();
    this.hoverPopup = null;
  }

  _removeResultPopup() {
    this.resultPopup && this.resultPopup.remove();
    this.resultPopup = null;
  }

  reset() {
    this._removeResultPopup();
    this._resetSearchSourceData();
  }

  _clearSearchResultLayer() {
    clearSearchResultLayer(this.map);
  }

  removed() {
    this.groupLineList = {};
    if (!this.options.resultRender) {
      this._removeResultPopup();
      this._clearSearchResultLayer();
    }
  }
}
