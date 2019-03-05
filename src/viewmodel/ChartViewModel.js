
import echarts from "echarts";
import WidgetViewModel from './WidgetViewModel';
import '@libs/iclient-mapboxgl/iclient9-mapboxgl-es6';

/**
 * @class ChartViewModel
 * @classdesc 图表微件功能类
 * @param {string} chartContainer - 图表 DOM 元素。
 * @param {Object} options - 可选参数。
 * @param {string} options.type - 图表类型。
 * @param {SuperMap.Widgets.Chart.Datasets} options.datasets - 数据来源。
 * @param {Array.<Object>} options.chartOptions - 图表可选参数。
 * @param {Array.<Object>} options.chartOptions.xAxis - 图表X轴。
 * @param {string} options.chartOptions.xAxis.field - 图表X轴字段名。
 * @param {string} options.chartOptions.xAxis.name - 图表X轴名称。
 * @param {Array.<Object>} options.chartOptions.yAxis - 图表Y轴。
 * @param {string} options.chartOptions.yAxis.field - 图表Y轴字段名。
 * @param {string} options.chartOptions.yAxis.name - 图表Y轴名称。
 * @fires ChartViewModel#getdatafailed
 */

export class ChartViewModel extends WidgetViewModel {

    constructor(chartContainer, options) {
        super();
        options = options || {};
        options.datasets.type = options.datasets.type || 'iServer';
        options.datasets.withCredentials = options.datasets.withCredentials || false;
        this.chartContainer = chartContainer;
        this.chartType = options.type || "bar";
        this.datasets = options.datasets;
        this.xField = [];
        this.yField = [];
        this.grid = {
            top: "50px",
            bottom: "50px",
            left: "50px",
            right: "60px"
        };
        this.chartType = options.type || "bar";
        this._initXYField(options.chartOptions);
        this._initChart();
    }

    changeType(type) {
        if (type !== this.chartType) {
            this.chartType = type;
            let newOptions = this._updateChartOptions(this.chartType);
            this._updateChart(newOptions);
        }
    }

    updateData(datasets, chartOption) {
        this.xField = [];
        this.yField = [];
        this._initXYField(chartOption);
        // type的设置默认值
        datasets.type = datasets.type || 'iServer';
        // withCredentials的设置默认值
        datasets.withCredentials = datasets.withCredentials || false;
        this.datasets = datasets;
        this.succeedCb = this._updateDataSuccess;
        this._getDatasetInfo();
    }


    _initXYField(chartOptions) {
        if (chartOptions && chartOptions.length > 0) {
            chartOptions.forEach(function (option) {
                if (option.xAxis) {
                    this.xField.push({
                        field: option.xAxis.field,
                        name: option.xAxis.name
                    });
                }
                if (option.yAxis) {
                    this.yField.push({
                        field: option.yAxis.field,
                        name: option.yAxis.name
                    });
                }
            }, this);
        }
    }

    _initChart() {
        this.succeedCb = this._createChart;
        this._getDatasetInfo();
    }

    _getDatasetInfo() {
        if (this.datasets && this._checkUrl(this.datasets.url)) {
            if (this.datasets.type === 'iServer') {
                this._getDatasetInfoByIserver();
            } else if (this.datasets.type === 'iPortal') {
                this._getDataInfoByIptl();
            }
        }
    }

    _getDatasetInfoByIserver() {
        SuperMap.FetchRequest.get(this.datasets.url).then((response) => {
            return response.json();
        }).then((results) => {
            if (results.datasetInfo) {
                let datasetInfo = results.datasetInfo;
                this.datasetInfo = {
                    dataSourceName: datasetInfo.dataSourceName,
                    datasetName: datasetInfo.name,
                    mapName: results.name
                };
                this.datasetInfo && this._getDatasetInfoSuccess();
            }
        }).catch((error) => {
            console.log(error);
            this.fire('getchartdatafailed', { error });
        });
    }

    _getDataInfoByIptl() {
        let datasetUrl = this.datasets.url;
        SuperMap.FetchRequest.get(datasetUrl, null, {
            withCredentials: this.datasets.withCredentials
        }).then(response => {
            return response.json()
        }).then(data => {
            if (data.succeed === false) {
                //请求失败
                this.fire('getchartdatafailed', { data });
                return;
            }
            // 是否有rest服务
            if (data.dataItemServices && data.dataItemServices.length > 0) {
                let dataItemServices = data.dataItemServices, resultData;
                dataItemServices.forEach(item => {
                    if (item.serviceType === 'RESTDATA' && item.serviceStatus === 'PUBLISHED') {
                        resultData = item;
                    } else if (item.serviceType === 'RESTMAP' && item.serviceStatus === 'PUBLISHED') {
                        resultData = item;
                    } else {
                        this._getDatafromContent(datasetUrl);
                        return;
                    }
                }, this)
                // 如果有服务，获取数据源和数据集, 然后请求rest服务
                this._getDatafromRest(resultData.serviceType, resultData.address);
            } else {
                this._getDatafromContent(datasetUrl);
                return;
            }
        }).catch(error => {
            console.log(error);
            this.fire('getchartdatafailed', { error });
        })
    }

    _getDatafromRest(serviceType, address) {
        let withCredentials = this.datasets.withCredentials;
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
                    this._getDatafromRestData(`${address}/data`, [sourceName + ':' + datasetName]);
                }).catch((error) => {
                    console.log(error);
                    this.fire('getchartdatafailed', { error });
                })
            }).catch((error) => {
                console.log(error);
                this.fire('getchartdatafailed', { error });
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
                SuperMap.FetchRequest.get(url, null, {
                    withCredentials
                }).then(response => {
                    return response.json()
                }).then(data => {
                    layerName = data[0].subLayers.layers[0].caption;
                    // 请求restmap服务
                    this._getDatafromRestMap(layerName, path)
                    return layerName;
                }).catch((error) => {
                    console.log(error);
                    this.fire('getchartdatafailed', { error });
                })
            }).catch((error) => {
                console.log(error);
                this.fire('getchartdatafailed', { error });
            });

        }
    }
    _getDatafromRestMap(dataSource, path) {
        this.datasets.queryInfo.attributeFilter = this.datasets.queryInfo.attributeFilter || 'smid=1';
        this._queryFeatureBySQL(path, dataSource, this.datasets.queryInfo, null, null, (result) => {
            this._getDataInfoSuccess(result, 'RESTMAP');
        }, (error) => {
            console.log(error);
            this.fire('getchartdatafailed', { error });
        })
    }

    _getDatafromRestData(url, dataSource) {
        this.datasets.queryInfo.attributeFilter = this.datasets.queryInfo.attributeFilter || 'SmID>0';
        this._getFeatureBySQL(url, dataSource, this.datasets.queryInfo, (result) => {
            // 此时的features已经处理成geojson了
            this._getDataInfoSuccess(result, 'RESTDATA');
        }, (error) => {
            console.log(error);
            this.fire('getchartdatafailed', { error });
        });
    }

    _getDatafromContent(datasetUrl) {
        let result = {};
        datasetUrl += '/content.json?pageSize=9999999&currentPage=1';
        // 获取图层数据
        SuperMap.FetchRequest.get(datasetUrl, null, {
            withCredentials: this.datasets.withCredentials
        }).then(response => {
            return response.json()
        }).then(data => {
            if (data.succeed === false) {
                //请求失败
                this.fire('getchartdatafailed', { data });
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
                    let features = this._formatGeoJSON(data.content);
                    result.features = { type: data.content.type, features };
                } else if (data.type === 'EXCEL' || data.type === 'CSV') {
                    let features = this._excelData2Feature(data.content);
                    result.features = {
                        type: 'FeatureCollection',
                        features
                    };
                }
                this._getDataInfoSuccess(result, 'content');
            }
        }).catch(error => {
            console.log(error);
            this.fire('getchartdatafailed', { error });
        });
    }
    _getDataInfoSuccess(results, type) {
        if (type === 'RESTMAP') {
            this._getChartDatasFromLayer(results);
        } else {
            this._getChartDatas(results);
        }
    }
    _getDatasetInfoSuccess() {
        let datasetUrl = this.datasets.url;
        //判断服务为地图服务 或者 数据服务
        let restIndex = datasetUrl.indexOf("rest");
        if (restIndex > 0) {
            let index = datasetUrl.indexOf("/", restIndex + 5);
            let type = datasetUrl.substring(restIndex + 5, index);
            let dataUrl = datasetUrl.substring(0, restIndex + 4) + "/data";
            if (type === "maps") {
                let mapIndex = datasetUrl.indexOf("/", index + 1);
                let mapName = datasetUrl.substring(index + 1, mapIndex);
                dataUrl = datasetUrl.substring(0, restIndex + 4) + "/maps/" + mapName;
                this.datasetInfo.dataUrl = dataUrl;
                this._getLayerFeatures();
            } else if (type === "data") {
                this.datasetInfo.dataUrl = dataUrl;
                this._getDataFeatures();
            }
        }
    }

    _getLayerFeatures() {
        let datasetsInfo = this.datasetInfo;
        let queryParam, queryBySQLParams, queryBySQLService;
        let params = {
            name: datasetsInfo.mapName
        };
        Object.assign(params, this.datasets.queryInfo);
        queryParam = new SuperMap.FilterParameter(params);
        queryBySQLParams = new SuperMap.QueryBySQLParameters({
            queryParams: [queryParam],
            expectCount: 100000
        });
        queryBySQLService = new SuperMap.QueryBySQLService(datasetsInfo.dataUrl, {
            eventListeners: {
                "processCompleted": this._getChartDatasFromLayer,
                "processFailed": function () { }
            }
        });
        queryBySQLService.processAsync(queryBySQLParams);
    }
    _getChartDatasFromLayer(results) {
        if (results.result.recordsets) {
            let recordsets = results.result.recordsets[0];
            let features = recordsets.features.features;
            this.features = recordsets.features;
            let data = {};
            if (features.length) {
                data = {
                    features: recordsets.features,
                    fieldCaptions: recordsets.fieldCaptions,
                    fieldTypes: recordsets.fieldTypes,
                    fieldValues: []
                }
                for (let m in data.fieldCaptions) {
                    let fieldValue = [];

                    for (let j in features) {
                        let feature = features[j];
                        let caption = data.fieldCaptions[m];
                        let value = feature.properties[caption];
                        fieldValue.push(value);
                    }
                    data.fieldValues.push(fieldValue);
                }
                this.succeedCb && this.succeedCb(data);
                this.fire('getchartdatasucceeded', { data })
            }
        }
    }

    _createChart(data) {
        this.echart = echarts && echarts.init(this.chartContainer, null, { renderer: "canvas" })
        let options = this._createChartOptions(data);
        this.echart.setOption(options);
        this.fire('chartinitsucceeded', { chart: this.echart });
    }

    _getDataFeatures(results) {
        let datasetsInfo = results.result;
        let getFeatureParam, getFeatureBySQLParams, getFeatureBySQLService;
        let params = {
            name: datasetsInfo.datasetName + "@" + datasetsInfo.dataSourceName
        }
        Object.assign(params, this.datasets.queryInfo);
        getFeatureParam = new SuperMap.FilterParameter(params);
        getFeatureBySQLParams = new SuperMap.GetFeaturesBySQLParameters({
            queryParameter: getFeatureParam,
            datasetNames: [datasetsInfo.dataSourceName + ":" + datasetsInfo.datasetName],
            fromIndex: 0,
            toIndex: 100000
        });
        getFeatureBySQLService = new SuperMap.GetFeaturesBySQLService(datasetsInfo.dataUrl, {
            eventListeners: {
                "processCompleted": this._getChartDatas,
                "processFailed": function () { }
            }
        });
        getFeatureBySQLService.processAsync(getFeatureBySQLParams);
    }

    _getChartDatas(results) {
        if (results) {
            // 数据来自restdata---results.result.features
            this.features = results.features;
            let features = this.features.features;
            let data = {};
            if (features.length) {
                let feature = features[0];
                let attrFields = [],
                    itemTypes = [];
                for (let attr in feature.properties) {
                    attrFields.push(attr);
                    itemTypes.push(this._getDataType(feature.properties[attr]));
                }
                data = {
                    features,
                    fieldCaptions: attrFields,
                    fieldTypes: itemTypes,
                    fieldValues: []
                }
                for (let m in itemTypes) {
                    let fieldValue = [];

                    for (let j in features) {
                        let feature = features[j];
                        let caption = data.fieldCaptions[m];
                        let value = feature.properties[caption];
                        fieldValue.push(value);
                    }
                    data.fieldValues.push(fieldValue);
                }
                this.succeedCb && this.succeedCb(data);
                this.fire('getchartdatasucceeded', { data })
            }
        }
    }

    _createChartOptions(data) {
        this.calculatedData = this._createChartDatas(data);
        return this._updateChartOptions(this.chartType);
    }

    _updateDataSuccess(data) {
        let options = this._createChartOptions(data);
        this._updateChart(options);
    }

    _updateChartOptions(type, style) {
        if (this.calculatedData) {
            let grid = this.grid;
            let series = this._createChartSeries(this.calculatedData, type);
            let datas = [];
            for (let i in this.calculatedData.XData) {
                datas.push({
                    value: this.calculatedData.XData[i].fieldsData
                });
            }
            let xAxis = {
                type: "category",
                name: this.xField[0].name || "X",
                data: datas,
                nameTextStyle: {
                    color: '#fff',
                    fontSize: 14
                },
                splitLine: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: '#eee'
                    }
                }
            }
            let yAxis = {
                type: "value",
                name: this.yFieldName || "Y",
                data: {},
                nameTextStyle: {
                    color: '#fff',
                    fontSize: 14
                },
                splitLine: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: '#eee'
                    }
                }
            }
            let tooltip = {
                formatter: '{b0}: {c0}'
            };
            let backgroundColor = '#404a59';
            if (style) {
                if (style.grid) {
                    grid = style.grid;
                }
                if (style.tooltip) {
                    tooltip = style.tooltip;
                }
                if (style.backgroundColor) {
                    backgroundColor = style.backgroundColor;
                }
            }
            return {
                backgroundColor: backgroundColor,
                grid: grid,
                series: series,
                xAxis: xAxis,
                yAxis: yAxis,
                tooltip: tooltip
            }
        }
    }
    _createChartDatas(data) {
        let fieldIndex = 0, yfieldIndexs = [];
        let fieldCaptions = data.fieldCaptions;
        let me = this;
        //X
        fieldCaptions.forEach(function (field, index) {
            if (me.xField[0] && field === me.xField[0].field) {
                fieldIndex = index;
            }
        });
        //Y
        this.yFieldName = "";
        this.yField.forEach(function (value, index) {
            if (index !== 0) {
                me.yFieldName = me.yFieldName + ",";
            }
            me.yFieldName = me.yFieldName + value.name;
            fieldCaptions.forEach(function (field, index) {
                if (field === value.field) {
                    yfieldIndexs.push(index);
                }
            });
        })
        let datas = this._getAttrData(data, fieldIndex);
        let yDatas = [];
        if (yfieldIndexs.length > 0) {
            yfieldIndexs.forEach(function (yfieldIndex) {
                let yData = [];
                for (let i in data.fieldValues[yfieldIndex]) {
                    yData.push({
                        value: data.fieldValues[yfieldIndex][i]
                    });
                }
                yDatas.push(yData);
            });
        } else {                     //未指定Y字段时，y轴计数
            let YData = [],
                XData = [],
                len = datas.length;

            //计算X轴，Y轴数据，并去重
            for (let i = 0; i < len; i++) {
                let isSame = false;
                for (let j = 0, leng = XData.length; j < leng; j++) {
                    if (datas[i].fieldsData === XData[j].fieldsData) {
                        YData[j].value++;
                        XData[j].recordIndexs.push(i);
                        isSame = true;
                        break;
                    }
                }
                if (!isSame) {
                    if (datas[i].fieldsData) {
                        XData.push({ fieldsData: datas[i].fieldsData, recordIndexs: [i] });
                        YData.push({ value: 1 });
                    }
                }
            }
            datas = XData;
            yDatas = [YData];
        }
        return {
            XData: datas,
            YData: yDatas
        }
    }
    _getAttrData(datacontent, index) {
        if (index === 0) {
            this.xField = [{
                field: datacontent.fieldCaptions[index],
                name: datacontent.fieldCaptions[index]
            }];
        }
        let fieldsDatas = [];
        for (let i = 0, len = datacontent.fieldValues[index].length; i < len; i++) {
            let value = datacontent.fieldValues[index][i];
            fieldsDatas.push({
                recordIndexs: i,
                fieldsData: value
            });
        }
        return fieldsDatas;
    }
    _createChartSeries(calculatedData, chartType) {
        let series = [];
        let yDatas = calculatedData.YData;
        yDatas.forEach(function (yData) {
            let value = 0;
            let serieData = [];
            for (let data of yData) {
                value = data.value;
                serieData.push({
                    value: value
                });
            }
            let serie = {
                type: chartType,
                data: serieData,
                name: "y"
            };

            series.push(serie);
        });
        return series;
    }
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
     * @function ChartViewModel.prototype._isNumber
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

    /**
     * @function ChartViewModel.prototype._getDataType
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
     * @function ChartViewModel.prototype._checkUrl
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
     * @function ChartViewModel.prototype._isMatchUrl
     * @description 判断输入的地址是否符合地址格式
     * @private
     * @param {string} str - url
     */
    _isMatchUrl(str) {
        var reg = new RegExp('(https?|http|file|ftp)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]');
        return reg.test(str);
    }

    /**
     * @function ChartViewModel.prototype.getStyle
     * @description 获取图表样式。
     */
    getStyle() {
        let style = {
            grid: this.grid,
            tooltip: this.tooltip,
            backgroundColor: this.backgroundColor
        }
        return style;
    }

    /**
     * @function ChartViewModel.prototype.getFeatures
     * @description 获取地图服务，数据服务请求返回的数据。
     */
    getFeatures() {
        return this.features;
    }

    /**
     * @function ChartViewModel.prototype.setStyle
     * @description 设置图表样式。
     * @param {Object} style - 图表样式
     */
    setStyle(style) {
        let newOptions = this._updateChartOptions(this.chartType, style);
        this._updateChart(newOptions);
    }
    _updateChart(options) {
        if (this.echart) {
            this.echart.clear();
            this.echart.setOption(options);
            this.fire('updatechartsucceeded', { chart: this.echart });
        }
    }
    _getFeatureBySQL(url, datasetNames, queryInfo, processCompleted, processFaild) {
        let getFeatureParam, getFeatureBySQLService, getFeatureBySQLParams;
        let params = {
            name: datasetNames.join().replace(":", "@")
        }
        Object.assign(params, queryInfo);
        getFeatureParam = new SuperMap.FilterParameter(params);
        getFeatureBySQLParams = new SuperMap.GetFeaturesBySQLParameters({
            queryParameter: getFeatureParam,
            datasetNames: datasetNames,
            fromIndex: 0,
            toIndex: 100000,
            returnContent: true
        });
        let options = {
            eventListeners: {
                processCompleted: getFeaturesEventArgs => {
                    processCompleted && processCompleted(getFeaturesEventArgs);
                },
                processFailed: e => {
                    processFaild && processFaild(e);
                }
            }
        };
        getFeatureBySQLService = new SuperMap.GetFeaturesBySQLService(url, options);
        getFeatureBySQLService.processAsync(getFeatureBySQLParams);
    }
    _queryFeatureBySQL(url, layerName, queryInfo, fields, epsgCode, processCompleted, processFaild, startRecord, recordLength, onlyAttribute) {
        var queryParam, queryBySQLParams;
        var filterParams = {
            name: layerName
        }
        Object.assign(filterParams, queryInfo);
        queryParam = new SuperMap.FilterParameter(filterParams);
        if (fields) {
            queryParam.fields = fields;
        }
        var params = {
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
            }
        }
        queryBySQLParams = new SuperMap.QueryBySQLParameters(params);
        this._queryBySQL(url, queryBySQLParams, data => {
            data.type === 'processCompleted' ? processCompleted(data) : processFaild(data)
        });
    }
    _queryBySQL(url, params, callback, resultFormat) {
        var me = this;
        var queryBySQLService = new SuperMap.QueryBySQLService(url, {
            eventListeners: {
                scope: me,
                processCompleted: callback,
                processFailed: callback
            },
            format: me._processFormat(resultFormat)
        });

        queryBySQLService.processAsync(params);
    }
    _processFormat(resultFormat) {
        return (resultFormat) ? resultFormat : SuperMap.DataFormat.GEOJSON;
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
}