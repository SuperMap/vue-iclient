import mapboxgl from '../../../static/libs/mapboxgl/mapbox-gl-enhance';
import clonedeep from 'lodash.clonedeep';
import turfCenter from '@turf/center';
import '../../../static/libs/iclient-mapboxgl/iclient9-mapboxgl.min';
import iPortalDataService from '../_utils/iPortalDataService';
import iServerRestService from '../_utils/iServerRestService';
import * as tiandituApi from '../../common/api/tiandituSearch';
/**
 * @class SearchViewModel
 * @classdesc 数据搜索功能类。
 * @category  ViewModel
 * @param {mapboxgl.Map} map - mapboxgl map 对象。
 * @param {Object} [options] - 可选参数。
 * @param {Object} [options.maxFeatures=8] - 最多可返回的要素数量，最大值为 100。
 * @param {Array.<string>} [options.layerNames] - 地图图层搜索配置，如：'['UNIQUE-民航数']'。
 * @param {Array.<string>} [options.restMap] - iServer 地图服务搜索配置。
 * @param {string} options.restMap.url - 地图服务地址。
 * @param {string} options.restMap.layerName - 搜索图层名。
 * @param {string} [options.restMap.name] - 搜索结果名称。
 * @param {Array.<string>} [options.restData] - iServer 数据服务搜索配置。
 * @param {string} options.restData.url - 数据服务地址。
 * @param {Array} options.restData.dataName - 搜索数据集名数组。
 * @param {string} [options.restData.name] - 搜索结果名称。
 * @param {Array.<string>} [options.iportalData] - iPortal 数据搜索配置。
 * @param {string} options.iportalData.url - 数据地址。
 * @param {string} [options.iportalData.name] - 搜索结果名称。
 * @param {Array.<string>} [options.addressMatch] - iServer 地址匹配服务搜索配置。
 * @param {string} options.addressMatch.url - 地址匹配服务地址。
 * @param {string} [options.addressMatch.name] - 搜索结果名称。
 * @param {Object} [options.onlineLocalSearch] - online 本地搜索配置。
 * @param {Boolean} [options.onlineLocalSearch.enable=true] - 是否开启 online 本地搜索。
 * @fires SearchViewModel#searchsucceeded
 * @fires SearchViewModel#searchfailed
 */
export default class SearchViewModel extends mapboxgl.Evented {
  constructor(map, options) {
    super();
    this.options = options || {};
    this.searchTaskId = 0;
    this.options.cityGeoCodingConfig = {
      addressUrl: 'http://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos',
      key: options.onlineLocalSearch.key || 'fvV2osxwuZWlY0wJb8FEb2i5'
    };
    if (map) {
      this.map = map;
    } else {
      return new Error(`Cannot find map`);
    }
    this.searchtType = [
      'layerNames',
      'onlineLocalSearch',
      'restMap',
      'restData',
      'iportalData',
      'addressMatch',
      'tiandituSearch'
    ];
    this.markerList = [];
    this.popupList = [];
    this.errorSourceList = {};
    this.searchNormalOfTianditu = false;
  }

  /**
   * @function SearchViewModel.prototype.setTiandituSearchNormal
   * @description 用于判断天地图搜索是普通搜索(queryType: 1)或者普通建议搜索(queryType: 4)。
   * @param {String} keyWord - 搜索关键字。
   */
  setTiandituSearchNormal(value) {
    this.searchNormalOfTianditu = value;
  }

  /**
   * @function SearchViewModel.prototype.search
   * @description 开始搜索。
   * @param {String} keyWord - 搜索关键字。
   */
  search(keyWord) {
    this.searchCount = 0;
    this.searchResult = {};
    this.errorSourceList = {};
    this.keyWord = keyWord;
    this.maxFeatures = parseInt(this.options.maxFeatures) >= 100 ? 100 : parseInt(this.options.maxFeatures) || 8;
    this.searchtType.forEach(item => {
      if (this.options[item]) {
        if (
          (item === 'onlineLocalSearch' && this.options[item].enable) ||
          (item === 'tiandituSearch' && this.options[item].enable)
        ) {
          this.searchCount += 1;
        } else if (item !== 'onlineLocalSearch') {
          let len = this.options[item].length;
          this.searchCount += len;
        }
      }
    }, this);
    let { layerNames, onlineLocalSearch, restMap, restData, iportalData, addressMatch, tiandituSearch } = {
      ...this.options
    };
    layerNames && this._searchFromLayer(layerNames);
    onlineLocalSearch.enable && this._searchFromPOI(onlineLocalSearch);
    restMap && this._searchFromRestMap(restMap);
    restData && this._searchFromRestData(restData);
    iportalData && this._searchFromIportal(iportalData);
    addressMatch && this._searchFromAddressMatch(addressMatch);
    tiandituSearch.enable && this._searchFromTianditu();
    return this.searchTaskId;
  }

  /**
   * @function SearchViewModel.prototype.getFeatureInfo
   * @description 获取搜索结果的要素信息。
   * @param {String} searchKey - 搜索关键字。
   * @param {String} data - 过滤数据。
   * @param {String} sourceName - 要素的来源名称。
   */
  getFeatureInfo(searchKey, data, sourceName) {
    const { resultRender } = this.options;
    this.keyWord = searchKey;
    this._reset();
    if (sourceName === 'Tianditu Search') {
      this._searchFromTianditu().then(res => {
        const { data: info = {} } = res;
        let data = info.lineData || info.pois || (info.area && [info.area]);
        if (resultRender && typeof resultRender === 'function') {
          resultRender(data);
          return;
        }
        if (!data || data.length) return;
        if (res.type === 'Point' || res.type === 'Polygon') {
          data.forEach((item, index) => {
            const feature = {
              geometry: {},
              properties: {}
            };
            const center = (item.lonlat || '').split(/\s|,/);
            feature.geometry.type = res.type;
            feature.geometry.coordinates = [+center[0], +center[1]];
            feature.properties = item;
            this._showResultToMap(feature, sourceName, index + 1);
          });
        } else {
          console.log('线需要二次请求');
        }
      });
      return;
    }
    this.fire('search-selected-info' + this.searchTaskId, { data });
    if (resultRender && typeof resultRender === 'function') {
      resultRender(data);
      return;
    }
    this._showResultToMap(data, sourceName);
  }

  _showResultToMap(feature, sourceName) {
    const geometry = feature.geometry || [feature.location.x, feature.location.y];
    if (!this.options.alwaysCenter && (geometry.type === 'MultiPolygon' || geometry.type === 'Polygon')) {
      this._addPolygon(feature, sourceName);
    } else if (!this.options.alwaysCenter && geometry.type === 'LineString') {
      this._addLine(feature, sourceName);
    } else {
      this._addPoint(feature, sourceName);
    }
  }

  _addPoint(feature, sourceName) {
    const properties = feature.properties || feature;
    const geometry = feature.geometry || [feature.location.x, feature.location.y];
    let pointData = { coordinates: null, info: [] };
    if (sourceName === 'Tianditu Search') {
      pointData.coordinates = geometry.coordinates;
      for (let key in properties) {
        if ((key === 'name' || key === 'address' || key === 'phone') && properties[key]) {
          pointData.info.push({ attribute: key, attributeValue: properties[key] });
        }
      }
    } else {
      const propertiesValue = properties.address || feature.filterAttribute.filterAttributeValue || properties.name;
      if (geometry.type === 'MultiPolygon' || geometry.type === 'Polygon' || geometry.type === 'LineString') {
        pointData.coordinates = turfCenter(feature).geometry.coordinates;
      } else {
        pointData.coordinates = geometry.coordinates || geometry;
      }
      if (this.keyWord.indexOf('：') < 0) {
        pointData.info.push({ attribute: '地址', attributeValue: propertiesValue });
      } else {
        for (let key in properties) {
          properties[key] && pointData.info.push({ attribute: key, attributeValue: properties[key] });
        }
      }
    }
    this.fire('set-popup-content' + this.searchTaskId, { popupData: pointData });
  }

  _addLine() {
    console.log('draw line here');
  }

  _addPolygon(feature, sourceName) {
    if (feature && this.map) {
      const properties = feature.properties || feature;
      let coordinates = feature.geometry.coordinates;
      let center = turfCenter(feature).geometry.coordinates;
      if (sourceName === 'Tianditu Search') {
        const { points = [], lonlat } = properties;
        const region = (points[0] || {}).region || '';
        const data = region.split(',');
        coordinates = [
          data.map(item => {
            const items = item.split(' ');
            items[0] = +items[0];
            items[1] = +items[1];
            return items;
          })
        ];
        const centerData = lonlat.split(',');
        center = [+centerData[0], +centerData[1]];
      }
      const source = this.map.getSource('searchResultLayer');
      const sourceData = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates
        }
      };
      if (source) {
        source.setData(sourceData);
      } else {
        this.map.addLayer({
          id: 'searchResultLayer',
          type: 'fill',
          source: {
            type: 'geojson',
            data: sourceData
          },
          layout: {},
          paint: {
            'fill-color': 'rgb(255, 0, 0)',
            'fill-opacity': 0.8
          }
        });
      }
      this.map.easeTo({
        center
      });
    }
  }
  /**
   * @function SearchViewModel.prototype.addMarker
   * @description 向地图上添加 Marker。
   * @param {Array} coordinates - 坐标数组。
   * @param {HTMLElement} popupContainer - 弹窗 DOM 对象。
   */
  setPopupContent(coordinates, popupContainer) {
    popupContainer = popupContainer && popupContainer.outerHTML.replace(/display:\s*none/, 'display: block');
    const popup = new mapboxgl.Popup({
      className: 'sm-mapboxgl-tabel-popup',
      closeOnClick: true
    });
    const marker = new mapboxgl.Marker();
    this.popupList.push(popup);
    this.markerList.push(marker);
    popup
      .setLngLat(coordinates)
      .setHTML(popupContainer)
      .addTo(this.map);
    marker
      .setLngLat(coordinates)
      .setPopup(popup)
      .addTo(this.map);
    this.map.flyTo({ center: coordinates });
  }

  _searchFromLayer(layerNames) {
    setTimeout(() => {
      layerNames.forEach(sourceName => {
        let source = this.map.getSource(sourceName);
        if (source) {
          let features = clonedeep(source._data.features);
          let resultFeature = this._getFeaturesByKeyWord(this.keyWord, features);
          const results = resultFeature.slice(0, this.maxFeatures);
          if (results.length) {
            results.length && this._searchFeaturesSucceed(results, sourceName);
          } else {
            this._searchFeaturesFailed('', sourceName);
          }
        } else {
          this._searchFeaturesFailed(`The ${sourceName} does not exist`, sourceName);
        }
      }, this);
    }, 0);
  }
  _searchFeaturesFailed(error, sourceName) {
    error && console.log(error);
    if (this.errorSourceList[sourceName]) return;
    this.searchCount--;
    this.errorSourceList[sourceName] = sourceName;
    /**
     * @event SearchViewModel#searchfailed
     * @description 搜索失败后触发。
     * @property {Object} e  - 事件对象。
     */
    this.searchCount === 0 &&
      this.fire('searchfailed' + this.searchTaskId, { error, sourceName }) &&
      (this.searchTaskId += 1);
  }
  _searchFeaturesSucceed(resultFeature, sourceName) {
    if (this.errorSourceList[sourceName]) {
      delete this.errorSourceList[sourceName];
    }
    let result = { source: sourceName, result: resultFeature };
    this.searchResult[sourceName] = result;
    let resultList = [];
    for (let key in this.searchResult) {
      resultList.push(this.searchResult[key]);
    }
    /**
     * @event SearchViewModel#searchsucceeded
     * @description 搜索成功后触发。
     * @property {Object} e  - 事件对象。
     */
    this.fire('searchsucceeded' + this.searchTaskId, { result: resultList }) && (this.searchTaskId += 1);
  }

  _searchFromPOI(onlineLocalSearch) {
    const sourceName = 'Online 本地搜索';
    this.geoCodeParam = {
      pageSize: this.options.pageSize || 10,
      pageNum: this.options.pageNum || 1,
      city: onlineLocalSearch.city
    };
    this.geoCodeParam.keyWords = this.keyWord;
    let url = this._getSearchUrl(this.geoCodeParam);
    SuperMap.FetchRequest.get(url)
      .then(response => {
        return response.json();
      })
      .then(geocodingResult => {
        if (geocodingResult.error) {
          this._searchFeaturesFailed(geocodingResult.error, sourceName);
          return;
        }
        if (geocodingResult.poiInfos && geocodingResult.poiInfos.length === 0) {
          this._searchFeaturesFailed('', sourceName);
          return;
        }
        if (geocodingResult.poiInfos) {
          const geoJsonResult = this._dataToGeoJson(geocodingResult.poiInfos, this.geoCodeParam);
          this._searchFeaturesSucceed(geoJsonResult.slice(0, this.maxFeatures), sourceName);
        }
      })
      .catch(error => {
        this._searchFeaturesFailed(error, sourceName);
      });
  }

  _searchFromRestMap(restMaps) {
    const sourceName = 'Rest Map Search';
    restMaps.forEach(restMap => {
      let iserverService = new iServerRestService(restMap.url);
      iserverService.on('getdatafailed', e => {
        this._searchFeaturesFailed('', sourceName);
      });
      iserverService.on('featureisempty', e => {
        this._searchFeaturesFailed('', sourceName);
      });
      iserverService.on('getdatasucceeded', e => {
        if (e.features) {
          let resultFeatures = this._getFeaturesByKeyWord(this.keyWord, e.features);
          this._searchFeaturesSucceed(resultFeatures, restMap.name || sourceName);
        }
      });
      iserverService.getMapFeatures(
        { dataUrl: restMap.url, mapName: restMap.layerName },
        { maxFeatures: this.maxFeatures, keyWord: this.keyWord }
      );
    }, this);
  }

  _searchFromRestData(restDatas) {
    const sourceName = 'Rest Data Search';
    restDatas.forEach(restData => {
      let iserverService = new iServerRestService(restData.url);
      iserverService.on('getdatafailed', e => {
        this._searchFeaturesFailed('', sourceName);
      });
      iserverService.on('featureisempty', e => {
        this._searchFeaturesFailed('', sourceName);
      });
      iserverService.on('getdatasucceeded', e => {
        if (e.features && e.features.length > 0) {
          let resultFeatures = this._getFeaturesByKeyWord(this.keyWord, e.features);
          this._searchFeaturesSucceed(resultFeatures, restData.name || sourceName);
        }
      });
      let dataSourceName = restData.dataName[0].split(':')[0];
      let datasetName = restData.dataName[0].split(':')[1];
      iserverService.getDataFeatures(
        { datasetName, dataSourceName, dataUrl: restData.url },
        { maxFeatures: this.maxFeatures, keyWord: this.keyWord }
      );
    }, this);
  }

  _searchFromIportal(iportalDatas) {
    const sourceName = 'Iportal Search';
    iportalDatas.forEach(iportal => {
      let iPortalService = new iPortalDataService(iportal.url, iportal.withCredentials || false);
      iPortalService.on('getdatafailed', e => {
        this._searchFeaturesFailed('', sourceName);
      });
      iPortalService.on('featureisempty', e => {
        this._searchFeaturesFailed('', sourceName);
      });
      iPortalService.on('getdatasucceeded', e => {
        if (e.features) {
          let resultFeatures = this._getFeaturesByKeyWord(this.keyWord, e.features);
          this._searchFeaturesSucceed(resultFeatures, iportal.name || sourceName);
        }
      });
      iPortalService.getData({ keyWord: this.keyWord });
    }, this);
  }

  _searchFromAddressMatch(addressMatches) {
    const sourceName = 'Address Match Search';
    addressMatches.forEach(addressMatch => {
      this.addressMatchService = new mapboxgl.supermap.AddressMatchService(addressMatch.url);
      let parm = {
        address: this.keyWord,
        fromIndex: 0,
        toIndex: this.maxFeatures,
        maxReturn: this.maxFeatures,
        prjCoordSys: '{epsgcode:4326}'
      };
      let geoCodeParam = new SuperMap.GeoCodingParameter(parm);
      this.addressMatchService.code(geoCodeParam, e => {
        if (e.result && e.result.length > 0) {
          this._searchFeaturesSucceed(e.result, addressMatch.name || sourceName);
        } else {
          this._searchFeaturesFailed('', sourceName);
        }
      });
    }, this);
  }
  // queryType: '1' 表示搜索，queryType: '4' 表示普通建议词搜索
  _searchFromTianditu() {
    const sourceName = 'Tianditu Search';
    const tiandituSearch = this.options.tiandituSearch || {};
    const commonData = {
      // yingjiType: 1,
      // sourceType: 0,
      keyWord: this.keyWord,
      queryType: '4',
      start: '0',
      count: '10',
      level: Math.round(this.map.getZoom()) + 1,
      mapBound: this._toBBoxString()
    };
    if (this.searchNormalOfTianditu) {
      commonData.queryType = '1';
      commonData.queryTerminal = 10000;
    }
    return tiandituApi
      .tiandituSearch(tiandituSearch.url, {
        postStr: JSON.stringify(Object.assign({}, commonData, tiandituSearch.data)),
        type: 'query',
        tk: tiandituSearch.tk
      })
      .then(res => {
        const dataCollection = res.suggests || res.pois || (res.statistics && [res.statistics]);
        let type;
        let results;
        if (res.area) {
          const result = [res.area];
          type = 'Polygon';
          results = result;
        } else if (res.lineData) {
          type = 'LineString';
          results = res.lineData;
        } else if (dataCollection) {
          type = 'Point';
          results = dataCollection;
        } else if (res.prompt && !+res.count) {
          results = [];
        } else {
          this._searchFeaturesFailed('', sourceName);
        }
        this.searchNormalOfTianditu &&
          results &&
          this.fire('search-selected-info' + this.searchTaskId, { data: res });
        !this.searchNormalOfTianditu && results && this._searchFeaturesSucceed(results, sourceName);
        return { type, data: res };
      })
      .catch(error => {
        if (!error.isCancel) {
          this._searchFeaturesFailed(error, sourceName);
        }
      });
  }

  _toBBoxString() {
    const bounds = this.map.getBounds();
    return (
      bounds.getWest().toFixed(5) +
      ',' +
      bounds.getSouth().toFixed(5) +
      ',' +
      bounds.getEast().toFixed(5) +
      ',' +
      bounds.getNorth().toFixed(5)
    );
  }

  _dataToGeoJson(data, geoCodeParam) {
    let features = [];
    for (let i = 0; i < data.length; i++) {
      let feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [data[i].location.x, data[i].location.y]
        },
        properties: {
          name: data[i].name || geoCodeParam.keyWords,
          address: data[i].formatedAddress || data[i].address
        },
        filterAttribute: {
          filterAttributeName: data[i].name || geoCodeParam.keyWords,
          filterAttributeValue: data[i].formatedAddress || data[i].address || '空'
        },
        filterVal: `${data[i].name || geoCodeParam.keyWords}：${data[i].formatedAddress || data[i].address || '空'}`
      };
      features.push(feature);
    }
    return features;
  }

  _getSearchUrl(geoCodeParam) {
    let url =
      this.options.cityGeoCodingConfig.addressUrl +
      `.json?keywords=${geoCodeParam.keyWords}&city=${geoCodeParam.city || '北京市'}&pageSize=${
        geoCodeParam.pageSize
      }&pageNum=${geoCodeParam.pageNum}&key=${this.options.cityGeoCodingConfig.key}`;
    return url;
  }

  _getFeaturesByKeyWord(keyWord, features) {
    let resultFeatures = [];
    let keyReg = new RegExp(keyWord.toLowerCase());
    let operatingAttributeNames = this._getAttributeNames(features);
    features.forEach(feature => {
      if (!feature.properties) {
        return null;
      }
      let fAttr = feature.properties;
      operatingAttributeNames.forEach(attributeName => {
        if (fAttr[attributeName] && keyReg.test(fAttr[attributeName].toString().toLowerCase())) {
          let filterAttributeName = attributeName;
          let filterAttributeValue = fAttr[attributeName] || '空';
          if (!feature.filterAttribute) {
            feature.filterAttribute = {
              filterAttributeName: filterAttributeName,
              filterAttributeValue: filterAttributeValue
            };
            feature.filterVal = `${filterAttributeName}：${filterAttributeValue}`;
            resultFeatures.push(feature);
          }
        }
      }, this);
    });
    return resultFeatures;
  }

  _getAttributeNames(features) {
    let attributeNames = [];
    let properties = features[0].properties;
    properties &&
      Object.keys(properties).forEach(field => {
        attributeNames.push(field);
      }, this);
    return attributeNames;
  }

  _clearMarkers() {
    if (this.markerList.length) {
      this.markerList.forEach(marker => {
        marker && marker.remove();
      });
      this.markerList = [];
    }
  }

  _clearPopups() {
    if (this.popupList.length) {
      this.popupList.forEach(popup => {
        popup && popup.remove();
      });
      this.popupList = [];
    }
  }

  _clearSearchResultLayer() {
    if (this.map && this.map.getLayer('searchResultLayer')) {
      this.map.removeLayer('searchResultLayer');
      this.map.removeSource('searchResultLayer');
    }
  }

  _resetSearchSourceData() {
    if (this.map && this.map.getSource('searchResultLayer')) {
      this.map.getSource('searchResultLayer').setData({
        type: 'FeatureCollection',
        features: []
      });
    }
  }

  _reset() {
    this._resetSearchSourceData();
    this._clearMarkers();
    this._clearPopups();
  }

  clear() {
    this.searchTaskId = 0;
    this.searchResult = {};
    this.errorSourceList = {};
    if (this.options.resultRender) {
      this._clearSearchResultLayer();
      this._clearMarkers();
      this._clearPopups();
    }
  }
}
