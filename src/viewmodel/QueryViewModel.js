import WidgetViewModel from "./WidgetViewModel";
import mapboxgl from '@libs/mapboxgl/mapbox-gl-enhance';
import "@libs/iclient-mapboxgl/iclient9-mapboxgl.min";
import iPortalDataParameter from "../view/commontypes/iPortalDataParameter";
import RestDataParameter from "../view/commontypes/RestDataParameter";
import RestMapParameter from "../view/commontypes/RestMapParameter";
import center from '@turf/center';

/**
 * @class QueryViewModel
 * @classdesc Query ViewModel
 * @param {Object} map - map 对象。
 * @param {Object} options - 可选参数。
 * @param {Object} options.circleStyle - 点样式。
 * @param {Object} options.lineStyle - 线样式。
 * @param {Object} options.fillStyle - 面样式。
 * @extends WidgetViewModel
 */
export default class QueryViewModel extends WidgetViewModel {
    constructor(map, options) {
        super();
        this.map = map;
        this.options = options || {};
        this.maxReturn = this.options.maxReturn || 200;
    }

    query(queryParameter, queryBounds) {
        this.strokeLayerID && this.map.removeLayer(this.strokeLayerID);
        this.layerID && this.map.removeLayer(this.layerID);
        this.layerID = queryParameter.name + new Date().getTime();

        this.queryBounds = queryBounds;
        if (queryBounds === 'currentMapBounds') {
            this.bounds = this.map.getBounds();
        }
        this.queryResult = null;
        if (queryParameter instanceof iPortalDataParameter) {
            this._queryByIportalData(queryParameter); 
        } else if (queryParameter instanceof RestDataParameter) {
            this._queryByRestData(queryParameter);
        } else if (queryParameter instanceof RestMapParameter) {
            this._queryByRestMap(queryParameter);
        }

    }

    _queryByRestMap(restMapParameter) {
        if (this.bounds) {
            let param = new SuperMap.QueryByBoundsParameters({
                queryParams: {
                    name: restMapParameter.layerName,
                    attributeFilter: restMapParameter.attributeFilter
                },
                bounds: this.bounds,
                startRecord: 0,
                expectCount: this.maxReturn
            });
            new mapboxgl.supermap.QueryService(restMapParameter.url).queryByBounds(param, (serviceResult) => {
                this._mapQuerySucceed(serviceResult, restMapParameter)
            })
        } else {
            let param = new SuperMap.QueryBySQLParameters({
                queryParams: {
                    name: restMapParameter.layerName,
                    attributeFilter: restMapParameter.attributeFilter
                },
                startRecord: 0,
                expectCount: this.maxReturn
            });
            new mapboxgl.supermap.QueryService(restMapParameter.url).queryBySQL(param, (serviceResult) => {
                this._mapQuerySucceed(serviceResult, restMapParameter)
            })
        }

    }
    _queryByRestData(restDataParameter) {
        if (this.bounds) {
            var boundsParam = new SuperMap.GetFeaturesByBoundsParameters({
                queryParameter: {
                    attributeFilter: restDataParameter.attributeFilter
                },
                datasetNames: restDataParameter.dataName,
                bounds: this.bounds,
                fromIndex: 0,
                toIndex: this.maxReturn - 1
            });
            new mapboxgl.supermap.FeatureService(restDataParameter.url).getFeaturesByBounds(boundsParam, (serviceResult) => {
                this._dataQuerySucceed(serviceResult, restDataParameter);
            });
        } else {
            let param = new SuperMap.GetFeaturesBySQLParameters({
                queryParameter: {
                    attributeFilter: restDataParameter.attributeFilter
                },
                datasetNames: restDataParameter.dataName,
                fromIndex: 0,
                toIndex: this.maxReturn - 1
            });
            new mapboxgl.supermap.FeatureService(restDataParameter.url).getFeaturesBySQL(param, serviceResult => {
                this._dataQuerySucceed(serviceResult, restDataParameter);
            })
        }
    }
    _mapQuerySucceed(serviceResult, restMapParameter) {
        if (serviceResult.result) {
            let resultFeatures = serviceResult.result.recordsets[0].features.features;
            resultFeatures.length > 0 && (this.queryResult = { name: restMapParameter.name, result: resultFeatures })
            this.addResultLayer(this.queryResult);
            this.fire('querysucceeded', { originalresult: serviceResult, result: this.queryResult })
        } else {
            this.fire('queryfailed')
        }
    }

    _dataQuerySucceed(serviceResult, restDataParameter) {
        if (serviceResult.result) {
            let resultFeatures = serviceResult.result.features.features;
            resultFeatures.length > 0 && (this.queryResult = { name: restDataParameter.name, result: resultFeatures })
            this.addResultLayer(this.queryResult);
            this.fire('querysucceeded', { result: this.queryResult })
        } else {
            this.fire('queryfailed')
        }
    }


    _queryByIportalData(iportalDataParameter) {
        let url = iportalDataParameter.url;
        let withCredentials = iportalDataParameter.withCredentials || false;
        SuperMap.FetchRequest.get(url, null, { withCredentials }).then(response => {
            return response.json();
        }).then(data => {
            if (data.succeed === false) {
                this.queryCount--;
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
                        this.fire('queryfailed')
                        console.log('此服务不支持查询！')
                        return;
                    }
                }, this);
                // 如果有服务，获取数据源和数据集, 然后请求rest服务
                this._getDatafromRest(resultData.serviceType, resultData.address, iportalDataParameter);
            } else {
                this.fire('queryfailed')
                console.log('此服务不支持查询！')
                return;
            }
        }).catch(error => {
            this.fire("searchfailed", { error });
            console.log(error);
        });

    }

    _getDatafromRest(serviceType, address, iportalDataParameter) {
        let withCredentials = iportalDataParameter.withCredentials || false;
        if (serviceType === 'RESTDATA') {
            let url = `${address}/data/datasources`;

            let sourceName, datasetName; // 请求获取数据源名
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
                    this._queryByRestData({ dataName: [sourceName + ':' + datasetName], url: `${address}/data`, name: iportalDataParameter.name, attributeFilter: iportalDataParameter.attributeFilter });
                }).catch((error) => {
                    this.fire('queryfailed')
                    console.log(error);
                })
            }).catch((error) => {
                this.fire('queryfailed')
                console.log(error);
            });
        } else {
            // 如果是地图服务
            let url = `${address}/maps`;
            let mapName, layerName, path; // 请求获取地图名
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
                    this._queryByRestMap({ layerName, url: path, name: iportalDataParameter.name, attributeFilter: iportalDataParameter.attributeFilter })
                    return layerName;
                }).catch((error) => {
                    this.fire('queryfailed')
                    console.log(error);
                })
            }).catch(error => {
                this.fire('queryfailed')
                console.log(error);
            });

        }
    }

    addResultLayer() {
        let type = this.queryResult.result[0].geometry.type
        let source = {
            'type': 'geojson',
            'data': {
                "type": "FeatureCollection",
                "features": this.queryResult.result
            }
        };
        this._addOverlayToMap(type, source, this.layerID);
    }
    getFilterFeature(filter) {
        let filterValue = filter.split("：")[1].trim();
        let features = this.queryResult.result;
        let feature;
        for (let i = 0; i < features.length; i++) {
            let propertiesValue = features[i].properties.SmID || features[i].properties.SMID;
            if (filterValue === propertiesValue) {
                feature = this.getFeatrueInfo(features[i]);
                break;
            }
        }
        this.map.flyTo({ center: feature.coordinates })
        return feature
    }
    getFeatrueInfo(feature) {
        let featureInfo = {}, coordinates;
        let geometry = feature.geometry;
        if (geometry.type === "MultiPolygon" || geometry.type === "Polygon" || geometry.type === 'LineString') {
            coordinates = center(feature).geometry.coordinates;
        } else {
            coordinates = geometry.coordinates
        }
        featureInfo.coordinates = coordinates;
        featureInfo.info = [];
        for (let key in feature.properties) {
            feature.properties[key] && featureInfo.info.push({ attribute: key, attributeValue: feature.properties[key] });
        }
        return featureInfo;
    }

    getPopupFeature() {
        this.map.on('click', this.layerID, (e) => {
            let feature = e.features[0];
            let featureInfo = this.getFeatrueInfo(feature);
            this.fire('getfeatureinfosucceeded', { featureInfo })
        })
    }
    addPopup(coordinates, el) {
        return new mapboxgl.Popup().setLngLat(coordinates).setHTML(el.innerHTML).addTo(this.map);
    }
    _addOverlayToMap(type, source, layerID) {
        let mbglStyle = {
            "circle": this.options.circleStyle || {
                'circle-color': '#409eff',
                'circle-opacity': 0.6,
                "circle-radius": 8,
                "circle-stroke-width": 2,
                "circle-stroke-color": '#409eff',
                "circle-stroke-opacity": 1
            },
            "line": this.options.lineStyle || {
                'line-width': 3,
                "line-color": '#409eff',
                "line-opacity": 1
            },
            "fill": this.options.fillStyle || {
                "fill-color": '#409eff',
                "fill-opacity": 0.6,
                "fill-outline-color": '#409eff'
            }
        }
        let mbglTypeMap = {
            "Point": 'circle',
            "LineString": "line",
            "Polygon": "fill",
            'MultiPolygon': 'fill'
        }
        type = mbglTypeMap[type];
        if (type === 'circle' || type === 'line' || type === 'fill') {
            this.map.addLayer({
                "id": layerID,
                "type": type,
                "source": source,
                "paint": mbglStyle[type]
            });
        }
        if (type === 'fill') {
            this.strokeLayerID = layerID + '-StrokeLine';
            let lineStyle = {
                'line-width': 3,
                "line-color": '#409eff',
                "line-opacity": 1
            }
            this.map.addLayer({
                "id": this.strokeLayerID,
                "type": 'line',
                "source": source,
                "paint": lineStyle
            });
        }
    }
}
export var dataServiceQueryViewModel = function (dataserviceUrl) {
    return new dataServiceQueryViewModel(dataserviceUrl);
};
