import WidgetViewModel from './WidgetViewModel';
import clonedeep from 'lodash.clonedeep';
import center from '@turf/center';
import mapboxgl from '../../static/libs/mapboxgl/mapbox-gl-enhance';
import '../../static/libs/iclient-mapboxgl/iclient9-mapboxgl.min';
import iPortalDataService from '../utils/iPortalDataService';
import iServerRestService from '../utils/iServerRestService';
/**
 * @class SearchViewModel
 * @description search viewModel.
 * @param {Object} map - map 对象。
 * @param {Object} options
 * @extends WidgetViewModel
 */
export default class SearchViewModel extends WidgetViewModel {
  constructor(map, options) {
    super();
    this.options = options || {};
    this.searchTaskId = 0;
    this.options.cityGeoCodingConfig = {
      addressUrl: 'http://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos',
      key: 'fvV2osxwuZWlY0wJb8FEb2i5'
    };
    if (map) {
      this.map = map;
    } else {
      return new Error(`Cannot find map`);
    }
    this.searchtType = ['layerNames', 'onlineLocalSearch', 'restMap', 'restData', 'iportalData', 'addressMatch'];
  }

  search(keyWord) {
    this.searchCount = 0;
    this.searchResult = [];
    this.keyWord = keyWord;
    this.maxFeatures = parseInt(this.options.maxFeatures) >= 100 ? 100 : parseInt(this.options.maxFeatures) || 8;
    this.searchtType.forEach(item => {
      if (this.options[item]) {
        if (item === 'onlineLocalSearch' && this.options[item].enable) {
          this.searchCount += 1;
        } else if (item !== 'onlineLocalSearch') {
          let len = this.options[item].length;
          this.searchCount += len;
        }
      }
    }, this);
    let { layerNames, onlineLocalSearch, restMap, restData, iportalData, addressMatch } = { ...this.options };
    layerNames && this._searchFromLayer(layerNames);
    onlineLocalSearch.enable && this._searchFromPOI(onlineLocalSearch);
    restMap && this._searchFromRestMap(restMap);
    restData && this._searchFromRestData(restData);
    iportalData && this._searchFromIportal(iportalData);
    addressMatch && this._searchFromAddressMatch(addressMatch);
    return this.searchTaskId;
  }

  getFeatureInfo(searchResult, filter, sourceName) {
    let filterValue = filter.indexOf('：') > 0 ? filter.split('：')[1].trim() : filter;
    filterValue = filterValue === 'null' ? filter.split('：')[0].trim() : filterValue;
    let data = { info: [] };
    searchResult.forEach(result => {
      if (sourceName === result.source) {
        result.result.forEach(feature => {
          let geometry, coordinates;
          let properties = feature.properties || feature;
          let propertiesValue = properties.address || feature.filterAttribute.filterAttributeValue || properties.name;
          if (propertiesValue.trim() === filterValue) {
            geometry = feature.geometry || [feature.location.x, feature.location.y];
            if (geometry.type === 'MultiPolygon' || geometry.type === 'Polygon' || geometry.type === 'LineString') {
              coordinates = center(feature).geometry.coordinates;
            } else {
              coordinates = geometry.coordinates || geometry;
            }
            data.coordinates = coordinates;
            if (filter.indexOf('：') < 0) {
              data.info.push({ attribute: '地址', attributeValue: propertiesValue });
            } else {
              for (let key in feature.properties) {
                feature.properties[key] && data.info.push({ attribute: key, attributeValue: feature.properties[key] });
              }
            }
          }
        });
      }
    }, this);
    return data;
  }

  addMarker(coordinates, popupContainer) {
    let popup = new mapboxgl.Popup({
      className: 'attributePopup',
      closeOnClick: false
    })
      .setLngLat(coordinates)
      .setHTML(popupContainer.innerHTML)
      .addTo(this.map);
    let marker = new mapboxgl.Marker()
      .setLngLat(coordinates)
      .setPopup(popup)
      .addTo(this.map);
    this.map.flyTo({ center: coordinates });
    return marker;
  }

  _searchFromLayer(layerNames) {
    setTimeout(() => {
      layerNames.forEach(sourceName => {
        let source = this.map.getSource(sourceName);
        if (source) {
          let features = clonedeep(source._data.features);
          let resultFeature = this._getFeaturesByKeyWord(this.keyWord, features);
          this._searchFeaturesSucceed(resultFeature.slice(0, this.maxFeatures), sourceName);
        } else {
          this._searchFeaturesFailed(`The ${sourceName} does not exist`);
        }
      }, this);
    }, 0);
  }
  _searchFeaturesFailed(error) {
    this.searchCount--;
    this.fire('searchfailed' + this.searchTaskId, { error });
    console.log(error);
  }
  _searchFeaturesSucceed(resultFeature, sourceName) {
    resultFeature.length > 0 && this.searchResult.push({ source: sourceName, result: resultFeature });
    this.searchCount--;
    this.searchCount === 0 &&
      this.fire('searchsucceeded' + this.searchTaskId, { result: this.searchResult }) &&
      (this.searchTaskId += 1);
  }

  _searchFromPOI(onlineLocalSearch) {
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
        if (geocodingResult.error || geocodingResult.poiInfos.length === 0) {
          this._searchFeaturesFailed('search from POI failed');
          return;
        }
        if (geocodingResult.poiInfos) {
          const geoJsonResult = this._dataToGeoJson(geocodingResult.poiInfos, this.geoCodeParam);
          this._searchFeaturesSucceed(geoJsonResult.slice(0, this.maxFeatures), 'Online 本地搜索');
        }
      })
      .catch(error => {
        this._searchFeaturesFailed(error);
      });
  }

  _searchFromRestMap(restMaps) {
    restMaps.forEach(restMap => {
      let iserverService = new iServerRestService(restMap.url);
      iserverService.on('getdatafailed', e => {
        this._searchFeaturesFailed(e);
      });
      iserverService.on('featureisempty', e => {
        this.searchCount--;
        this.fire('searchresultisempty', e);
        console.log(e);
      });
      iserverService.on('getdatasucceeded', e => {
        if (e.features) {
          let resultFeatures = this._getFeaturesByKeyWord(this.keyWord, e.features);
          this._searchFeaturesSucceed(resultFeatures, restMap.name || 'Rest Map Search');
        }
      });
      iserverService.getMapFeatures(
        { dataUrl: restMap.url, mapName: restMap.layerName },
        { maxFeatures: this.maxFeatures, keyWord: this.keyWord }
      );
    }, this);
  }

  _searchFromRestData(restDatas) {
    restDatas.forEach(restData => {
      let iserverService = new iServerRestService(restData.url);
      iserverService.on('getdatafailed', e => {
        this._searchFeaturesFailed(e);
      });
      iserverService.on('featureisempty', e => {
        this.searchCount--;
        this.fire('searchresultisempty', e);
        console.log(e);
      });
      iserverService.on('getdatasucceeded', e => {
        if (e.features && e.features.length > 0) {
          let resultFeatures = this._getFeaturesByKeyWord(this.keyWord, e.features);
          this._searchFeaturesSucceed(resultFeatures, restData.name || 'Rest Data Search');
        } else {
          this.searchCount--;
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
    iportalDatas.forEach(iportal => {
      let iPortalService = new iPortalDataService(iportal.url, iportal.withCredentials || false);
      iPortalService.on('getdatafailed', e => {
        this._searchFeaturesFailed(e);
      });
      iPortalService.on('featureisempty', e => {
        this.searchCount--;
        this.fire('searchresultisempty', e);
        console.log(e);
      });
      iPortalService.on('getdatasucceeded', e => {
        if (e.features) {
          let resultFeatures = this._getFeaturesByKeyWord(this.keyWord, e.features);
          this._searchFeaturesSucceed(resultFeatures, iportal.name || 'Rest Map Search');
        }
      });
      iPortalService.getData({ keyWord: this.keyWord });
    }, this);
  }

  _searchFromAddressMatch(addressMatches) {
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
        if (e.result.length > 0) {
          this._searchFeaturesSucceed(e.result, addressMatch.name || 'Address Match Search');
        } else {
          this._searchFeaturesFailed(e);
        }
      });
    }, this);
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
          filterAttributeValue: data[i].formatedAddress || data[i].address
        },
        filterVal: `${data[i].name || geoCodeParam.keyWords}：${data[i].formatedAddress || data[i].address}`
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
          let filterAttributeValue = fAttr[attributeName];
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
}
