import type { GeoJSONSource, LngLatLike, Map, Marker, Popup } from 'mapbox-gl';
import mapboxgl from 'mapbox-gl';
import clonedeep from 'lodash.clonedeep';
import turfCenter from '@turf/center';
import { AddressMatchService } from '@supermapgis/iclient-mapboxgl';
import { FetchRequest } from '@supermapgis/iclient-common/util/FetchRequest';
import { GeoCodingParameter } from '@supermapgis/iclient-common/iServer/GeoCodingParameter';
import iServerRestService from 'vue-iclient-core/utils/iServerRestService';
import getFeatures from 'vue-iclient-core/utils/get-features';
import { getFeatureCenter } from 'vue-iclient-core/utils/util';

export interface SearchOptions {
  maxFeatures?: number | string;
  layerNames?: (string | LayerSearchInfo)[];
  restMap?: RestMapInfo[];
  restData?: RestDataInfo[];
  iportalData?: FetchDataBase[];
  addressMatch?: FetchDataBase[];
  onlineLocalSearch?: OnlineLocalSearch;
  alwaysCenter?: boolean;
  resultRender?: (feature: any) => void;
  /**
   * Search result event emit mode.
   * - 'each': Emit `searchsucceeded{taskId}` per datasource (legacy behavior).
   * - 'all': Emit `searchsucceeded{taskId}` once after all datasources finished.
   */
  emitMode?: 'each' | 'all';
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
  /**
   * Fields to match `keyWord` when searching this datasource.
   * If not provided, it will search across all properties.
   */
  searchFields?: string[];
  /**
   * Fields to display in dropdown results for this datasource.
   * If not provided, it will display values of all properties.
   */
  resultFields?: string[];
  [k: string]: any;
}

export interface LayerSearchInfo {
  layerName: string;
  name?: string;
  searchFields?: string[];
  resultFields?: string[];
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
  private activeSearchTaskId: number | null = null;
  private pendingSearchCount = 0;
  private hasSearchSuccess = false;
  private lastSearchError: { sourceName: string; error: string } | null = null;
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

  constructor(options?: SearchOptions) {
    super();
    this.options = options || {};
    this.options.cityGeoCodingConfig = {
      addressUrl: 'https://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos',
      key: this.options.onlineLocalSearch?.key
    };
  }

  setMap(mapInfo: { map: Map }) {
    const { map } = mapInfo;
    this.map = map;
  }

  private _getOnlineLocalSearchKey(onlineLocalSearch?: OnlineLocalSearch): string {
    const key = onlineLocalSearch?.key ?? this.options.onlineLocalSearch?.key ?? this.options.cityGeoCodingConfig?.key;
    return typeof key === 'string' ? key.trim() : '';
  }

  private _canUseOnlineLocalSearch(onlineLocalSearch?: OnlineLocalSearch): boolean {
    return !!onlineLocalSearch?.enable && !!this._getOnlineLocalSearchKey(onlineLocalSearch);
  }

  /**
   * @function SearchViewModel.prototype.search
   * @description 开始搜索。
   * @param {String} keyWord - 搜索关键字。
   */
  search(keyWord: string) {
    const emitMode = this.options.emitMode || 'each';
    if (emitMode === 'all') {
      return this._searchAll(keyWord);
    }

    this.searchCount = 0;
    this.searchResult = {};
    this.errorSourceList = {};
    this.keyWord = keyWord;
    const { maxFeatures } = this.options;
    this.maxFeatures = +maxFeatures >= 100 ? 100 : Math.ceil(+maxFeatures) || 8;
    this.searchType.forEach(item => {
      if (this.options[item]) {
        if (item === 'onlineLocalSearch' && this._canUseOnlineLocalSearch(this.options[item])) {
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
    this._canUseOnlineLocalSearch(onlineLocalSearch) && this._searchFromPOI(onlineLocalSearch);
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
    const taskId =
      this.options.emitMode === 'all' ? this.activeSearchTaskId ?? this.searchTaskId : this.searchTaskId;
    this.fire('search-selected-info' + taskId, { data });
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
      const taskId =
        this.options.emitMode === 'all' ? this.activeSearchTaskId ?? this.searchTaskId : this.searchTaskId;
      this.fire('addfeaturefailed' + taskId, { code_name: 'ILLEGAL_FEATURE' });
      return;
    }
    if (this.keyWord.indexOf('：') < 0) {
      pointData.info.push({ useDefaultAttribute: true, attributeValue: propertiesValue });
    } else {
      for (let key in properties) {
        properties[key] && pointData.info.push({ attribute: key, attributeValue: properties[key] });
      }
    }
    const taskId =
      this.options.emitMode === 'all' ? this.activeSearchTaskId ?? this.searchTaskId : this.searchTaskId;
    this.fire('set-popup-content' + taskId, { popupData: pointData });
  }

  private _searchAll(keyWord: string) {
    // Reserve a stable task id for this search, and keep `searchTaskId` for the next search.
    const taskId = this.searchTaskId;
    this.activeSearchTaskId = taskId;
    this.searchTaskId += 1;

    this.pendingSearchCount = 0;
    this.hasSearchSuccess = false;
    this.lastSearchError = null;
    this.searchResult = {};
    this.errorSourceList = {};
    this.keyWord = keyWord;

    const { maxFeatures } = this.options;
    this.maxFeatures = +maxFeatures >= 100 ? 100 : Math.ceil(+maxFeatures) || 8;

    const { layerNames, onlineLocalSearch, restMap, restData, iportalData, addressMatch } = {
      ...this.options
    };

    // Calculate pending task count for final emit.
    if (layerNames && layerNames.length > 0) this.pendingSearchCount += layerNames.length;
    if (this._canUseOnlineLocalSearch(onlineLocalSearch)) this.pendingSearchCount += 1;
    if (restMap && restMap.length > 0) this.pendingSearchCount += restMap.length;
    if (restData && restData.length > 0) {
      restData.forEach(item => {
        const datasetCount = Array.isArray(item.dataName) ? item.dataName.length : 0;
        this.pendingSearchCount += Math.max(datasetCount, 0);
      });
    }
    if (iportalData && iportalData.length > 0) this.pendingSearchCount += iportalData.length;
    if (addressMatch && addressMatch.length > 0) this.pendingSearchCount += addressMatch.length;

    if (this.pendingSearchCount <= 0) {
      setTimeout(() => {
        if (this.activeSearchTaskId !== taskId) return;
        this.fire('searchfailed' + taskId, { error: 'No search source', sourceName: '' });
      }, 0);
      return taskId;
    }

    layerNames && layerNames.length > 0 && this._searchFromLayerAll(taskId, layerNames);
    this._canUseOnlineLocalSearch(onlineLocalSearch) && this._searchFromPOIAll(taskId, onlineLocalSearch);
    restMap && restMap.length > 0 && this._searchFromRestMapAll(taskId, restMap);
    restData && restData.length > 0 && this._searchFromRestDataAll(taskId, restData);
    iportalData && iportalData.length > 0 && this._searchFromIportalAll(taskId, iportalData);
    addressMatch && addressMatch.length > 0 && this._searchFromAddressMatchAll(taskId, addressMatch);

    return taskId;
  }

  private _searchTaskSucceedAll(taskId: number, resultFeature: FeatureResult[], sourceName: string) {
    if (this.activeSearchTaskId !== taskId) return;
    this.hasSearchSuccess = true;
    if (resultFeature && resultFeature.length > 0) {
      const existing = this.searchResult[sourceName]?.result || [];
      const next = existing.concat(resultFeature).slice(0, this.maxFeatures);
      this.searchResult[sourceName] = { source: sourceName, result: next };
    }
    this._finishOneSearchTaskAll(taskId);
  }

  private _searchTaskFailedAll(taskId: number, error: string, sourceName: string) {
    if (this.activeSearchTaskId !== taskId) return;
    this.lastSearchError = { sourceName, error };
    this._finishOneSearchTaskAll(taskId);
  }

  private _finishOneSearchTaskAll(taskId: number) {
    if (this.activeSearchTaskId !== taskId) return;
    this.pendingSearchCount = Math.max(this.pendingSearchCount - 1, 0);
    if (this.pendingSearchCount !== 0) return;

    const resultList: SearchResultItem[] = [];
    for (let key in this.searchResult) {
      resultList.push(this.searchResult[key]);
    }

    if (this.hasSearchSuccess) {
      this.fire('searchsucceeded' + taskId, { result: resultList });
      return;
    }

    this.fire('searchfailed' + taskId, {
      error: this.lastSearchError?.error || '',
      sourceName: this.lastSearchError?.sourceName || ''
    });
  }

  private _searchFromLayerAll(taskId: number, layerNames: (string | LayerSearchInfo)[]) {
    setTimeout(() => {
      layerNames.forEach(layer => {
        const sourceName = typeof layer === 'string' ? layer : layer.layerName;
        const searchFields = typeof layer === 'string' ? undefined : layer.searchFields;
        const resultFields = typeof layer === 'string' ? undefined : layer.resultFields;
        const source = this.map.getSource(sourceName);
        if (source) {
          // @ts-ignore
          const features = clonedeep(source._data ? source._data.features : []);
          const resultFeature = this._getFeaturesByKeyWord(
            this.keyWord,
            features,
            searchFields,
            resultFields
          );
          const results = resultFeature.slice(0, this.maxFeatures);
          this._searchTaskSucceedAll(taskId, results, sourceName);
        } else {
          this._searchTaskFailedAll(taskId, `The ${sourceName} does not exist`, sourceName);
        }
      }, this);
    }, 0);
  }

  private _searchFromPOIAll(taskId: number, onlineLocalSearch: OnlineLocalSearch) {
    const sourceName = 'SuperMap Online 本地搜索';
    this.geoCodeParam = {
      pageSize: this.options.pageSize || 10,
      pageNum: this.options.pageNum || 1,
      city: onlineLocalSearch.city
    };
    this.geoCodeParam.keyWords = this.keyWord;
    const url = this._getSearchUrl(this.geoCodeParam, onlineLocalSearch);
    FetchRequest.get(url)
      .then(response => response.json())
      .then(geocodingResult => {
        if (this.activeSearchTaskId !== taskId) return;
        if (geocodingResult.error) {
          this._searchTaskFailedAll(taskId, geocodingResult.error, sourceName);
          return;
        }
        if (!geocodingResult.poiInfos) {
          this._searchTaskSucceedAll(taskId, [], sourceName);
          return;
        }
        if (geocodingResult.poiInfos.length === 0) {
          this._searchTaskSucceedAll(taskId, [], sourceName);
          return;
        }
        const geoJsonResult = this._dataToGeoJson(geocodingResult.poiInfos, this.geoCodeParam);
        this._searchTaskSucceedAll(taskId, geoJsonResult.slice(0, this.maxFeatures), sourceName);
      })
      .catch(error => {
        this._searchTaskFailedAll(taskId, error, sourceName);
      });
  }

  private _searchFromRestMapAll(taskId: number, restMaps: RestMapInfo[]) {
    const defaultSourceName = 'Rest Map Search';
    restMaps.forEach(restMap => {
      const sourceName = restMap.name || defaultSourceName;
      let finished = false;
      const finishSucceed = (features: FeatureResult[]) => {
        if (finished) return;
        finished = true;
        this._searchTaskSucceedAll(taskId, features, sourceName);
      };
      const finishFailed = (error: string) => {
        if (finished) return;
        finished = true;
        this._searchTaskFailedAll(taskId, error, sourceName);
      };

      const options: FetchRequestOptions = {};
      if (restMap.proxy) {
        options.proxy = restMap.proxy;
      }
      restMap.epsgCode && (options.epsgCode = restMap.epsgCode);
      const iserverService = new iServerRestService(restMap.url, options);
      iserverService.on({
        getdatafailed: () => {
          finishFailed('');
        },
        featureisempty: () => {
          finishSucceed([]);
        },
        getdatasucceeded: e => {
          if (!e.features) {
            finishSucceed([]);
            return;
          }
          const resultFeatures = this._getFeaturesByKeyWord(
            this.keyWord,
            e.features,
            restMap.searchFields,
            restMap.resultFields
          ).slice(0, this.maxFeatures);
          finishSucceed(resultFeatures);
        }
      });
      iserverService.getMapFeatures(
        { dataUrl: restMap.url, mapName: restMap.layerName },
        { maxFeatures: this.maxFeatures, keyWord: this.keyWord }
      );
    }, this);
  }

  private _searchFromRestDataAll(taskId: number, restDatas: RestDataInfo[]) {
    const defaultSourceName = 'Rest Data Search';
    restDatas.forEach(restData => {
      const sourceName = restData.name || defaultSourceName;
      const dataNames = Array.isArray(restData.dataName) ? restData.dataName : [];
      dataNames.forEach(fullName => {
        let finished = false;
        const finishSucceed = (features: FeatureResult[]) => {
          if (finished) return;
          finished = true;
          this._searchTaskSucceedAll(taskId, features, sourceName);
        };
        const finishFailed = (error: string) => {
          if (finished) return;
          finished = true;
          this._searchTaskFailedAll(taskId, error, sourceName);
        };

        const options: FetchRequestOptions = {};
        if (restData.proxy) {
          options.proxy = restData.proxy;
        }
        restData.epsgCode && (options.epsgCode = restData.epsgCode);
        const iserverService = new iServerRestService(restData.url, options);
        iserverService.on({
          getdatafailed: () => {
            finishFailed('');
          },
          featureisempty: () => {
            finishSucceed([]);
          },
          getdatasucceeded: e => {
            if (!e.features) {
              finishSucceed([]);
              return;
            }
            const resultFeatures = this._getFeaturesByKeyWord(
              this.keyWord,
              e.features,
              restData.searchFields,
              restData.resultFields
            ).slice(0, this.maxFeatures);
            finishSucceed(resultFeatures);
          }
        });
        const [dataSourceName, datasetName] = fullName.split(':');
        if (!dataSourceName || !datasetName) {
          finishFailed(`Invalid dataName: ${fullName}`);
          return;
        }
        iserverService.getDataFeatures(
          { datasetName, dataSourceName, dataUrl: restData.url },
          { maxFeatures: this.maxFeatures, keyWord: this.keyWord }
        );
      });
    }, this);
  }

  private _searchFromIportalAll(taskId: number, iportalDatas: FetchDataBase[]) {
    const defaultSourceName = 'Iportal Search';
    iportalDatas.forEach(iportal => {
      const sourceName = iportal.name || defaultSourceName;
      getFeatures({ ...iportal })
        .then(data => {
          if (this.activeSearchTaskId !== taskId) return;
          const features = data?.features || [];
          const resultFeatures = this._getFeaturesByKeyWord(
            this.keyWord,
            features,
            iportal.searchFields,
            iportal.resultFields
          ).slice(0, this.maxFeatures);
          this._searchTaskSucceedAll(taskId, resultFeatures, sourceName);
        })
        .catch(error => {
          this._searchTaskFailedAll(taskId, error, sourceName);
        });
    }, this);
  }

  private _searchFromAddressMatchAll(taskId: number, addressMatches: FetchDataBase[]) {
    const defaultSourceName = 'Address Match Search';
    addressMatches.forEach(addressMatch => {
      const sourceName = addressMatch.name || defaultSourceName;
      const options: FetchRequestOptions = {};
      if (addressMatch.proxy) {
        options.proxy = addressMatch.proxy;
      }
      this.addressMatchService = new AddressMatchService(addressMatch.url, options);
      const parm = {
        address: this.keyWord,
        fromIndex: 0,
        toIndex: this.maxFeatures,
        maxReturn: this.maxFeatures,
        prjCoordSys: '{epsgcode:4326}'
      };
      const geoCodeParam = new GeoCodingParameter(parm);
      this.addressMatchService.code(geoCodeParam, e => {
        if (this.activeSearchTaskId !== taskId) return;
        if (e && e.result) {
          this._searchTaskSucceedAll(taskId, e.result.slice(0, this.maxFeatures), sourceName);
        } else {
          this._searchTaskFailedAll(taskId, '', sourceName);
        }
      });
    }, this);
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
    popup.setLngLat(coordinates as LngLatLike).setDOMContent(popupContainer).addTo(this.map);
    popup.on('open', () => {
      callback && callback();
    });
    marker.setLngLat(coordinates as LngLatLike).setPopup(popup).addTo(this.map);
    this.map.flyTo({ center: coordinates as [number, number] });
  }

  _searchFromLayer(layerNames: (string | LayerSearchInfo)[]) {
    setTimeout(() => {
      layerNames.forEach(layer => {
        const sourceName = typeof layer === 'string' ? layer : layer.layerName;
        const searchFields = typeof layer === 'string' ? undefined : layer.searchFields;
        const resultFields = typeof layer === 'string' ? undefined : layer.resultFields;
        let source = this.map.getSource(sourceName);
        if (source) {
          // @ts-ignore
          let features = clonedeep(source._data ? source._data.features : []);
          let resultFeature = this._getFeaturesByKeyWord(
            this.keyWord,
            features,
            searchFields,
            resultFields
          );
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
    const sourceName = 'SuperMap Online 本地搜索';
    this.geoCodeParam = {
      pageSize: this.options.pageSize || 10,
      pageNum: this.options.pageNum || 1,
      city: onlineLocalSearch.city
    };
    this.geoCodeParam.keyWords = this.keyWord;
    let url = this._getSearchUrl(this.geoCodeParam, onlineLocalSearch);
    FetchRequest.get(url)
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
            let resultFeatures = this._getFeaturesByKeyWord(
              this.keyWord,
              e.features,
              restMap.searchFields,
              restMap.resultFields
            );
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
            let resultFeatures = this._getFeaturesByKeyWord(
              this.keyWord,
              e.features,
              restData.searchFields,
              restData.resultFields
            );
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
            let resultFeatures = this._getFeaturesByKeyWord(
              this.keyWord,
              data.features,
              iportal.searchFields,
              iportal.resultFields
            );
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
      this.addressMatchService = new AddressMatchService(addressMatch.url, options);
      let parm = {
        address: this.keyWord,
        fromIndex: 0,
        toIndex: this.maxFeatures,
        maxReturn: this.maxFeatures,
        prjCoordSys: '{epsgcode:4326}'
      };
      let geoCodeParam = new GeoCodingParameter(parm);
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

  _getSearchUrl(geoCodeParam: GeoCodeParam, onlineLocalSearch?: OnlineLocalSearch) {
    const onlineSearchKey = this._getOnlineLocalSearchKey(onlineLocalSearch);
    let url =
      this.options.cityGeoCodingConfig.addressUrl +
      `.json?keywords=${geoCodeParam.keyWords}&city=${geoCodeParam.city || '北京市'}&pageSize=${
        geoCodeParam.pageSize
      }&pageNum=${geoCodeParam.pageNum}&key=${onlineSearchKey}`;
    return url;
  }

  private _formatResultValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value);
    try {
      return JSON.stringify(value);
    } catch (e) {
      return String(value);
    }
  }

  private _getResultDisplayInfo(
    properties: Record<string, any>,
    fallbackFields: string[],
    resultFields?: string[]
  ): { text: string; primaryValue: string } {
    const fields = resultFields?.length ? resultFields : fallbackFields?.length ? fallbackFields : Object.keys(properties);
    const values: string[] = [];
    for (const field of fields) {
      if (!field) continue;
      if (!(field in properties)) continue;
      const valueText = this._formatResultValue(properties[field]).trim();
      if (valueText === '') continue;
      values.push(valueText);
    }
    const text = values.join('，');
    return { text, primaryValue: values[0] || '' };
  }

  _getFeaturesByKeyWord(
    keyWord: string,
    features: FeatureResult[],
    searchFields?: string[],
    resultFields?: string[]
  ) {
    const resultFeatures: FeatureResult[] = [];
    const keyReg = new RegExp(keyWord.toLowerCase());

    const defaultFields = this._getAttributeNames(features);
    const operatingAttributeNames = searchFields?.length ? searchFields : defaultFields;

    features.forEach(feature => {
      if (!feature.properties) return;
      const props = feature.properties as Record<string, any>;

      let matchedField: string | null = null;
      let matchedValue: any = null;
      const fieldsToSearch = operatingAttributeNames?.length ? operatingAttributeNames : Object.keys(props);
      for (const field of fieldsToSearch) {
        const value = props?.[field];
        if (value === null || value === undefined || value === '') continue;
        if (keyReg.test(value.toString().toLowerCase())) {
          matchedField = field;
          matchedValue = value;
          break;
        }
      }

      if (!matchedField) return;

      const { text, primaryValue } = this._getResultDisplayInfo(props, defaultFields, resultFields);
      const fallbackDisplay = this._formatResultValue(matchedValue).trim();

      feature.filterAttribute = {
        filterAttributeName: matchedField,
        filterAttributeValue: primaryValue || fallbackDisplay || 'NUll'
      };
      feature.filterVal = text || fallbackDisplay;

      resultFeatures.push(feature);
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
    if (this.options.emitMode === 'all') {
      this.activeSearchTaskId = null;
    } else {
      this.searchTaskId = 0;
    }
    this.searchResult = {};
    this.errorSourceList = {};
    if (!this.options.resultRender) {
      this._clearSearchResultLayer();
      this._clearMarkers();
      this._clearPopups();
    }
  }
}
