import type { GeoJSONSource, LngLatLike, Map, Marker, Popup } from 'mapbox-gl';
import mapboxgl from 'vue-iclient-static/libs/mapboxgl/mapbox-gl-enhance';
import clonedeep from 'lodash.clonedeep';
import turfCenter from '@turf/center';
import 'vue-iclient-static/libs/iclient-mapboxgl/iclient-mapboxgl.min';
import iServerRestService from 'vue-iclient-core/utils/iServerRestService';
import getFeatures from 'vue-iclient-core/utils/get-features';
import { getFeatureCenter } from 'vue-iclient-core/utils/util';

export interface SearchOptions {
  maxFeatures?: number | string;
  layerNames?: string[];
  restMap?: RestMapInfo[];
  restData?: RestDataInfo[];
  iportalData?: FetchDataBase[];
  addressMatch?: FetchDataBase[];
  onlineLocalSearch?: OnlineLocalSearch;
  alwaysCenter?: boolean;
  resultRender?: (feature: any) => void;
  cityGeoCodingConfig?: {
    addressUrl?: string;
    key?: string;
  };
  pageSize?: number;
  pageNum?: number;
}

export interface OnlineLocalSearch {
  enable?: boolean
  city?: string
  key?: string
} 

export interface FeatureResult extends GeoJSON.Feature<GeoJSON.Geometry> {
  location: {
    x: number;
    y: number;
  };
  formatedAddress?: string;
  address?: string;
  name?: string;
  filterAttribute?: {
    filterAttributeName: string;
    filterAttributeValue: any;
  };
  filterVal?: string;
}

export interface SearchResultItem { 
  source: string; 
  result: FeatureResult[] 
}

export interface FetchRequestOptions { 
  proxy?: string; 
  epsgCode?: string;
}

export interface FetchDataBase extends FetchRequestOptions {
  url: string;
  name?: string;
  [k: string]: any;
}

export interface RestMapInfo extends FetchDataBase {
  layerName: string;
}

export interface RestDataInfo extends FetchDataBase {
  dataName: string[];
}

interface GeoCodeParam {
  pageSize: number;
  pageNum: number;
  city: string;
  keyWords?: string;
}

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
  options: SearchOptions;
  searchTaskId = 0;
  searchType = ['layerNames', 'onlineLocalSearch', 'restMap', 'restData', 'iportalData', 'addressMatch'];
  markerList: Marker[] = [];
  popupList: Popup[] = [];
  errorSourceList: Record<string, string> = {}
  map: Map;
  maxFeatures: number;
  keyWord: string;
  searchCount: number;
  searchResult: Record<string, SearchResultItem>;
  addressMatchService: { code: (data: Record<string, any>, callback: (data: Record<string, any>) => void) => void };
  geoCodeParam: GeoCodeParam;

  fire: (name: string, data?: any) => void;
  on: (name: string, data: (...rest: any) => void) => void;
  off: (name: string, data?: (...rest: any) => void) => void;

  constructor(options?: SearchOptions) {
    super();
    this.options = options || {};
    this.options.cityGeoCodingConfig = {
      addressUrl: 'https://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos',
      key: options.onlineLocalSearch.key || 'fvV2osxwuZWlY0wJb8FEb2i5'
    };
  }

  setMap(mapInfo: { map: Map }) {
    const { map } = mapInfo;
    this.map = map;
  }

  /**
   * @function SearchViewModel.prototype.search
   * @description 开始搜索。
   * @param {String} keyWord - 搜索关键字。
   */
  search(keyWord: string) {
    this.searchCount = 0;
    this.searchResult = {};
    this.errorSourceList = {};
    this.keyWord = keyWord;
    const { maxFeatures } = this.options;
    this.maxFeatures = +maxFeatures >= 100 ? 100 : Math.ceil(+maxFeatures) || 8;
    this.searchType.forEach(item => {
      if (this.options[item]) {
        if (item === 'onlineLocalSearch' && this.options[item].enable) {
          this.searchCount += 1;
        } else if (item !== 'onlineLocalSearch') {
          let len = this.options[item].length;
          this.searchCount += len;
        }
      }
    }, this);
    let { layerNames, onlineLocalSearch, restMap, restData, iportalData, addressMatch } = {
      ...this.options
    };
    layerNames && this._searchFromLayer(layerNames);
    onlineLocalSearch.enable && this._searchFromPOI(onlineLocalSearch);
    restMap && this._searchFromRestMap(restMap);
    restData && this._searchFromRestData(restData);
    iportalData && this._searchFromIportal(iportalData);
    addressMatch && this._searchFromAddressMatch(addressMatch);
    return this.searchTaskId;
  }

  /**
   * @function SearchViewModel.prototype.getFeatureInfo
   * @description 获取搜索结果的要素信息。
   * @param {String} searchKey - 搜索关键字。
   * @param {String} data - 过滤数据。
   */
  getFeatureInfo(searchKey: string, data: FeatureResult) {
    const { resultRender } = this.options;
    this.keyWord = searchKey;
    this._reset();
    this.fire('search-selected-info' + this.searchTaskId, { data });
    if (resultRender) {
      return;
    }
    this._showResultToMap(data);
  }

  _showResultToMap(feature: FeatureResult) {
    const geometry = (feature as GeoJSON.Feature).geometry || { type : null};
    if (!this.options.alwaysCenter && (geometry.type === 'MultiPolygon' || geometry.type === 'Polygon')) {
      this._addPolygon(feature as GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon>);
    } else if (!this.options.alwaysCenter && geometry.type === 'LineString') {
      this._addLine();
    } else {
      this._addPoint(feature);
    }
  }

  _addPoint(feature: FeatureResult) {
    const properties = feature.properties || feature;
    const geometry = feature.geometry || [feature.location.x, feature.location.y];
    let pointData = { coordinates: null, info: [] };
    const propertiesValue = properties.address || feature.filterAttribute.filterAttributeValue || properties.name;
    const geoType = (geometry as GeoJSON.Geometry).type;
    if (geoType === 'MultiPolygon' || geoType === 'Polygon' || geoType === 'LineString') {
      pointData.coordinates = getFeatureCenter(feature);
    } else {
      pointData.coordinates = (geometry as GeoJSON.Point).coordinates || geometry;
    }
    if (!pointData.coordinates || !pointData.coordinates.length || pointData.coordinates.find(item => isNaN(+item))) {
      this.fire('addfeaturefailed' + this.searchTaskId, { code_name: 'ILLEGAL_FEATURE' });
      return;
    }
    if (this.keyWord.indexOf('：') < 0) {
      pointData.info.push({ useDefaultAttribute: true, attributeValue: propertiesValue });
    } else {
      for (let key in properties) {
        properties[key] && pointData.info.push({ attribute: key, attributeValue: properties[key] });
      }
    }
    this.fire('set-popup-content' + this.searchTaskId, { popupData: pointData });
  }

  _addLine() {
    console.log('draw line here');
  }

  _addPolygon(feature: GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon>) {
    if (feature && this.map) {
      let center = turfCenter(feature).geometry.coordinates;
      const source = this.map.getSource('searchResultLayer') as GeoJSONSource;
      const sourceData = feature;
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
        center: center as LngLatLike
      });
    }
  }

  /**
   * @function SearchViewModel.prototype.addMarker
   * @description 向地图上添加 Marker。
   * @param {Array} coordinates - 坐标数组。
   * @param {HTMLElement} popupContainer - 弹窗 DOM 对象。
   * @param {Function} callback - 弹窗生成后的回调事件。
   */
  setPopupContent(coordinates: number[], popupContainer: HTMLElement, callback?: () => void) {
    popupContainer.style.display = 'block';
    const popup = new mapboxgl.Popup({
      className: 'sm-mapboxgl-tabel-popup sm-component-search-result-popup',
      closeOnClick: true,
      closeButton: false,
      maxWidth: 'none',
      anchor: 'bottom'
    });
    const marker = new mapboxgl.Marker();
    this.popupList.push(popup);
    this.markerList.push(marker);
    popup.setLngLat(coordinates).setDOMContent(popupContainer).addTo(this.map);
    popup.on('open', () => {
      callback && callback();
    });
    marker.setLngLat(coordinates).setPopup(popup).addTo(this.map);
    this.map.flyTo({ center: coordinates as [number, number] });
  }

  _searchFromLayer(layerNames) {
    setTimeout(() => {
      layerNames.forEach(sourceName => {
        let source = this.map.getSource(sourceName);
        if (source) {
          // @ts-ignore
          let features = clonedeep(source._data ? source._data.features : []);
          let resultFeature = this._getFeaturesByKeyWord(this.keyWord, features);
          const results = resultFeature.slice(0, this.maxFeatures);
          this._searchFeaturesSucceed(results, sourceName);
        } else {
          this._searchFeaturesFailed(`The ${sourceName} does not exist`, sourceName);
        }
      }, this);
    }, 0);
  }

  _searchFeaturesFailed(error: string, sourceName: string) {
    error && console.log(error);
    if (this.errorSourceList[sourceName]) return;
    this.searchCount--;
    this.errorSourceList[sourceName] = sourceName;
    /**
     * @event SearchViewModel#searchfailed
     * @description 搜索失败后触发。
     * @property {Object} e  - 事件对象。
     */
    if (this.searchCount === 0) {
      this.fire('searchfailed' + this.searchTaskId, { error, sourceName });
      this.searchTaskId += 1;
    }
  }

  _searchFeaturesSucceed(resultFeature: FeatureResult[], sourceName: string) {
    if (this.errorSourceList[sourceName]) {
      delete this.errorSourceList[sourceName];
    }
    if (resultFeature.length > 0) {
      let result: SearchResultItem = { source: sourceName, result: resultFeature };
      this.searchResult[sourceName] = result;
    }
    let resultList = [];
    for (let key in this.searchResult) {
      resultList.push(this.searchResult[key]);
    }
    /**
     * @event SearchViewModel#searchsucceeded
     * @description 搜索成功后触发。
     * @property {Object} e  - 事件对象。
     */
    this.fire('searchsucceeded' + this.searchTaskId, { result: resultList })
    this.searchTaskId += 1;
  }

  _searchFromPOI(onlineLocalSearch: OnlineLocalSearch) {
    const sourceName = 'Online 本地搜索';
    this.geoCodeParam = {
      pageSize: this.options.pageSize || 10,
      pageNum: this.options.pageNum || 1,
      city: onlineLocalSearch.city
    };
    this.geoCodeParam.keyWords = this.keyWord;
    let url = this._getSearchUrl(this.geoCodeParam);
    mapboxgl.supermap.FetchRequest.get(url)
      .then(response => {
        return response.json();
      })
      .then(geocodingResult => {
        if (geocodingResult.error) {
          this._searchFeaturesFailed(geocodingResult.error, sourceName);
          return;
        }
        if (geocodingResult.poiInfos && geocodingResult.poiInfos.length === 0) {
          this._searchFeaturesSucceed([], sourceName);
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

  _searchFromRestMap(restMaps: RestMapInfo[]) {
    const sourceName = 'Rest Map Search';
    restMaps.forEach(restMap => {
      const options: FetchRequestOptions = {};
      if (restMap.proxy) {
        options.proxy = restMap.proxy;
      }
      restMap.epsgCode && (options.epsgCode = restMap.epsgCode);
      let iserverService = new iServerRestService(restMap.url, options);
      iserverService.on({
        getdatafailed: () => {
          this._searchFeaturesFailed('', restMap.name || sourceName);
        },
        featureisempty: () => {
          this._searchFeaturesSucceed([], restMap.name || sourceName);
        },
        getdatasucceeded: e => {
          if (e.features) {
            let resultFeatures = this._getFeaturesByKeyWord(this.keyWord, e.features);
            this._searchFeaturesSucceed(resultFeatures, restMap.name || sourceName);
          }
        }
      });
      iserverService.getMapFeatures(
        { dataUrl: restMap.url, mapName: restMap.layerName },
        { maxFeatures: this.maxFeatures, keyWord: this.keyWord }
      );
    }, this);
  }

  _searchFromRestData(restDatas: RestDataInfo[]) {
    const sourceName = 'Rest Data Search';
    restDatas.forEach(restData => {
      const options: FetchRequestOptions = {};
      if (restData.proxy) {
        options.proxy = restData.proxy;
      }
      restData.epsgCode && (options.epsgCode = restData.epsgCode);
      let iserverService = new iServerRestService(restData.url, options);
      iserverService.on({
        getdatafailed: () => {
          this._searchFeaturesFailed('', restData.name || sourceName);
        },
        featureisempty: () => {
          this._searchFeaturesSucceed([], restData.name || sourceName);
        },
        getdatasucceeded: e => {
          if (e.features && e.features.length > 0) {
            let resultFeatures = this._getFeaturesByKeyWord(this.keyWord, e.features);
            this._searchFeaturesSucceed(resultFeatures, restData.name || sourceName);
          }
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

  _searchFromIportal(iportalDatas: FetchDataBase[]) {
    const sourceName = 'Iportal Search';
    iportalDatas.forEach(iportal => {
      getFeatures({ ...iportal })
        .then(data => {
          if (data.features) {
            let resultFeatures = this._getFeaturesByKeyWord(this.keyWord, data.features);
            this._searchFeaturesSucceed(resultFeatures, iportal.name || sourceName);
          }
        })
        .catch(() => {
          this._searchFeaturesFailed('', iportal.name || sourceName);
        });
    }, this);
  }

  _searchFromAddressMatch(addressMatches: FetchDataBase[]) {
    const sourceName = 'Address Match Search';
    addressMatches.forEach(addressMatch => {
      const options: FetchRequestOptions = {};
      if (addressMatch.proxy) {
        options.proxy = addressMatch.proxy;
      }
      this.addressMatchService = new mapboxgl.supermap.AddressMatchService(addressMatch.url, options);
      let parm = {
        address: this.keyWord,
        fromIndex: 0,
        toIndex: this.maxFeatures,
        maxReturn: this.maxFeatures,
        prjCoordSys: '{epsgcode:4326}'
      };
      let geoCodeParam = new mapboxgl.supermap.GeoCodingParameter(parm);
      this.addressMatchService.code(geoCodeParam, e => {
        if (e.result) {
          this._searchFeaturesSucceed(e.result, addressMatch.name || sourceName);
        } else {
          this._searchFeaturesFailed('', addressMatch.name || sourceName);
        }
      });
    }, this);
  }

  _dataToGeoJson(data: FeatureResult[], geoCodeParam: GeoCodeParam) {
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
          filterAttributeValue: data[i].formatedAddress || data[i].address || 'NUll'
        },
        filterVal: `${data[i].name || geoCodeParam.keyWords}：${
          data[i].formatedAddress || data[i].address || 'NUll'
        }`
      };
      features.push(feature);
    }
    return features;
  }

  _getSearchUrl(geoCodeParam: GeoCodeParam) {
    let url =
      this.options.cityGeoCodingConfig.addressUrl +
      `.json?keywords=${geoCodeParam.keyWords}&city=${geoCodeParam.city || '北京市'}&pageSize=${
        geoCodeParam.pageSize
      }&pageNum=${geoCodeParam.pageNum}&key=${this.options.cityGeoCodingConfig.key}`;
    return url;
  }

  _getFeaturesByKeyWord(keyWord: string, features: FeatureResult[]) {
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
          let filterAttributeValue = fAttr[attributeName] || 'NUll';
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

  _getAttributeNames(features: FeatureResult[]) {
    let attributeNames = [];
    let properties = features[0]?.properties;
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
      (this.map.getSource('searchResultLayer') as GeoJSONSource).setData({
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

  removed() {
    this.searchTaskId = 0;
    this.searchResult = {};
    this.errorSourceList = {};
    if (!this.options.resultRender) {
      this._clearSearchResultLayer();
      this._clearMarkers();
      this._clearPopups();
    }
  }
}
