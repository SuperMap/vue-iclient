var SuperMap = window.SuperMap = window.SuperMap || {};
SuperMap.Widgets = window.SuperMap.Widgets || {};
SuperMap.Widgets.FileReaderUtil = {};

import { featureResults, datas, datasources, datasets, queryResults, fakeLandUse, chartResult, datas_chart, iportal_content } from "./services"

var GetFeaturesBySQLParameters = SuperMap.GetFeaturesBySQLParameters = jest.fn();
var GetFeaturesBySQLParameters = SuperMap.GetFeaturesByBoundsParameters = jest.fn();
var QueryBySQLParameters = SuperMap.QueryBySQLParameters = jest.fn();
var FilterParameter = SuperMap.FilterParameter = jest.fn();
var QueryByBoundsParameters = SuperMap.QueryByBoundsParameters = jest.fn();
var isXField = SuperMap.Widgets.FileReaderUtil.isXField = jest.fn();
var isYField = SuperMap.Widgets.FileReaderUtil.isYField = jest.fn();


var FetchRequest = SuperMap.FetchRequest = {

    get: function (url, params, options) {

        return new Promise((resolve, reject) => {
            console.log(url);
            if (url.indexOf("1962026684") > -1) {
                process.nextTick(() =>
                    resolve(new Response(JSON.stringify(datas)))
                )
            }
            else if (url.indexOf("content.json?pageSize=9999999&currentPage=1") > -1) {
                process.nextTick(() =>
                    resolve(new Response(JSON.stringify(iportal_content)))
                )
            }
            else if (url.indexOf("888186112") > -1) {
                process.nextTick(() =>
                    resolve(new Response(JSON.stringify(datas_chart)))
                )
            }

            else if (url.indexOf("/queryResults") > -1) {
                console.log("queryResults")
                process.nextTick(() =>
                    resolve(new Response(JSON.stringify(queryResults)))
                )
            }
            else if (url.indexOf("/featureResults") > -1) {
                console.log("featureresult")
                process.nextTick(() =>
                    resolve(new Response(JSON.stringify(featureResults)))
                )
            }
            else if (url.indexOf("/Landuse_R") > -1) {
                console.log("Landuse");
                process.nextTick(() =>
                    resolve(new Response(JSON.stringify(fakeLandUse)))
                )
            }
            else if (url.indexOf("/datasets") > -1) {
                process.nextTick(() =>
                    resolve(new Response(JSON.stringify(datasets)))
                )
            }
            else if (url.indexOf("/datasources") > -1) {
                console.log("datasources");
                process.nextTick(() =>
                    resolve(new Response(JSON.stringify(datasources)))
                )
            }
        });
    }
}

var events = require('events');
var getFeatureEvent = new events.EventEmitter();


var results = {
    result: chartResult
};

var GetFeaturesBySQLService = SuperMap.GetFeaturesBySQLService = (url, options) => {
    getFeatureEvent.on('processCompleted', options.eventListeners.processCompleted);
    return {
        processAsync: processAsync
    }
}
var processAsync = SuperMap.GetFeaturesBySQLService.processAsync = (getFeatureBySQLParams) => {
    console.log("emit event");
    getFeatureEvent.emit('processCompleted', results);
}


module.exports = SuperMap;