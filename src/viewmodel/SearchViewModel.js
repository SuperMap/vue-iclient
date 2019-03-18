import WidgetViewModel from "./WidgetViewModel";
import "@libs/iclient-mapboxgl/iclient9-mapboxgl-es6";
import clonedeep from 'lodash.clonedeep';
import center from '@turf/center';

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
    this.maxReturn = this.options.maxReturn >= 100 ? 100 : this.options.maxReturn || 8
    this.options.cityGeoCodingConfig = {
      addressUrl:
        "http://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos",
      key: "fvV2osxwuZWlY0wJb8FEb2i5"
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
    this.searchtType.forEach(item => {
      if (this.options[item]) {
        if (item === 'onlineLocalSearch' && this.options[item].enable) {
          this.searchCount += 1;
        } else if (item !== 'onlineLocalSearch') {
          let len = this.options[item].length
          this.searchCount += len;
        }
      }
    }, this)
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
    let filterValue = filter.indexOf("：") > 0 ? filter.split("：")[1].trim() : filter;
    filterValue = filterValue === 'null' ? filter.split("：")[0].trim() : filterValue
    let data = { info: [] };
    searchResult.forEach(result => {
      if (sourceName === result.source) {
        result.result.forEach(feature => {
          let geometry, coordinates;
          let properties = feature.properties || feature;
          let propertiesValue = properties.address || feature.filterAttribute.filterAttributeValue || properties.name;
          if (propertiesValue.trim() === filterValue) {
            geometry = feature.geometry || [feature.location.x, feature.location.y];
            if (geometry.type === "MultiPolygon" || geometry.type === "Polygon" || geometry.type === 'LineString') {
              coordinates = center(feature).geometry.coordinates;
            } else {
              coordinates = geometry.coordinates || geometry;
            }
            data.coordinates = coordinates;
            if (filter.indexOf("：") < 0) {
              data.info.push({ attribute: "地址", attributeValue: propertiesValue });
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
      className: "attributePopup",
      closeOnClick: false
    }).setLngLat(coordinates).setHTML(popupContainer.innerHTML).addTo(this.map);
    let marker = new mapboxgl.Marker().setLngLat(coordinates).setPopup(popup).addTo(this.map);
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
          resultFeature.length > 0 && this.searchResult.push({ source: sourceName, result: resultFeature.slice(0, this.maxReturn) })
          this.searchCount--;
          this.searchCount === 0 && this.fire('searchsucceeded' + this.searchTaskId, { result: this.searchResult }) && (this.searchTaskId += 1);
        } else {
          this.searchCount--;
          this.fire("searchfailed" + this.searchTaskId, {
            error: `The ${sourceName} does not exist`
          });
        }
      }, this);
    }, 0)
  }

  _searchFromPOI(onlineLocalSearch) {
    this.geoCodeParam = {
      pageSize: this.options.pageSize || 10,
      pageNum: this.options.pageNum || 1,
      city: onlineLocalSearch.city
    };
    this.geoCodeParam.keyWords = this.keyWord;
    let url = this._getSearchUrl(this.geoCodeParam);
    SuperMap.FetchRequest.get(url).then(response => {
      return response.json();
    }).then(geocodingResult => {
      if (geocodingResult.error || geocodingResult.poiInfos.length === 0) {
        this.searchCount--;
        this.fire("searchfailed", {
          error: "search from POI failed"
        });
        return;
      }
      if (geocodingResult.poiInfos) {
        const geoJsonResult = this._dataToGeoJson(geocodingResult.poiInfos, this.geoCodeParam);
        geoJsonResult.length > 0 && this.searchResult.push({ source: "Online 本地搜索", result: geoJsonResult.slice(0, this.maxReturn) })
        this.searchCount--;
        this.searchCount === 0 && this.fire('searchsucceeded' + this.searchTaskId, { result: this.searchResult }) && (this.searchTaskId += 1);
      }
    }).catch(error => {
      this.searchCount--;
      this.fire("searchfailed", { error });
      console.log(error);
    });
  }

  _searchFromRestMap(restMaps) {
    restMaps.forEach(restMap => {
      this._getRestMapFields(restMap, fields => {
        let attributeFilter = this._getAttributeFilter(fields);
        let param = new SuperMap.QueryBySQLParameters({
          queryParams: {
            name: restMap.layerName,
            attributeFilter: attributeFilter
          },
          startRecord: 0,
          expectCount: this.maxReturn
        });
        new mapboxgl.supermap.QueryService(restMap.url).queryBySQL(param, serviceResult => {
          if (serviceResult.result) {
            let resultFeatures = this._getFeaturesByKeyWord(this.keyWord, serviceResult.result.recordsets[0].features.features);
            resultFeatures.length > 0 && this.searchResult.push({ source: restMap.name || 'Rest Map Search', result: resultFeatures })
            this.searchCount--;
            this.searchCount === 0 && this.fire('searchsucceeded' + this.searchTaskId, { result: this.searchResult }) && (this.searchTaskId += 1);
          } else {
            this.searchCount--;
          }
        })
      });
    }, this)

  }

  _searchFromRestData(restDatas) {
    restDatas.forEach(restData => {
      let datasourceName = restData.dataName[0].split(":")[0];
      let datasetName = restData.dataName[0].split(":")[1];
      let fieldsUrl = restData.url + `/datasources/${datasourceName}/datasets/${datasetName}/fields.rjson`;
      this._getRestDataFields(fieldsUrl, fields => {
        let attributeFilter = this._getAttributeFilter(fields);
        let param = new SuperMap.GetFeaturesBySQLParameters({
          queryParameter: {
            attributeFilter: attributeFilter
          },
          datasetNames: restData.dataName,
          fromIndex: 0,
          toIndex: this.maxReturn - 1
        });
        new mapboxgl.supermap.FeatureService(restData.url).getFeaturesBySQL(param, serviceResult => {
          if (serviceResult.result) {
            let resultFeatures = this._getFeaturesByKeyWord(this.keyWord, serviceResult.result.features.features);
            resultFeatures.length > 0 && this.searchResult.push({ source: restData.name || "Rest Data Search", result: resultFeatures })
            this.searchCount--;
            this.searchCount === 0 && this.fire('searchsucceeded' + this.searchTaskId, { result: this.searchResult }) && (this.searchTaskId += 1);
          } else {
            this.searchCount--;
          }
        })
      });
    }, this)
  }

  _searchFromIportal(iportalDatas) {
    iportalDatas.forEach(iportal => {
      let url = iportal.url;
      this.withCredentials = iportal.withCredentials || false;
      SuperMap.FetchRequest.get(url, null, { withCredentials: this.withCredentials || false }).then(response => {
        return response.json();
      }).then(data => {
        if (data.succeed === false) {
          this.searchCount--;
          //请求失败
          return;
        }
        // 是否有rest服务
        if (data.dataItemServices && data.dataItemServices.length > 0) {
          let dataItemServices = data.dataItemServices, resultData;
          dataItemServices.forEach(item => {
            if (item.serviceType === "RESTDATA" && item.serviceStatus === "PUBLISHED") {
              resultData = item;
            } else if (item.serviceType === "RESTMAP" && item.serviceStatus === "PUBLISHED") {
              resultData = item;
            } else {
              this._getDatafromContent(iportal);
              return;
            }
          }, this);
          // 如果有服务，获取数据源和数据集, 然后请求rest服务
          this._getDatafromRest(resultData.serviceType, resultData.address, iportal);
        } else {
          this._getDatafromContent(iportal);
          return;
        }
      }).catch(error => {
        this.fire("searchfailed", { error });
        console.log(error);
      });
    }, this)
  }

  _getDatafromRest(serviceType, address, iportal) {
    let withCredentials = this.withCredentials || false;
    if (serviceType === 'RESTDATA') {
      let url = `${address}/data/datasources`, sourceName, datasetName; // 请求获取数据源名
      SuperMap.FetchRequest.get(url, null, { withCredentials }).then(response => {
        return response.json()
      }).then(data => {
        sourceName = data.datasourceNames[0];
        url = `${address}/data/datasources/${sourceName}/datasets`;
        // 请求获取数据集名
        SuperMap.FetchRequest.get(url, null, { withCredentials }).then(response => {
          return response.json()
        }).then(data => {
          datasetName = data.datasetNames[0];
          // 请求restdata服务
          this._searchFromRestData([{ name: [sourceName + ':' + datasetName], url: `${address}/data`, resultName: iportal.resultName || 'Iportal Data Search' }]);
        }).catch((error) => {
          console.log(error);
        })
      }).catch((error) => {
        console.log(error);
      });
    } else {
      // 如果是地图服务
      let url = `${address}/maps`, mapName, layerName, path; // 请求获取地图名
      SuperMap.FetchRequest.get(url, null, { withCredentials }).then(response => {
        return response.json()
      }).then(data => {
        mapName = data[0].name;
        path = data[0].path;
        url = url = `${address}/maps/${mapName}/layers`;
        // 请求获取图层名
        SuperMap.FetchRequest.get(url, null, { withCredentials }).then(response => {
          return response.json()
        }).then(data => {
          layerName = data[0].subLayers.layers[0].caption;
          // 请求restmap服务
          this._searchFromRestData([{ name: layerName, url: path, resultName: iportal.resultName || 'Iportal Data Search' }])
          return layerName;
        }).catch((error) => {
          this.fire("searchfailed", { error });
          console.log(error);
        })
      }).catch(error => {
        this.fire("searchfailed", { error });
        console.log(error);
      });

    }
  }

  _getDatafromContent(iportal) {
    let features;
    let url = iportal.url + '/content.json?pageSize=9999999&currentPage=1';
    // 获取图层数据
    SuperMap.FetchRequest.get(url, null, {
      withCredentials: iportal.withCredentials || false
    }).then(response => {
      return response.json()
    }).then(data => {
      if (data.succeed === false) {
        //请求失败
        this.searchCount--;

        return;
      }
      if (data.type) {
        if (data.type === "JSON" || data.type === "GEOJSON") {
          data.content = JSON.parse(data.content.trim());
          // 如果是json文件 data.content = {type:'fco', features},格式不固定
          if (!(data.content.features)) {
            //json格式解析失败
            console.log('JSON 格式解析失败！');
            return;
          }
          features = this._formatGeoJSON(data.content);
        } else if (data.type === 'EXCEL' || data.type === 'CSV') {
          features = this._excelData2Feature(data.content);
        }
        let resultFeatures = this._getFeaturesByKeyWord(this.keyWord, features);
        resultFeatures.length > 0 && this.searchResult.push({ source: iportal.resultName || 'Iportal Data Search', result: resultFeatures.slice(0, this.maxReturn) })
        this.searchCount--;
        this.searchCount === 0 && this.fire('searchsucceeded' + this.searchTaskId, { result: this.searchResult }) && (this.searchTaskId += 1);
      }
    }).catch(error => {
      this.searchCount--;
      console.log(error);
    });
  }
  _formatGeoJSON(data) {
    let features = data.features;
    features.forEach((row, index) => {
      row.properties['index'] = index;
    })
    return features;
  }
  _excelData2Feature(dataContent) {
    let fieldCaptions = dataContent.colTitles;
    //位置属性处理
    let xfieldIndex = -1,
      yfieldIndex = -1;
    for (let i = 0, len = fieldCaptions.length; i < len; i++) {
      if (SuperMap.Widgets.FileReaderUtil.isXField(fieldCaptions[i])) {
        xfieldIndex = i;
      }
      if (SuperMap.Widgets.FileReaderUtil.isYField(fieldCaptions[i])) {
        yfieldIndex = i;
      }
    }

    // feature 构建后期支持坐标系 4326/3857
    let features = [];

    for (let i = 0, len = dataContent.rows.length; i < len; i++) {
      let row = dataContent.rows[i];

      let x = Number(row[xfieldIndex]),
        y = Number(row[yfieldIndex]);
      //属性信息
      let attributes = {};
      for (let index in dataContent.colTitles) {
        let key = dataContent.colTitles[index];
        attributes[key] = dataContent.rows[i][index];
      }
      attributes['index'] = i + '';
      //目前csv 只支持处理点，所以先生成点类型的 geojson
      let feature = {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [x, y]
        },
        "properties": attributes
      };
      features.push(feature);
    }
    return features;
  }
  _getRestMapFields(restMap, callBack) {
    let param = new SuperMap.QueryBySQLParameters({
      queryParams: {
        name: restMap.layerName,
        attributeFilter: "SMID=0"
      }
    });
    new mapboxgl.supermap.QueryService(restMap.url).queryBySQL(param, serviceResult => {
      let fields;
      serviceResult.result && (fields = serviceResult.result.recordsets[0].fields);
      fields && callBack(fields);
    })
  }

  _getRestDataFields(fieldsUrl, callBack) {
    SuperMap.FetchRequest.get(fieldsUrl).then(response => {
      return response.json();
    }).then(results => {
      let fields = results.fieldNames;
      callBack(fields);
    }).catch(error => {
      console.log(error);
    });
  }

  _searchFromAddressMatch(addressMatches) {
    addressMatches.forEach(addressMatch => {
      this.addressMatchService = new mapboxgl.supermap.AddressMatchService(addressMatch.url);
      let parm = {
        address: this.keyWord,
        fromIndex: 0,
        toIndex: this.maxReturn,
        maxReturn: this.maxReturn,
        prjCoordSys: "{epsgcode:4326}"
      };
      let geoCodeParam = new SuperMap.GeoCodingParameter(parm);
      this.addressMatchService.code(geoCodeParam, e => {
        if (e.result.length > 0) {
          e.result.length > 0 && this.searchResult.push({ source: addressMatch.name || 'Address Match Search', result: e.result })
          this.searchCount--;
          this.searchCount === 0 && this.fire('searchsucceeded' + this.searchTaskId, { result: this.searchResult }) && (this.searchTaskId += 1);
        } else {
          this.searchCount--;
        }
      });
    }, this)

  }

  _dataToGeoJson(data, geoCodeParam) {
    let features = [];
    for (let i = 0; i < data.length; i++) {
      let feature = {
        type: "Feature",
        geometry: {
          type: "Point",
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
      `.json?keywords=${geoCodeParam.keyWords}&city=${geoCodeParam.city || '北京市'}&pageSize=${geoCodeParam.pageSize}&pageNum=${geoCodeParam.pageNum}&key=${
      this.options.cityGeoCodingConfig.key
      }`;
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
        if (
          fAttr[attributeName] &&
          keyReg.test(fAttr[attributeName].toString().toLowerCase())
        ) {
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
    properties && Object.keys(properties).forEach(field => {
      attributeNames.push(field);
    }, this);
    return attributeNames;
  }

  _getAttributeFilter(fields) {
    let attributeFilter = "";
    fields.forEach((field, index) => {
      attributeFilter += index !== fields.length - 1
        ? `${field} LIKE '%${this.keyWord}%' ` + "OR "
        : `${field} LIKE '%${this.keyWord}%'`;
    }, this);
    return attributeFilter;
  }
}
