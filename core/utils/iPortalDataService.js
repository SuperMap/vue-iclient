import { FetchRequest } from '@supermapgis/iclient-common/util/FetchRequest';
import { Util } from '@supermapgis/iclient-common/commontypes/Util';
import iServerRestService, { vertifyEpsgCode, transformFeatures } from 'vue-iclient-core/utils/iServerRestService';
import { isXField, isYField, handleWithCredentials, handleDataParentRes } from 'vue-iclient-core/utils/util';
import { createAttributeFilterPredicate, ensureJsonSql, filterFeaturesByAttributeFilter } from 'vue-iclient-core/utils/json-sql-filter';
import { toAttributeFilter, mapFilterFieldNames } from 'vue-iclient-core/utils/attribute-filter';
import { getStructuredDataFieldMap } from 'vue-iclient-core/utils/structured-data-field-map';
import { Events } from 'vue-iclient-core/types/event/Events';

/** 结构化数据 OGC API Features 单次请求的要素数上限 */
const STRUCTURED_DATA_PAGE_SIZE = 5000;

/**
 * @class iPortalDataService
 * @classdesc iPortal 数据请求类。
 * @category  BaseTypes Util
 * @param {string} url - iPortal 数据地址。
 * @param {Boolean} [withCredentials=false] - 请求是否携带 cookie。
 * @fires iPortalDataService#getdatasucceeded
 * @fires iPortalDataService#getdatafailed
 * @fires iPortalDataService#featureisempty
 */
export default class iPortalDataService extends Events {
  constructor(url, withCredentials, options = {}) {
    super();
    this.url = url;
    this.withCredentials = withCredentials || false;
    this.epsgCode = options.epsgCode;
    this.dataType = options.dataType;
    this.iportalServiceProxyUrl = options.iportalServiceProxyUrl;
    this.eventTypes = ['getdatasucceeded', 'getdatafailed', 'featureisempty'];
    this.resourceId = options.resourceId;
    if (this.resourceId) {
      this.url = handleDataParentRes(url, this.resourceId, 'DATA');
    }
    this.initSerivce(this.url);
  }

  initSerivce(url) {
    this.iserverService = new iServerRestService(url, { epsgCode: this.epsgCode });
    this.iserverService.on({
      getdatasucceeded: e => {
        /**
         * @event iPortalDataService#getdatasucceeded
         * @description 请求数据成功后触发。
         * @property {Object} e  - 事件对象。
         */
        this.triggerEvent('getdatasucceeded', e);
      },
      getdatafailed: e => {
        /**
         * @event iPortalDataService#getdatafailed
         * @description 请求数据失败后触发。
         * @property {Object} e  - 事件对象。
         */
        this.triggerEvent('getdatafailed', e);
      },
      featureisempty: e => {
        /**
         * @event iPortalDataService#featureisempty
         * @description 请求数据为空后触发。
         * @property {Object} e  - 事件对象。
         */
        this.triggerEvent('featureisempty', e);
      }
    });
  }

  /**
   * @function iPortalDataService.prototype.getData
   * @description 请求数据。
   * @param {Object} queryInfo - 可选参数。
   * @param {Object} [queryInfo.maxFeatures] - 最多可返回的要素数量。
   * @param {Object} [queryInfo.attributeFilter] - 属性过滤条件。
   * @param {Object} [queryInfo.keyWord] - 筛选关键字。
   * @param {boolean} [queryInfo.onlyService]
   */
  getData(queryInfo = {}, preferContent = false) {
    if (this.dataType === 'STRUCTUREDDATA') {
      this._getStructureDatafromContent(queryInfo);
      return;
    }

    if (!this.url) {
      return;
    }
    let datasetUrl = this.url;

    const onlyService = queryInfo.onlyService;
    if (preferContent && !onlyService) {
      this._getDatafromContent(datasetUrl, queryInfo);
      return;
    }
    delete queryInfo.onlyService;
    FetchRequest.get(datasetUrl, null, {
      withCredentials: this.withCredentials
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data.succeed === false) {
          // 请求失败
          this.triggerEvent('getdatafailed', {
            data
          });
          return;
        }
        if (data.type === 'STRUCTUREDDATA') {
          this._getStructureDatafromContent(queryInfo);
          return;
        }
        const hasService = data.dataItemServices && data.dataItemServices.length > 0;
        if (onlyService && !hasService) {
          this.triggerEvent('getdatafailed', {
            error: { message: 'This service cannot support to query!' },
            onlyService
          });
          return;
        }
        // 是否有rest服务
        if (hasService) {
          let dataItemServices = data.dataItemServices;
          let resultData = dataItemServices.find(
            item =>
              (item.serviceType === 'RESTDATA' || item.serviceType === 'RESTMAP') && item.serviceStatus === 'PUBLISHED'
          );
          // 有rest服务并且address不为空（online的address服务为''）
          if (resultData && resultData.address) {
            // 如果有服务，获取数据源和数据集, 然后请求rest服务
            let serviceUrl = resultData.address;
            if (this.resourceId) {
              serviceUrl = handleDataParentRes(serviceUrl, this.resourceId, 'DATA');
            }
            this._getDatafromRest(resultData.serviceType, serviceUrl, queryInfo);
          } else {
            this._getDatafromContent(datasetUrl, queryInfo, data.dataMetaInfo);
          }
        } else {
          this._getDatafromContent(datasetUrl, queryInfo, data.dataMetaInfo);
        }
      })
      .catch(error => {
        console.log(error);
        this.triggerEvent('getdatafailed', {
          error
        });
      });
  }

  /**
   * 结构化数据（OGC API Features）查询。
   * 同步自 vue-iclient-dev：过滤条件通过 CQL 下推服务端，服务端单页最多 5000 条，超出按 offset 分页。
   * @param {Object} [queryInfo] - 查询参数，支持 maxFeatures / attributeFilter。
   */
  _getStructureDatafromContent(queryInfo = {}) {
    let url = this.url;
    if (url.includes('?')) {
      url = url.split('?')[0];
    }
    const formatUrl = Util.urlPathAppend(url, '/structureddata/ogc-features/collections/all/items.json');
    const maxFeatures = this._getStructureDataMaxFeatures(queryInfo);
    const pageSize = STRUCTURED_DATA_PAGE_SIZE;
    const firstCount = maxFeatures ? Math.min(pageSize, maxFeatures) : pageSize;

    this._getStructureData({ url: formatUrl, count: firstCount, offset: 0, queryInfo }).then(data => {
      if (!data) {
        return;
      }
      let featureResults = Array.isArray(data.features) ? data.features : [];
      const numberMatched = Number(data.numberMatched);
      const totalMatched = Number.isFinite(numberMatched) && numberMatched >= 0 ? numberMatched : featureResults.length;
      if (this._isStructureDataComplete(featureResults, totalMatched, maxFeatures)) {
        this._publishStructureData(featureResults, maxFeatures);
        return;
      }

      const allRequest = [];
      for (let offset = featureResults.length; offset < totalMatched; ) {
        const count = maxFeatures ? Math.min(pageSize, maxFeatures - offset) : pageSize;
        if (count <= 0) {
          break;
        }
        allRequest.push(this._getStructureData({ url: formatUrl, count, offset, queryInfo }));
        offset += count;
      }
      if (!allRequest.length) {
        this._publishStructureData(featureResults, maxFeatures);
        return;
      }

      // 所有请求结束
      Promise.all(allRequest).then(results => {
        // 结果合并
        results.forEach(result => {
          if (result && Array.isArray(result.features)) {
            featureResults = featureResults.concat(result.features);
          }
        });
        this._publishStructureData(featureResults, maxFeatures);
      });
    });
  }

  _getStructureDataMaxFeatures(queryInfo = {}) {
    const maxFeatures = Number(queryInfo.maxFeatures);
    return Number.isFinite(maxFeatures) && maxFeatures > 0 ? maxFeatures : 0;
  }

  _isStructureDataComplete(featureResults, totalMatched, maxFeatures) {
    if (!featureResults.length) {
      return true;
    }
    if (maxFeatures && featureResults.length >= maxFeatures) {
      return true;
    }
    return featureResults.length >= totalMatched;
  }

  _publishStructureData(featureResults, maxFeatures) {
    let features = this._transformContentFeatures(featureResults);
    if (maxFeatures && features.length > maxFeatures) {
      features = features.slice(0, maxFeatures);
    }
    const result = {
      features: {
        type: 'FeatureCollection',
        features
      }
    };
    this.vertified && (result.vertified = this.vertified);
    this.iserverService._getFeaturesSucceed({ result });
  }

  /**
   * 结构化数据（OGC API Features）单页查询。
   * 过滤条件先按 structureddata.json 的 fieldNames → tableFieldNames 换成表字段名，
   * 再转成 CQL（属性名双引号、字符串值单引号）。
   */
  async _getStructureData({ url, count, offset, queryInfo = {} }) {
    let queryParams = `limit=${count}`;
    if (offset) {
      queryParams += `&offset=${offset}`;
    }
    if (queryInfo.attributeFilter) {
      // 类型在这里判定最可靠——配置里没带 dataType 时，是请求回来才发现结构化的；
      // 属性名要换成表中的字段名，否则显示名（fieldNames）过滤不生效
      const fieldMap = await getStructuredDataFieldMap(this.url, {
        withCredentials: this.withCredentials
      });
      const filter = toAttributeFilter(
        mapFilterFieldNames(queryInfo.attributeFilter, fieldMap),
        'STRUCTUREDDATA'
      );
      queryParams += `&filter=${encodeURIComponent(filter)}&filter-lang=cql-text`;
    }
    url = Util.urlAppend(url, queryParams);
    return FetchRequest.get(url, null, {
      withCredentials: this.withCredentials
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (!data || (data.succeed === false && data.error)) {
          const msg = data ? data.error.errorMsg : 'empty data';
          throw msg;
        }
        return data;
      })
      .catch(error => {
        console.log(error);
        this.triggerEvent('getdatafailed', {
          error
        });
      });
  }

  /**
   * 非结构化数据（REST 服务 / content.json）用的过滤文本：
   * 表达式转成普通 SQL，字段名不加引号；旧版字符串原样返回。
   * 就地改写 queryInfo，下游按文本处理（iServer 查询、本地 json-sql）。
   */
  _normalizeAttributeFilter(queryInfo) {
    queryInfo.attributeFilter = toAttributeFilter(queryInfo.attributeFilter, this.dataType);
    return queryInfo;
  }

  _getDatafromRest(serviceType, address, queryInfo) {
    this._normalizeAttributeFilter(queryInfo);
    if (serviceType === 'RESTDATA') {
      let url = Util.urlPathAppend(address, 'data/datasources');
      let dataSourceName;
      let datasetName; // 请求获取数据源名
      FetchRequest.get(url, null, {
        withCredentials: handleWithCredentials(url, this.iportalServiceProxyUrl, this.withCredentials)
      })
        .then(response => {
          return response.json();
        })
        .then(data => {
          dataSourceName = data.datasourceNames && data.datasourceNames[0];
          url = Util.urlPathAppend(address, `data/datasources/${dataSourceName}/datasets`);
          // 请求获取数据集名
          FetchRequest.get(url, null, {
            withCredentials: handleWithCredentials(url, this.iportalServiceProxyUrl, this.withCredentials)
          })
            .then(response => {
              return response.json();
            })
            .then(data => {
              datasetName = data.datasetNames[0];
              // 请求restdata服务
              this.iserverService.getDataFeatures(
                {
                  datasetName,
                  dataSourceName,
                  dataUrl: Util.urlPathAppend(address, 'data')
                },
                Object.assign({}, queryInfo, {
                  withCredentials: handleWithCredentials(url, this.iportalServiceProxyUrl, this.withCredentials)
                })
              );
            })
            .catch(error => {
              console.log(error);
              this.triggerEvent('getdatafailed', {
                error
              });
            });
        })
        .catch(error => {
          // 没有这个 catch，请求失败会让查询 promise 一直挂起（图层既不加载也不报错）
          console.log(error);
          this.triggerEvent('getdatafailed', {
            error
          });
        });
    } else {
      // 如果是地图服务
      let url = Util.urlPathAppend(address, 'maps');
      let mapName;
      let layerName;
      let path; // 请求获取地图名
      FetchRequest.get(url, null, {
        withCredentials: handleWithCredentials(url, this.iportalServiceProxyUrl, this.withCredentials)
      })
        .then(response => {
          return response.json();
        })
        .then(data => {
          if (data[0]) {
            mapName = data[0].name;
            path = data[0].path;
            if (this.resourceId) {
              path = handleDataParentRes(path, this.resourceId, 'DATA');
            }
          }
          url = Util.urlPathAppend(address, `maps/${mapName}/layers`);
          // 请求获取图层名
          FetchRequest.get(url, null, {
            withCredentials: handleWithCredentials(url, this.iportalServiceProxyUrl, this.withCredentials)
          })
            .then(response => {
              return response.json();
            })
            .then(data => {
              layerName = data[0].subLayers.layers[0].caption;
              // 请求restmap服务
              this.iserverService.getMapFeatures(
                {
                  mapName: layerName,
                  dataUrl: path
                },
                Object.assign({}, queryInfo, {
                  withCredentials: handleWithCredentials(url, this.iportalServiceProxyUrl, this.withCredentials)
                })
              );
              return layerName;
            })
            .catch(error => {
              console.log(error);
              this.triggerEvent('getdatafailed', {
                error
              });
            });
        })
        .catch(error => {
          console.log(error);
          this.triggerEvent('getdatafailed', {
            error
          });
        });
    }
  }

  _getDataInfoUrl(datasetUrl) {
    const raw = String(datasetUrl || this.url || '');
    const [pathPart, queryPart = ''] = raw.split('?');
    const dataRoot = pathPart.replace(/\/content\.json$/i, '').replace(/\.json$/i, '').replace(/\/$/, '');
    const params = queryPart
      .split('&')
      .filter(Boolean)
      .filter(item => !/^(pageSize|currentPage)=/i.test(item));
    return params.length ? `${dataRoot}?${params.join('&')}` : dataRoot;
  }

  _fetchDataMetaInfo(datasetUrl) {
    const infoUrl = this._getDataInfoUrl(datasetUrl);
    if (!infoUrl) {
      return Promise.resolve(undefined);
    }
    return FetchRequest.get(infoUrl, null, {
      withCredentials: this.withCredentials
    })
      .then(response => response.json())
      .then(data => {
        if (!data || data.succeed === false) {
          return undefined;
        }
        return data.dataMetaInfo;
      })
      .catch(() => undefined);
  }

  _parseCoordinateIndex(rawIndex, titlesLength) {
    const idx =
      typeof rawIndex === 'number' || (typeof rawIndex === 'string' && rawIndex.trim() !== '')
        ? Number(rawIndex)
        : NaN;
    if (Number.isInteger(idx) && idx >= 0 && idx < titlesLength) {
      return idx;
    }
    return -1;
  }

  _resolveExcelXYFieldIndexes(fieldCaptions, dataMetaInfo) {
    const titles = (fieldCaptions || []).map(item => String(item == null ? '' : item).trim());
    let xfieldIndex = -1;
    let yfieldIndex = -1;
    const xField = dataMetaInfo && String(dataMetaInfo.xField || '').trim();
    const yField = dataMetaInfo && String(dataMetaInfo.yField || '').trim();
    if (xField) {
      xfieldIndex = titles.indexOf(xField);
    }
    if (yField) {
      yfieldIndex = titles.indexOf(yField);
    }
    if (xfieldIndex < 0 && dataMetaInfo) {
      const idx = this._parseCoordinateIndex(dataMetaInfo.xIndex, titles.length);
      if (idx >= 0) {
        xfieldIndex = idx;
      }
    }
    if (yfieldIndex < 0 && dataMetaInfo) {
      const idx = this._parseCoordinateIndex(dataMetaInfo.yIndex, titles.length);
      if (idx >= 0) {
        yfieldIndex = idx;
      }
    }
    if (xfieldIndex < 0 || yfieldIndex < 0) {
      for (let i = 0, len = titles.length; i < len; i++) {
        if (xfieldIndex < 0 && isXField(titles[i])) {
          xfieldIndex = i;
        }
        if (yfieldIndex < 0 && isYField(titles[i])) {
          yfieldIndex = i;
        }
      }
    }
    return { xfieldIndex, yfieldIndex };
  }

  _parsePortalJsonContent(content) {
    if (content == null || typeof content === 'object') {
      return content;
    }
    if (typeof content !== 'string') {
      return content;
    }
    const text = content.trim();
    if (!text) {
      return content;
    }
    try {
      return JSON.parse(text);
    } catch {
      return content;
    }
  }

  _getDatafromContent(datasetUrl, queryInfo, dataMetaInfo) {
    this._normalizeAttributeFilter(queryInfo);
    let result = {};
    const contentUrl = Util.urlAppend(Util.urlPathAppend(datasetUrl, 'content.json'), 'pageSize=9999999&currentPage=1');
    // 获取图层数据
    FetchRequest.get(contentUrl, null, {
      withCredentials: this.withCredentials
    })
      .then(response => {
        return response.json();
      })
      .then(async data => {
        if (data.succeed === false) {
          // 请求失败
          this.triggerEvent('getdatafailed', {
            data
          });
          return;
        }
        if (data.type) {
          // content.json 不执行 attributeFilter，过滤在本地做，先确保 json-sql 就绪
          if (queryInfo.attributeFilter) {
            await ensureJsonSql();
          }
          let features;
          let type = 'FeatureCollection';
          let contentCrs;
          if (data.type === 'JSON' || data.type === 'GEOJSON') {
            data.content = this._parsePortalJsonContent(data.content);
            // 如果是json文件 data.content = {type:'fco', features},格式不固定
            if (!data.content?.features) {
              features = this._json2Feature(data.content);
            }
            features = this._formatGeoJSON(features || data.content);
            type = data.content?.type || type;
            contentCrs = data.content?.crs;
          } else if (data.type === 'EXCEL' || data.type === 'CSV') {
            const metaInfo = dataMetaInfo || (await this._fetchDataMetaInfo(datasetUrl));
            features = this._excelData2Feature(data.content, queryInfo, metaInfo);
          } else if (data.type === 'SHP') {
            data.content = this._parsePortalJsonContent(data.content);
            const layer = data.content?.layers?.[0];
            contentCrs = layer && layer.crs;
            features = this._formatGeoJSON(layer);
          }
          // content.json 不执行 attributeFilter：Excel/CSV 在构建要素时已按「过滤 → 截断」处理，
          // 其余类型在这里补本地兜底过滤，再按 maxFeatures 截断
          if (data.type !== 'EXCEL' && data.type !== 'CSV') {
            features = this._filterContentFeatures(features, queryInfo);
          }
          features = this._transformContentFeatures(features, contentCrs);
          result.features = {
            type,
            features
          };
          this.vertified && (result.vertified = this.vertified);
          this.iserverService._getFeaturesSucceed({ result });
        }
      })
      .catch(error => {
        console.log(error);
        this.triggerEvent('getdatafailed', {
          error
        });
      });
  }

  /**
   * content.json 数据源的本地兜底过滤 + 最大返回数截断（服务端不执行 attributeFilter）。
   * 条件不受支持时 filterFeaturesByAttributeFilter 会原样返回数据。
   */
  _filterContentFeatures(features, queryInfo = {}) {
    if (!Array.isArray(features) || !features.length) {
      return features;
    }
    const filtered = filterFeaturesByAttributeFilter(features, queryInfo.attributeFilter);
    const maxFeatures = Number(queryInfo.maxFeatures);
    return Number.isFinite(maxFeatures) && maxFeatures > 0 && filtered.length > maxFeatures
      ? filtered.slice(0, maxFeatures)
      : filtered;
  }

  _formatGeoJSON(data) {
    let features = data?.features;
    if (!Array.isArray(features)) {
      return [];
    }
    features.forEach((row, index) => {
      row.properties = row.properties || {};
      row.properties.index = index;
    });
    return features;
  }

  _excelData2Feature(dataContent, queryInfo = {}, dataMetaInfo) {
    let fieldCaptions = dataContent.colTitles;
    const { xfieldIndex, yfieldIndex } = this._resolveExcelXYFieldIndexes(fieldCaptions, dataMetaInfo);
    const predicate = createAttributeFilterPredicate(queryInfo.attributeFilter, fieldCaptions);
    const maxFeatures = Number(queryInfo.maxFeatures);
    const limit = Number.isFinite(maxFeatures) && maxFeatures > 0 ? maxFeatures : 0;

    // feature 构建后期支持坐标系 4326/3857
    let features = [];

    for (let i = 0; i < dataContent.rows.length; i++) {
      let row = dataContent.rows[i];

      let rawX = xfieldIndex !== -1 ? row[xfieldIndex] : undefined;
      let rawY = yfieldIndex !== -1 ? row[yfieldIndex] : undefined;
      let hasRawX = rawX !== null && rawX !== undefined && !(typeof rawX === 'string' && rawX.trim() === '');
      let hasRawY = rawY !== null && rawY !== undefined && !(typeof rawY === 'string' && rawY.trim() === '');
      let x = hasRawX ? Number(rawX) : NaN;
      let y = hasRawY ? Number(rawY) : NaN;
      // 属性信息
      let attributes = {};
      for (let index in dataContent.colTitles) {
        let key = dataContent.colTitles[index];
        attributes[key] = dataContent.rows[i][index];
      }
      // 过滤在前、截断在后，与 SQL 的 where -> limit 顺序一致
      if (predicate && !predicate(attributes)) {
        continue;
      }
      let feature = {
        type: 'Feature',
        properties: attributes
      };
      if (Number.isFinite(x) && Number.isFinite(y)) {
        attributes.index = i + '';
        feature.geometry = {
          type: 'Point',
          coordinates: [x, y]
        };
      }
      // 目前csv 只支持处理点，所以先生成点类型的 geojson
      features.push(feature);
      if (limit && features.length >= limit) {
        break;
      }
    }
    return features;
  }

  _json2Feature(dataContent) {
    let content = typeof dataContent === 'string' ? this._parsePortalJsonContent(dataContent) : dataContent;
    let features = [];
    if (content instanceof Array) {
      content.forEach(val => {
        if (val && (val.geometry || val.type === 'Feature')) {
          features.push({
            type: 'Feature',
            properties: val.properties || {},
            geometry: val.geometry || null
          });
        } else {
          features.push({ properties: val });
        }
      });
    } else if (content?.type === 'FeatureCollection' && Array.isArray(content.features)) {
      return content;
    } else if (content && (content.type === 'Feature' || content.geometry)) {
      features = [
        {
          type: 'Feature',
          properties: content.properties || {},
          geometry: content.geometry || null
        }
      ];
    } else if (content) {
      features = [{ properties: content }];
    }
    return { features };
  }

  // 从 GeoJSON crs 解析 EPSG 代码，如 CRS:84 / EPSG:4326
  _parseEpsgCodeFromCrs(crs) {
    const name = crs && crs.properties && crs.properties.name;
    if (!name) {
      return null;
    }
    const crsName = String(name).trim();
    // CRS:84 / OGC:1.3:CRS84 等价于 EPSG:4326（经度在前）
    if (/CRS:?84/i.test(crsName) || /OGC(?::|::)2(?::|::)84/i.test(crsName)) {
      return 4326;
    }
    const epsgMatch = crsName.match(/EPSG(?::|::)(\d+)/i);
    if (epsgMatch) {
      return parseInt(epsgMatch[1], 10);
    }
    return null;
  }

  // 转坐标系：优先使用 content 中的 crs，否则按坐标范围推断
  _transformContentFeatures(features, crs) {
    let transformedFeatures = features;
    if (features && !!features.length) {
      const epsgCode = this._parseEpsgCodeFromCrs(crs) || vertifyEpsgCode(features[0]);
      transformedFeatures = transformFeatures(epsgCode, features);
      this.vertified = true;
    }
    return transformedFeatures;
  }
}
