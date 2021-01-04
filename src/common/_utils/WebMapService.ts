import { Events } from '../_types/event/Events';
import { isXField, isYField, urlAppend } from './util';
import * as convert from 'xml-js';

const DEFAULT_WELLKNOWNSCALESET = [
  'GoogleCRS84Quad',
  'GoogleMapsCompatible',
  'urn:ogc:def:wkss:OGC:1.0:GoogleMapsCompatible',
  'urn:ogc:def:wkss:OGC:1.0:GoogleCRS84Quad'
];
const MB_SCALEDENOMINATOR_3857 = [
  '559082264.0287178',
  '279541132.0143589',
  '139770566.0071794',
  '69885283.00358972',
  '34942641.50179486',
  '17471320.75089743',
  '8735660.375448715',
  '4367830.1877224357',
  '2183915.093862179',
  '1091957.546931089',
  '545978.7734655447',
  '272989.3867327723',
  '136494.6933663862',
  '68247.34668319309',
  '34123.67334159654',
  '17061.83667079827',
  '8530.918335399136',
  '4265.459167699568',
  '2132.729583849784'
];
const MB_SCALEDENOMINATOR_4326 = [
  '5.590822640287176E8',
  '2.795411320143588E8',
  '1.397705660071794E8',
  '6.98852830035897E7',
  '3.494264150179485E7',
  '1.7471320750897426E7',
  '8735660.375448713',
  '4367830.187724357',
  '2183915.0938621783',
  '1091957.5469310891',
  '545978.7734655446',
  '272989.3867327723',
  '136494.69336638614',
  '68247.34668319307',
  '34123.673341596535',
  '17061.836670798268',
  '8530.918335399134'
];

interface webMapOptions {
  serverUrl?: string;
  accessToken?: string;
  accessKey?: string;
  tiandituKey?: string;
  withCredentials?: boolean;
  excludePortalProxyUrl?: boolean;
  proxy?: boolean | string;
  iportalServiceProxyUrlPrefix?: string;
}

export default class WebMapService extends Events {
  mapId: string | number;

  mapInfo: any;

  serverUrl: string;

  accessToken: string;

  accessKey: string;

  tiandituKey: string;

  withCredentials: boolean;

  target: string;

  excludePortalProxyUrl: boolean;

  isSuperMapOnline: boolean;

  proxy: boolean | string;

  iportalServiceProxyUrl: string;

  proxyOptions: object = {
    data: 'apps/viewer/getUrlResource.json?url=',
    image: 'apps/viewer/getUrlResource.png?url='
  };

  constructor(mapId: string | number | object, options: webMapOptions = {}) {
    super();
    if (typeof mapId === 'string' || typeof mapId === 'number') {
      this.mapId = mapId;
    } else if (mapId !== null && typeof mapId === 'object') {
      this.mapInfo = mapId;
    }
    this.serverUrl = options.serverUrl || 'https://www.supermapol.com';
    this.accessToken = options.accessToken;
    this.accessKey = options.accessKey;
    this.tiandituKey = options.tiandituKey || '';
    this.withCredentials = options.withCredentials || false;
    this.excludePortalProxyUrl = options.excludePortalProxyUrl;
    this.iportalServiceProxyUrl = options.iportalServiceProxyUrlPrefix;
    this.proxy = options.proxy;
  }

  public setMapId(mapId: string | number): void {
    this.mapId = mapId;
  }

  public setServerUrl(serverUrl: string): void {
    this.serverUrl = serverUrl;
  }

  public setWithCredentials(withCredentials) {
    this.withCredentials = withCredentials;
  }

  public setProxy(proxy) {
    this.proxy = proxy;
  }

  public handleServerUrl(serverUrl) {
    let urlArr: string[] = serverUrl.split('');
    if (urlArr[urlArr.length - 1] !== '/') {
      serverUrl += '/';
    }
    this.serverUrl = serverUrl;
    return serverUrl;
  }

  public getMapInfo() {
    if (!this.mapId && this.mapInfo) {
      return new Promise(resolve => {
        resolve(this.mapInfo);
      });
    }
    let mapUrl = this._handleMapUrl();
    return new Promise(async (resolve, reject) => {
      try {
        await this.getiPortalServiceProxy();
        SuperMap.FetchRequest.get(mapUrl, null, {
          withCredentials: this.withCredentials
        })
          .then(response => {
            return response.json();
          })
          .then(mapInfo => {
            if (mapInfo && mapInfo.succeed === false) {
              let error = { message: mapInfo && mapInfo.error && mapInfo.error.errorMsg };
              reject(error);
              return;
            }

            mapInfo.mapParams = {
              title: mapInfo.title,
              description: mapInfo.description
            };
            resolve(mapInfo);
          })
          .catch(error => {
            reject(error);
          });
      } catch (err) {
        reject(err);
      }
    });
  }
  public getiPortalServiceProxy() {
    return new Promise((resolve, reject) => {
      SuperMap.FetchRequest.get(`${this.serverUrl}web/config/portal.json`, { scope: ['serviceProxy'] })
        .then(response => {
          return response.json();
        })
        .then(serviceProxyInfo => {
          if (!serviceProxyInfo || !serviceProxyInfo.serviceProxy) {
            reject('serviceProxyFailed');
            return;
          }
          const serviceProxy = serviceProxyInfo.serviceProxy;
          if (serviceProxy.enable) {
            if (serviceProxy.proxyServerRootUrl) {
              this.iportalServiceProxyUrl = serviceProxy.proxyServerRootUrl;
            } else if (serviceProxy.port && serviceProxy.rootUrlPostfix) {
              this.iportalServiceProxyUrl = `${serviceProxy.port}/${serviceProxy.rootUrlPostfix}`;
            }
            if (this.serverUrl.indexOf(this.iportalServiceProxyUrl) > -1) {
              this.iportalServiceProxyUrl = '';
            }
          }
          resolve(serviceProxy);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
  public getLayerFeatures(type, layer, baseProjection?) {
    let pro;
    switch (type) {
      case 'hosted':
        //数据存储到iportal上了
        pro = this._getFeaturesFromHosted(layer, baseProjection);
        break;
      case 'rest_data':
        pro = this._getFeaturesFromRestData(layer, baseProjection);
        break;
      case 'rest_map':
        pro = this._getFeaturesFromRestMap(layer);
        break;
      case 'dataflow':
        pro = this._getFeaturesFromDataflow(layer);
        break;
      case 'user_data':
        pro = this._getFeaturesFromUserData(layer);
        break;
    }
    return pro;
  }
  public getWmsInfo(layerInfo, mapCRS) {
    return new Promise((resolve, reject) => {
      const proxy = this.handleProxy();
      const serviceUrl = `${layerInfo.url.split('?')[0]}?REQUEST=GetCapabilities&SERVICE=WMS`;
      SuperMap.FetchRequest.get(serviceUrl, null, {
        withCredentials: this.handleWithCredentials(proxy, layerInfo.url, false),
        withoutFormatSuffix: true,
        proxy
      })
        .then(response => {
          return response.text();
        })
        .then(capabilitiesText => {
          let converts = convert || window.convert;
          const capabilities = JSON.parse(
            converts.xml2json(capabilitiesText, {
              compact: true,
              spaces: 4
            })
          );
          const wmsCapabilities = capabilities.WMT_MS_Capabilities || capabilities.WMS_Capabilities;
          resolve({ version: wmsCapabilities['_attributes']['version'] });
        });
    });
  }
  public getWmtsInfo(layerInfo, mapCRS) {
    return new Promise((resolve, reject) => {
      let isMatched = false;
      let matchMaxZoom = 22;
      let style = '';
      let bounds;
      let restResourceURL = '';
      let kvpResourceUrl = '';
      const proxy = this.handleProxy();
      let serviceUrl = `${layerInfo.url.split('?')[0]}?REQUEST=GetCapabilities&SERVICE=WMTS&VERSION=1.0.0`;
      serviceUrl = this.handleParentRes(serviceUrl);
      SuperMap.FetchRequest.get(serviceUrl, null, {
        withCredentials: this.handleWithCredentials(proxy, layerInfo.url, false),
        withoutFormatSuffix: true,
        proxy
      })
        .then(response => {
          return response.text();
        })
        .then(capabilitiesText => {
          let converts = convert || window.convert;
          const capabilities = JSON.parse(
            converts.xml2json(capabilitiesText, {
              compact: true,
              spaces: 4
            })
          ).Capabilities;
          const content = capabilities.Contents;
          const metaData = capabilities['ows:OperationsMetadata'];
          if (metaData) {
            let operations = metaData['ows:Operation'];
            if (!Array.isArray(operations)) {
              operations = [operations];
            }
            const operation = operations.find(item => {
              return item._attributes.name === 'GetTile';
            });
            if (operation) {
              let getConstraints = operation['ows:DCP']['ows:HTTP']['ows:Get'];
              if (!Array.isArray(getConstraints)) {
                getConstraints = [getConstraints];
              }
              const getConstraint = getConstraints.find(item => {
                return item['ows:Constraint']['ows:AllowedValues']['ows:Value']['_text'] === 'KVP';
              });
              if (getConstraint) {
                kvpResourceUrl = getConstraint['_attributes']['xlink:href'];
              }
            }
          }
          let tileMatrixSet = content.TileMatrixSet;
          for (let i = 0; i < tileMatrixSet.length; i++) {
            if (
              tileMatrixSet[i]['ows:Identifier'] &&
              tileMatrixSet[i]['ows:Identifier']['_text'] === layerInfo.tileMatrixSet
            ) {
              if (
                tileMatrixSet[i]['WellKnownScaleSet'] &&
                DEFAULT_WELLKNOWNSCALESET.includes(tileMatrixSet[i]['WellKnownScaleSet']['_text'])
              ) {
                isMatched = true;
              } else {
                let matchedScaleDenominator = [];
                // 坐标系判断
                let defaultCRSScaleDenominators =
                  // @ts-ignore -------- crs 为 enhance 新加属性
                  mapCRS === 'EPSG:3857' ? MB_SCALEDENOMINATOR_3857 : MB_SCALEDENOMINATOR_4326;

                for (let j = 0, len = defaultCRSScaleDenominators.length; j < len; j++) {
                  if (!tileMatrixSet[i].TileMatrix[j]) {
                    break;
                  }
                  if (
                    parseFloat(defaultCRSScaleDenominators[j]) !==
                    parseFloat(tileMatrixSet[i].TileMatrix[j]['ScaleDenominator']['_text'])
                  ) {
                    break;
                  }
                  matchedScaleDenominator.push(defaultCRSScaleDenominators[j]);
                }
                matchMaxZoom = matchedScaleDenominator.length - 1;
                if (matchedScaleDenominator.length !== 0) {
                  isMatched = true;
                } else {
                  throw Error('TileMatrixSetNotSuppport');
                }
              }
              break;
            }
          }
          const layer = content.Layer.find(item => {
            return item['ows:Identifier']['_text'] === layerInfo.layer;
          });
          if (layer) {
            let styles = layer.Style;
            if (Array.isArray(layer.Style)) {
              style = styles[0]['ows:Identifier'] ? styles[0]['ows:Identifier']['_text'] : '';
            } else {
              style = styles['ows:Identifier'] ? styles['ows:Identifier']['_text'] : '';
            }
            if (layer['ows:WGS84BoundingBox']) {
              const lowerCorner = layer['ows:WGS84BoundingBox']['ows:LowerCorner']['_text'].split(' ');
              const upperCorner = layer['ows:WGS84BoundingBox']['ows:UpperCorner']['_text'].split(' ');
              bounds = [
                parseFloat(lowerCorner[0]),
                parseFloat(lowerCorner[1]),
                parseFloat(upperCorner[0]),
                parseFloat(upperCorner[1])
              ];
            }
            let resourceUrls = layer.ResourceURL;
            if (!Array.isArray(resourceUrls)) {
              resourceUrls = [resourceUrls];
            }
            const resourceUrl = resourceUrls.find(item => {
              return item._attributes.resourceType === 'tile';
            });
            if (resourceUrl) {
              restResourceURL = resourceUrl._attributes.template;
            }
          }
          resolve({ isMatched, matchMaxZoom, style, bounds, restResourceURL, kvpResourceUrl });
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  private _getFeaturesFromHosted(layer, baseProjection?) {
    let { dataSource, layerType } = layer;
    let serverId = dataSource ? dataSource.serverId : layer.serverId;

    if (!serverId) {
      return new Promise((resolve, reject) => {
        resolve({ type: 'noServerId' });
      });
    }
    let getDataFromIportal =
      layerType === 'MARKER' || (dataSource && (!dataSource.accessType || dataSource.accessType === 'DIRECT'));

    if (getDataFromIportal) {
      return this._getDataFromIportal(serverId, layer);
    } else {
      return this._getDataFromHosted({ layer, serverId, baseProjection });
    }
  }

  private _getFeaturesFromRestData(layer, baseProjection?) {
    //从restData获取数据
    let features;
    let dataSource = layer.dataSource;
    return new Promise((resolve, reject) => {
      this._getFeatureBySQL(
        dataSource.url,
        [dataSource.dataSourceName || layer.name],
        result => {
          features = this.parseGeoJsonData2Feature({
            allDatas: {
              features: result.result.features.features
            }
          });
          resolve({ type: 'feature', features });
        },
        err => {
          reject(err);
        },
        baseProjection
      );
    });
  }

  private _getFeaturesFromRestMap(layer) {
    return new Promise((resolve, reject) => {
      this._queryFeatureBySQL(
        layer.dataSource.url,
        layer.dataSource.layerName,
        result => {
          let recordsets = result && result.result.recordsets;
          let recordset = recordsets && recordsets[0];
          let attributes = recordset.fields;
          if (recordset && attributes) {
            let fileterAttrs: string[] = [];
            for (let i in attributes) {
              let value = attributes[i];
              if (value.indexOf('Sm') !== 0 || value === 'SmID') {
                fileterAttrs.push(value);
              }
            }
            this._getFeatures(
              fileterAttrs,
              layer,
              features => {
                resolve({ type: 'feature', features });
              },
              err => {
                reject(err);
              }
            );
          }
        },
        err => {
          reject(err);
        },
        'smid=1'
      );
    });
  }

  private _getFeaturesFromUserData(layer) {
    let dataSource = layer.dataSource;
    return new Promise((resolve, reject) => {
      const proxy = this.handleProxy();
      let serviceUrl = this.handleParentRes(dataSource.url);
      SuperMap.FetchRequest.get(serviceUrl, null, {
        withCredentials: this.handleWithCredentials(proxy, serviceUrl, this.withCredentials),
        proxy
      })
        .then(response => {
          return response.json();
        })
        .then(data => {
          let features;
          if (data && data instanceof Object && data.type === 'FeatureCollection') {
            features = data.features;
          } else {
            features = data;
          }
          features = this.parseGeoJsonData2Feature({
            allDatas: {
              features
            }
          });
          resolve({ type: 'feature', features });
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  private _queryFeatureBySQL(
    url: string,
    layerName: string,
    processCompleted: Function,
    processFaild: Function,
    attributeFilter?: string,
    fields?: Array<string>,
    epsgCode?: string,
    startRecord?,
    recordLength?,
    onlyAttribute?
  ): void {
    let queryBySQLParams = this._getQueryFeaturesParam(
      layerName,
      attributeFilter,
      fields,
      epsgCode,
      startRecord,
      recordLength,
      onlyAttribute
    );
    const proxy = this.handleProxy();
    let serviceUrl = this.handleParentRes(url);
    // @ts-ignore
    let queryBySQLService = new SuperMap.QueryBySQLService(serviceUrl, {
      proxy,
      withCredentials: this.handleWithCredentials(proxy, url, false),
      eventListeners: {
        processCompleted: data => {
          processCompleted && processCompleted(data);
        },
        processFailed: data => {
          processFaild && processFaild(data);
        }
      }
    });
    queryBySQLService.processAsync(queryBySQLParams);
  }

  private _getFeatures(fields: string[], layerInfo: any, resolve: Function, reject: Function): void {
    let source = layerInfo.dataSource;
    // 示例数据
    this._queryFeatureBySQL(
      source.url,
      source.layerName,
      result => {
        let recordsets = result.result.recordsets[0];
        let features = recordsets.features.features;

        let featuresObj = this.parseGeoJsonData2Feature({
          allDatas: { features }
        });
        resolve(featuresObj);
      },
      err => {
        reject(err);
      },
      null,
      fields
    );
  }

  private _getQueryFeaturesParam(
    layerName: string,
    attributeFilter?: string,
    fields?: Array<string>,
    epsgCode?: string,
    startRecord?,
    recordLength?,
    onlyAttribute?
  ) {
    let queryParam = new SuperMap.FilterParameter({
      name: layerName,
      attributeFilter: attributeFilter
    });

    if (fields) {
      queryParam.fields = fields;
    }

    let params: any = {
      queryParams: [queryParam]
    };

    if (onlyAttribute) {
      params.queryOption = SuperMap.QueryOption.ATTRIBUTE;
    }

    startRecord && (params.startRecord = startRecord);
    recordLength && (params.expectCount = recordLength);

    if (epsgCode) {
      params.prjCoordSys = {
        epsgCode: epsgCode
      };
    }

    let queryBySQLParams = new SuperMap.QueryBySQLParameters(params);

    return queryBySQLParams;
  }

  private _getFeaturesFromDataflow(layer) {
    return new Promise((resolve, reject) => {
      this._getDataflowInfo(
        layer,
        () => {
          resolve({ type: 'dataflow' });
        },
        e => {
          reject(e);
        }
      );
    });
  }

  private _getDataflowInfo(layerInfo, success, faild?) {
    let url = layerInfo.url,
      token;
    let requestUrl = `${url}.json`;
    if (layerInfo.credential && layerInfo.credential.token) {
      token = layerInfo.credential.token;
      requestUrl += `?token=${token}`;
    }
    const proxy = this.handleProxy();
    requestUrl = this.handleParentRes(requestUrl);
    SuperMap.FetchRequest.get(requestUrl, null, {
      proxy,
      withCredentials: this.handleWithCredentials(proxy, requestUrl, false)
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        if (!result) {
          faild();
          return;
        }
        if (result.featureMetaData) {
          layerInfo.featureType = result.featureMetaData.featureType.toUpperCase();
          layerInfo.dataSource = { dataTypes: {} };
          if (result.featureMetaData.fieldInfos && result.featureMetaData.fieldInfos.length > 0) {
            result.featureMetaData.fieldInfos.forEach(function (data) {
              let name = data.name.trim();
              if (data.type === 'TEXT') {
                layerInfo.dataSource.dataTypes[name] = 'STRING';
              } else if (['DOUBLE', 'INT', 'FLOAT', 'LONG', 'SHORT'].includes(data.type)) {
                layerInfo.dataSource.dataTypes[name] = 'NUMBER';
              } else {
                layerInfo.dataSource.dataTypes[name] = 'UNKNOWN';
              }
            });
          }
        }
        layerInfo.wsUrl = result.urls[0].url;
        layerInfo.name = result.urls[0].url.split('iserver/services/')[1].split('/dataflow')[0];
        success();
      })
      .catch(function () {
        faild();
      });
  }

  public getDatasourceType(layer) {
    let { dataSource, layerType } = layer;
    if (dataSource && dataSource.type === 'SAMPLE_DATA') {
      return dataSource.type;
    }
    let type;
    let isHosted = (dataSource && dataSource.serverId) || layerType === 'MARKER' || layerType === 'HOSTED_TILE';
    let isTile =
      layerType === 'SUPERMAP_REST' ||
      layerType === 'TILE' ||
      layerType === 'WMS' ||
      layerType === 'WMTS' ||
      layerType === 'MAPBOXSTYLE';
    if (isHosted) {
      type = 'hosted';
    } else if (isTile) {
      type = 'tile';
    } else if (dataSource && dataSource.type === 'REST_DATA') {
      type = 'rest_data';
    } else if (dataSource && dataSource.type === 'REST_MAP' && dataSource.url) {
      type = 'rest_map';
    } else if (layerType === 'DATAFLOW_POINT_TRACK' || layerType === 'DATAFLOW_HEAT') {
      type = 'dataflow';
    } else if (dataSource && dataSource.type === 'USER_DATA') {
      type = 'user_data';
    }
    return type;
  }

  public getFeatureProperties(features) {
    let properties = [];
    if (features && features.length) {
      features.forEach(feature => {
        let property = feature.properties;
        property && properties.push(property);
      });
    }
    return properties;
  }

  public parseGeoJsonData2Feature(metaData: any) {
    let allFeatures = metaData.allDatas.features;
    let features = [];
    for (let i = 0, len = allFeatures.length; i < len; i++) {
      let feature = allFeatures[i];
      let coordinate = feature.geometry.coordinates;
      if (allFeatures[i].geometry.type === 'Point') {
        // 标注图层 还没有属性值时候不加
        if (allFeatures[i].properties) {
          allFeatures[i].properties.lon = coordinate[0];
          allFeatures[i].properties.lat = coordinate[1];
        }
      }
      feature.properties['index'] = i + '';
      features.push(feature);
    }
    return features;
  }

  private _getDataFromIportal(serverId, layerInfo) {
    let features;
    //原来二进制文件
    let url = `${this.serverUrl}web/datas/${serverId}/content.json?pageSize=9999999&currentPage=1`;
    if (this.accessToken) {
      url = `${url}&${this.accessKey}=${this.accessToken}`;
    }
    return new Promise((resolve, reject) => {
      url = this.handleParentRes(url);
      const proxy = this.handleProxy();
      SuperMap.FetchRequest.get(url, null, {
        withCredentials: this.handleWithCredentials(proxy, url, this.withCredentials),
        proxy
      })
        .then(response => {
          return response.json();
        })
        .then(async data => {
          if (data.succeed === false) {
            reject(data.error);
          }
          if (data && data.type) {
            if (data.type === 'JSON' || data.type === 'GEOJSON') {
              data.content = JSON.parse(data.content.trim());
              features = this._formatGeoJSON(data.content);
            } else if (data.type === 'EXCEL' || data.type === 'CSV') {
              if (layerInfo.dataSource && layerInfo.dataSource.administrativeInfo) {
                //行政规划信息
                data.content.rows.unshift(data.content.colTitles);
                const { divisionType, divisionField } = layerInfo.dataSource.administrativeInfo;
                const geojson = await this._excelData2FeatureByDivision(data.content, divisionType, divisionField);
                features = this._formatGeoJSON(geojson);
              } else {
                features = this._excelData2Feature(data.content, (layerInfo && layerInfo.xyField) || {});
              }
            }
            resolve({ type: 'feature', features });
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  private _getDataFromHosted({ layer, serverId, baseProjection }) {
    //关系型文件
    let isMapService = layer.layerType === 'HOSTED_TILE';
    return new Promise((resolve, reject) => {
      this._checkUploadToRelationship(serverId)
        .then(result => {
          if (result && result.length > 0) {
            let datasetName = result[0].name,
              featureType = result[0].type.toUpperCase();
            this._getDataService(serverId, datasetName).then(data => {
              let dataItemServices = data.dataItemServices;
              if (dataItemServices.length === 0) {
                reject('noDataServices');
              }
              let param = { layer, dataItemServices, datasetName, featureType, resolve, reject, baseProjection };
              if (isMapService) {
                let dataService = dataItemServices.filter(info => {
                  return info && info.serviceType === 'RESTDATA';
                })[0];
                this._isMvt(dataService.address, datasetName, baseProjection)
                  .then(info => {
                    this._getServiceInfoFromLayer(param, info);
                  })
                  .catch(() => {
                    //判断失败就走之前逻辑，>数据量用tile
                    this._getServiceInfoFromLayer(param);
                  });
              } else {
                this._getServiceInfoFromLayer(param);
              }
            });
          } else {
            reject('resultIsEmpty');
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  private _isMvt(serviceUrl, datasetName, baseProjection) {
    return this._getDatasetsInfo(serviceUrl, datasetName).then(info => {
      //判断是否和底图坐标系一直
      if (info.epsgCode == baseProjection.split('EPSG:')[1]) {
        return SuperMap.FetchRequest.get(`${info.url}/tilefeature.mvt`)
          .then(function (response) {
            return response.json();
          })
          .then(function (result) {
            info.isMvt = result.error && result.error.code === 400;
            return info;
          })
          .catch(() => {
            return info;
          });
      }
      return info;
    });
  }

  private _getServiceInfoFromLayer(
    { layer, dataItemServices, datasetName, featureType, resolve, reject, baseProjection },
    info?: any
  ) {
    let isMapService = info ? !info.isMvt : layer.layerType === 'HOSTED_TILE',
      isAdded = false;
    dataItemServices.forEach((service, index) => {
      if (isAdded) {
        return;
      }
      //有服务了，就不需要循环
      if (service && isMapService && service.serviceType === 'RESTMAP') {
        isAdded = true;
        //地图服务,判断使用mvt还是tile
        this._getTileLayerInfo(service.address, baseProjection).then(restMaps => {
          resolve({ type: 'restMap', restMaps });
        });
      } // TODO 对接 MVT
      else if (service && !isMapService && service.serviceType === 'RESTDATA') {
        if (info && info.isMvt) {
          // this._addVectorLayer(info, layer, featureType);
          resolve({ type: 'mvt', info, featureType });
        } else {
          //数据服务
          isAdded = true;
          //关系型文件发布的数据服务
          this._getDatasources(service.address).then(
            datasourceName => {
              layer.dataSource.dataSourceName = datasourceName + ':' + datasetName;
              layer.dataSource.url = `${service.address}/data`;
              this._getFeatureBySQL(
                layer.dataSource.url,
                [layer.dataSource.dataSourceName || layer.name],
                result => {
                  let features = this.parseGeoJsonData2Feature({
                    allDatas: {
                      features: result.result.features.features
                    }
                  });
                  resolve({ type: 'feature', features });
                },
                err => {
                  reject(err);
                }
              );
            },
            err => {
              reject(err);
            }
          );
        }
      }
    }, this);
    if (!isAdded) {
      //循环完成了，也没有找到合适的服务。有可能服务被删除
      reject('noService');
    }
  }

  private _getDatasetsInfo(serviceUrl, datasetName) {
    return this._getDatasources(serviceUrl).then(datasourceName => {
      //判断mvt服务是否可用
      let url = `${serviceUrl}/data/datasources/${datasourceName}/datasets/${datasetName}`;
      const proxy = this.handleProxy();
      url = this.handleParentRes(url);
      return SuperMap.FetchRequest.get(url, null, {
        withCredentials: this.handleWithCredentials(proxy, url, false),
        proxy
      })
        .then(response => {
          return response.json();
        })
        .then(datasetsInfo => {
          return {
            epsgCode: datasetsInfo.datasetInfo.prjCoordSys.epsgCode,
            bounds: datasetsInfo.datasetInfo.bounds,
            datasourceName,
            datasetName,
            url //返回的是原始url，没有代理。因为用于请求mvt
          };
        });
    });
  }

  private _getDatasources(url) {
    const proxy = this.handleProxy();
    let serviceUrl = `${url}/data/datasources.json`;
    serviceUrl = this.handleParentRes(serviceUrl);
    return SuperMap.FetchRequest.get(serviceUrl, null, {
      withCredentials: this.handleWithCredentials(proxy, serviceUrl, false),
      proxy
    })
      .then(response => {
        return response.json();
      })
      .then(datasource => {
        if (datasource.code === 401) {
          throw Error(datasource.errorMsg);
        }
        let datasourceNames = datasource.datasourceNames;
        return datasourceNames[0];
      });
  }

  private _getDataService(fileId, datasetName) {
    const proxy = this.handleProxy();
    let serviceUrl = `${this.serverUrl}web/datas/${fileId}.json`;
    serviceUrl = this.handleParentRes(serviceUrl);
    return SuperMap.FetchRequest.get(serviceUrl, null, {
      withCredentials: this.handleWithCredentials(proxy, serviceUrl, this.withCredentials),
      proxy
    })
      .then(response => {
        return response.json();
      })
      .then(result => {
        result.fileId = fileId;
        result.datasetName = datasetName;
        return result;
      });
  }

  private _checkUploadToRelationship(fileId) {
    const proxy = this.handleProxy();
    let serviceUrl = `${this.serverUrl}web/datas/${fileId}/datasets.json`;
    serviceUrl = this.handleParentRes(serviceUrl);
    return SuperMap.FetchRequest.get(serviceUrl, null, {
      withCredentials: this.handleWithCredentials(proxy, serviceUrl, this.withCredentials),
      proxy
    })
      .then(response => {
        return response.json();
      })
      .then(result => {
        return result;
      });
  }

  private _handleMapUrl() {
    let mapUrl = this.serverUrl + 'web/maps/' + this.mapId + '/map';
    if (this.accessToken || this.accessKey) {
      mapUrl += '?' + (this.accessToken && !this.accessKey) ? 'token=' + this.accessToken : 'key=' + this.accessKey;
    }
    let filter = 'getUrlResource.json?url=';
    if (this.excludePortalProxyUrl && this.serverUrl.indexOf(filter) > -1) {
      // 大屏需求,或者有加上代理的
      let urlArray = this.serverUrl.split(filter);
      if (urlArray.length > 1) {
        mapUrl = urlArray[0] + filter + this.serverUrl + 'web/maps/' + this.mapId + '/map.json';
      }
    }
    mapUrl = mapUrl.indexOf('.json') === -1 ? `${mapUrl}.json` : mapUrl;
    return mapUrl;
  }

  public handleProxy(type?: string): string {
    if (!this.proxy) {
      return null;
    }
    const proxySuffix: string = this.proxyOptions[type || 'data'];
    let proxy: string = this.serverUrl + proxySuffix;
    if (typeof this.proxy === 'string') {
      proxy = this.proxy;
    }
    return proxy;
  }
  public handleWithCredentials(proxyUrl?: string, serviceUrl?: string, defaultValue = this.withCredentials): boolean {
    if (proxyUrl && proxyUrl.startsWith(this.serverUrl) && (!serviceUrl || serviceUrl.startsWith(proxyUrl))) {
      return true;
    }
    if (serviceUrl && this.iportalServiceProxyUrl && serviceUrl.indexOf(this.iportalServiceProxyUrl) >= 0) {
      return true;
    }

    return defaultValue;
  }
  public isIportalResourceUrl(serviceUrl) {
    return (
      serviceUrl.startsWith(this.serverUrl) ||
      (this.iportalServiceProxyUrl && serviceUrl.indexOf(this.iportalServiceProxyUrl) >= 0)
    );
  }
  public handleParentRes(url, parentResId = this.mapId, parentResType = 'MAP'): string {
    if (!this.isIportalResourceUrl(url)) {
      return url;
    }
    return urlAppend(url, `parentResType=${parentResType}&parentResId=${parentResId}`);
  }
  private _formatGeoJSON(data): any {
    let features = data.features;
    features.forEach((row, index) => {
      row.properties['index'] = index;
    });
    return features;
  }

  private _excelData2Feature(dataContent: any, xyField: any = {}): any {
    let fieldCaptions = dataContent.colTitles;
    // 位置属性处理
    let xfieldIndex = fieldCaptions.indexOf(xyField.xField);
    let yfieldIndex = fieldCaptions.indexOf(xyField.yField);
    if (yfieldIndex < 0 || xfieldIndex < 0) {
      for (let i = 0, len = fieldCaptions.length; i < len; i++) {
        if (isXField(fieldCaptions[i])) {
          xfieldIndex = i;
        }
        if (isYField(fieldCaptions[i])) {
          yfieldIndex = i;
        }
      }
    }

    // feature 构建后期支持坐标系 4326/3857
    let features = [];

    for (let i = 0, len = dataContent.rows.length; i < len; i++) {
      let row = dataContent.rows[i];

      let x = Number(row[xfieldIndex]);
      let y = Number(row[yfieldIndex]);

      // 属性信息
      let attributes = {};
      for (let index = 0; index < dataContent.colTitles.length; index++) {
        const element = dataContent.colTitles[index].trim();
        attributes[element] = dataContent.rows[i][index];
      }
      attributes['index'] = i + '';
      // 目前csv 只支持处理点，所以先生成点类型的 geojson
      let feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [x, y]
        },
        properties: attributes
      };
      features.push(feature);
    }
    return features;
  }
  private _excelData2FeatureByDivision(content: any, divisionType: string, divisionField: string): Promise<object> {
    const dataName = ['城市', 'City'].includes(divisionType) ? 'MunicipalData' : 'ProvinceData';
    if (window[dataName] && window[dataName].features) {
      return new Promise(resolve => {
        resolve(this._combineFeature(content, window[dataName], divisionField));
      });
    }
    const dataFileName = ['城市', 'City'].includes(divisionType) ? 'MunicipalData.js' : 'ProvincialData.js';
    const proxy = this.handleProxy();
    const dataUrl = `${this.serverUrl}apps/dataviz/libs/administrative_data/${dataFileName}`;
    return SuperMap.FetchRequest.get(dataUrl, null, {
      withCredentials: false,
      proxy,
      withoutFormatSuffix: true
    })
      .then(response => {
        return response.text();
      })
      .then(result => {
        new Function(result)();
        return this._combineFeature(content, window[dataName], divisionField);
      });
  }
  private _combineFeature(
    properties: any,
    geoData: GeoJSON.FeatureCollection,
    divisionField: string
  ): GeoJSON.FeatureCollection {
    let geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: []
    };
    if (properties.length < 2) {
      return geojson;
    } //只有一行数据时为标题
    let titles = properties.colTitles,
      rows = properties.rows,
      fieldIndex = titles.findIndex(title => title === divisionField);

    rows.forEach(row => {
      let feature = geoData.features.find((item, index) => {
        return this._isMatchAdministrativeName(item.properties.Name, row[fieldIndex]);
      });
      //todo 需提示忽略无效数据
      if (feature) {
        const combineFeature: GeoJSON.Feature = { properties: {}, geometry: feature.geometry, type: 'Feature' };
        row.forEach((item, idx) => {
          combineFeature.properties[titles[idx]] = item;
        });
        geojson.features.push(combineFeature);
      }
    });
    return geojson;
  }
  /**
   * @description 行政区划原始数据和当前数据是否匹配
   */
  private _isMatchAdministrativeName(featureName: string, fieldName: string): boolean {
    if (featureName && typeof fieldName === 'string' && fieldName.constructor === String) {
      let shortName = featureName.substr(0, 2);
      // 张家口市和张家界市
      if (shortName === '张家') {
        shortName = featureName.substr(0, 3);
      }
      // 阿拉善盟 阿拉尔市
      if (shortName === '阿拉') {
        shortName = featureName.substr(0, 3);
      }
      return !!fieldName.startsWith(shortName);
    }
    return false;
  }

  private _getTileLayerInfo(url, baseProjection) {
    const proxy = this.handleProxy();
    let epsgCode = baseProjection.split('EPSG:')[1];
    let serviceUrl = `${url}/maps.json`;
    serviceUrl = this.handleParentRes(serviceUrl);
    return SuperMap.FetchRequest.get(serviceUrl, null, {
      withCredentials: this.handleWithCredentials(proxy, serviceUrl, this.withCredentials),
      proxy
    })
      .then(response => {
        return response.json();
      })
      .then(mapInfo => {
        let promises = [];
        if (mapInfo) {
          mapInfo.forEach(info => {
            let promise = SuperMap.FetchRequest.get(
              `${info.path}.json?prjCoordSys=${JSON.stringify({ epsgCode: epsgCode })}`,
              null,
              {
                withCredentials: this.withCredentials,
                proxy
              }
            )
              .then(response => {
                return response.json();
              })
              .then(restMapInfo => {
                restMapInfo.url = info.path;
                return restMapInfo;
              });
            promises.push(promise);
          });
        }
        return Promise.all(promises).then(allRestMaps => {
          return allRestMaps;
        });
      });
  }

  private _getFeatureBySQL(
    url: string,
    datasetNames: Array<string>,
    processCompleted: Function,
    processFaild: Function,
    baseProjection?
  ): void {
    let getFeatureParam, getFeatureBySQLService, getFeatureBySQLParams;
    getFeatureParam = new SuperMap.FilterParameter({
      name: datasetNames.join().replace(':', '@'),
      attributeFilter: null
    });
    getFeatureBySQLParams = new SuperMap.GetFeaturesBySQLParameters({
      queryParameter: getFeatureParam,
      datasetNames: datasetNames,
      fromIndex: 0,
      toIndex: -1,
      maxFeatures: -1,
      returnContent: true
    });
    if (baseProjection) {
      if (baseProjection === 'EPSG:3857') {
        getFeatureBySQLParams.targetEpsgCode = 4326;
      } else {
        getFeatureBySQLParams.targetEpsgCode = +baseProjection.split(':')[1];
      }
    }
    const proxy = this.handleProxy();
    let options = {
      proxy,
      withCredentials: this.handleWithCredentials(proxy, url, false),
      eventListeners: {
        processCompleted: getFeaturesEventArgs => {
          processCompleted && processCompleted(getFeaturesEventArgs);
        },
        processFailed: e => {
          processFaild && processFaild(e);
        }
      }
    };
    const serviceUrl = this.handleParentRes(url);
    getFeatureBySQLService = new SuperMap.GetFeaturesBySQLService(serviceUrl, options);
    getFeatureBySQLService.processAsync(getFeatureBySQLParams);
  }

  public async getEpsgCodeInfo(epsgCode, iPortalUrl) {
    const url = iPortalUrl.slice(-1) === '/' ? iPortalUrl : `${iPortalUrl}/`;
    let codeUrl = `${url}epsgcodes/${epsgCode}.json`;
    const wkt = await SuperMap.FetchRequest.get(codeUrl, null)
      .then(response => {
        return response.json();
      })
      .then(epsgcodeInfo => {
        return epsgcodeInfo.wkt;
      })
      .catch(err => {
        console.error(err);
        return undefined;
      });
    return wkt;
  }
}
