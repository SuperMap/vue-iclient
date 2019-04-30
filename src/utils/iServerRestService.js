export default class iServerRestService extends mapboxgl.Evented {
  constructor(url) {
    super();
    this.url = url;
  }
  getData(queryInfo) {
    if (!(this._checkUrl(this.url))) {
      return null;
    }
    SuperMap.FetchRequest.get(this.url).then((response) => {
      return response.json();
    }).then((results) => {
      if (results.datasetInfo) {
        const datasetInfo = {
          dataSourceName: results.datasetInfo.dataSourceName,
          datasetName: results.datasetInfo.name,
          mapName: results.name,
        };
        this._getDatasetInfoSucceed(datasetInfo, queryInfo);
      }
    }).catch((error) => {
      this.fire('getdatafailed', error);
    });
  }
  _getDatasetInfoSucceed(datasetInfo, queryInfo) {
    let datasetUrl = this.url;
    //判断服务为地图服务 或者 数据服务
    let restIndex = datasetUrl.indexOf("rest");
    if (restIndex > 0) {
      let index = datasetUrl.indexOf("/", restIndex + 5);
      let type = datasetUrl.substring(restIndex + 5, index);
      if (type === "maps") {
        let mapIndex = datasetUrl.indexOf("/", index + 1);
        let mapName = datasetUrl.substring(index + 1, mapIndex);
        datasetInfo.dataUrl = datasetUrl.substring(0, restIndex + 4) + "/maps/" + mapName;;
        this.getMapFeatures(datasetInfo, queryInfo);
      } else if (type === "data") {
        datasetInfo.dataUrl = datasetUrl.substring(0, restIndex + 4) + "/data";
        this.getDataFeatures(datasetInfo, queryInfo);
      }
    }
  }
  getMapFeatures(datasetInfo, queryInfo) {
    let queryParam, queryBySQLParams, queryBySQLService;
    let params = {
      name: datasetInfo.mapName
    };
    Object.assign(params, queryInfo);
    queryParam = new SuperMap.FilterParameter(params);
    queryBySQLParams = new SuperMap.QueryBySQLParameters({
      queryParams: [queryParam],
      expectCount: 100000
    });
    queryBySQLService = new SuperMap.QueryBySQLService(datasetInfo.dataUrl, {
      eventListeners: {
        "processCompleted": this.getFeaturesSucceed.bind(this),
        "processFailed": function () { }
      }
    });
    queryBySQLService.processAsync(queryBySQLParams);
  }
  getDataFeatures(datasetInfo, queryInfo) {
    let getFeatureParam, getFeatureBySQLParams, getFeatureBySQLService;
    let params = {
      name: datasetInfo.datasetName + "@" + datasetInfo.dataSourceName
    }
    Object.assign(params, queryInfo);
    getFeatureParam = new SuperMap.FilterParameter(params);
    getFeatureBySQLParams = new SuperMap.GetFeaturesBySQLParameters({
      queryParameter: getFeatureParam,
      datasetNames: [datasetInfo.dataSourceName + ":" + datasetInfo.datasetName],
      fromIndex: 0,
      toIndex: 100000
    });
    getFeatureBySQLService = new SuperMap.GetFeaturesBySQLService(datasetInfo.dataUrl, {
      eventListeners: {
        "processCompleted": this.getFeaturesSucceed.bind(this),
        "processFailed": function () { }
      }
    });

    getFeatureBySQLService.processAsync(getFeatureBySQLParams);
  }
  getFeaturesSucceed(results) {
    let features;
    let fieldCaptions;
    let fieldTypes;

    if (results.result && results.result.recordsets) {
      // 数据来自restmap
      const recordsets = results.result.recordsets[0];
      this.features = recordsets.features;
      features = this.features.features;
      if (features.length) {
        features = recordsets.features;
        fieldCaptions = recordsets.fieldCaptions;
        fieldTypes = recordsets.fieldTypes;
      }
    } else {
      // 数据来自restdata---results.result.features
      this.features = results.result.features;
      features = this.features.features;
      fieldCaptions = [];
      fieldTypes = [];
      if (features.length) {
        const feature = this.features.features[0];
        //获取每个字段的名字和类型
        for (let attr in feature.properties) {
          fieldCaptions.push(attr);
          fieldTypes.push(this._getDataType(feature.properties[attr]));
        }
      }
    }
    const data = {
      features,
      fieldCaptions,
      fieldTypes,
      fieldValues: []
    }
    for (let m in fieldCaptions) {
      const fieldValue = [];
      for (let j in features) {
        const feature = features[j];
        const caption = data.fieldCaptions[m];
        const value = feature.properties[caption];
        fieldValue.push(value);
      }
      //fieldValues   [[每个字段的所有要素值],[],[]]
      data.fieldValues.push(fieldValue);
    }
    //this.getDataSucceedCallback && this.getDataSucceedCallback(data);
    this.fire('getdatasucceeded', data)
  }

  /**
   * @function iServerRestService.prototype._checkUrl
   * @description 检查url是否符合要求
   * @private
   * @param {string} url
   */
  _checkUrl(url) {
    let match;
    if (url === '' || !this._isMatchUrl(url)) {
      match = false;
    }
    // else if (/^http[s]?:\/\/localhost/.test(url) || /^http[s]?:\/\/127.0.0.1/.test(url)) {
    //     //不是实际域名
    //     match = false;
    // } 
    else {
      match = true;
    }
    return match;
  }

  /**
   * @function iServerRestService.prototype._isMatchUrl
   * @description 判断输入的地址是否符合地址格式
   * @private
   * @param {string} str - url
   */
  _isMatchUrl(str) {
    var reg = new RegExp('(https?|http|file|ftp)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]');
    return reg.test(str);
  }
  /**
     /**
   * @function ChartViewModel.prototype._isDate
   * @description 判断是否为日期
   * @private
   * @param {string} data - 字符串
   */
  _isDate(data) {
    let reg = /((^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(10|12|0?[13578])([-\/\._])(3[01]|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(11|0?[469])([-\/\._])(30|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(0?2)([-\/\._])(2[0-8]|1[0-9]|0?[1-9])$)|(^([2468][048]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([3579][26]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][13579][26])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][13579][26])([-\/\._])(0?2)([-\/\._])(29)$))/ig;
    return reg.test(data);
  }
  /**
   * @function iServerRestService.prototype._getDataType
   * @description 判断数据的类型
   * @private
   * @param {string} data - 字符串
   */
  _getDataType(data) {
    if (data !== null && data !== undefined && data !== '') {
      if (this._isDate(data)) {
        return "DATE";
      }
      if (this._isNumber(data)) {
        return "NUMBER";
      }
    }
    return "STRING";
  }
  /**
   * @function iServerRestService.prototype._isNumber
   * @description 判断是否为数值
   * @private
   * @param {string} data - 字符串
   */
  _isNumber(data) {
    let mdata = Number(data);
    if (mdata === 0) {
      return true;
    }
    return !isNaN(mdata);
  }

}
