var SuperMap = window.SuperMap = window.SuperMap || {};
SuperMap.Widgets = window.SuperMap.Widgets || {};
import { featureResults, datas, datasources, datasets, queryResults } from "./services"

var GetFeaturesBySQLParameters = SuperMap.GetFeaturesBySQLParameters = jest.fn();
var GetFeaturesBySQLParameters = SuperMap.GetFeaturesByBoundsParameters = jest.fn();
var QueryBySQLParameters = SuperMap.QueryBySQLParameters = jest.fn();
var QueryByBoundsParameters = SuperMap.QueryByBoundsParameters = jest.fn();
var FetchRequest = SuperMap.FetchRequest = {

    get: function (url, params, options) {

        return new Promise((resolve, reject) => {
            console.log(url);
            if (url.indexOf("1962026684") > -1) {
                process.nextTick(() =>
                    resolve(new Response(JSON.stringify(datas)))
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


module.exports = SuperMap;