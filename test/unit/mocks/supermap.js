var SuperMap = window.SuperMap = window.SuperMap || {};
SuperMap.Widgets = window.SuperMap.Widgets || {};
SuperMap.Widgets.FileReaderUtil = {};

import { featureResults, datas, datasources, datasets, queryResults, fakeLandUse, chartResult, datas_chart, iportal_content, datas_mapjson, charts_content, localSearch } from "./services"

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

            if (url.indexOf("1962026684") > -1) {
                process.nextTick(() =>
                    resolve(new Response(JSON.stringify(datas)))
                )
            }

            else if (url.indexOf("1649097980/map.json") > -1) {
                process.nextTick(() =>
                    resolve(new Response(JSON.stringify(datas_mapjson)))
                )
            }
            // echarts
            else if (url.indexOf("datas/1920557079/content.json") > -1) {
                console.log("echarts content")
                process.nextTick(() =>
                    resolve(new Response(JSON.stringify(charts_content)))
                )
            }
            // /web/datas/1920557079.json echarts
            else if (url.indexOf("1920557079") > -1) {
                console.log("echarts json")
                process.nextTick(() =>
                    resolve(new Response(JSON.stringify(datas_chart)))
                )

            }
            else if (url.indexOf("content.json?pageSize=9999999&currentPage=1") > -1) {
                process.nextTick(() =>
                    resolve(new Response(JSON.stringify(iportal_content)))
                )
            }

            else if (url.indexOf("/queryResults") > -1) {
      
                process.nextTick(() =>
                    resolve(new Response(JSON.stringify(queryResults)))
                )
            }
            else if (url.indexOf("/featureResults") > -1) {
          
                process.nextTick(() =>
                    resolve(new Response(JSON.stringify(featureResults)))
                )
            }
            else if (url.indexOf("/Landuse_R") > -1) {
       
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
           
                process.nextTick(() =>
                    resolve(new Response(JSON.stringify(datasources)))
                )
            }
            // http://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos.json?keywords=%E5%8C%97%E4%BA%AC&city=%E5%8C%97%E4%BA%AC%E5%B8%82&pageSize=10&pageNum=1&key=fvV2osxwuZWlY0wJb8FEb2i5 
            else if (url.indexOf("localsearch/rest/searchdatas/China/poiinfos.json") > -1) {
                process.nextTick(() =>
                    resolve(new Response(JSON.stringify(localSearch)))
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
    getFeatureEvent.emit('processCompleted', results);
}


module.exports = SuperMap;