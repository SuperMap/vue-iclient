import iServerRestService from 'vue-iclient/src/common/_utils/iServerRestService';
import iPortalDataService from 'vue-iclient/src/common/_utils/iPortalDataService';
import RestService from 'vue-iclient/src/common/_utils/RestService';

export default function getFeatures(dataset) {
  let superMapService;
  let params = [];
  let promise = new Promise((resolve, reject) => {
    let {
      url,
      type,
      geoJSON,
      maxFeatures,
      attributeFilter,
      dataName,
      layerName,
      withCredentials,
      preferContent,
      epsgCode,
      fromIndex,
      toIndex,
      hasGeometry,
      orderBy,
      returnFeaturesOnly,
      bounds,
      keyWord,
      onlyService
    } = dataset;
    if (dataset && (url || geoJSON) && type) {
      let queryInfo = {
        maxFeatures: maxFeatures,
        attributeFilter: attributeFilter,
        orderBy,
        bounds,
        keyWord
      };
      if (type === 'iServer') {
        let datasetInfo;
        const options = {
          fromIndex,
          toIndex,
          hasGeometry,
          returnFeaturesOnly
        };
        if (dataset.proxy) {
          options.proxy = dataset.proxy;
        }
        epsgCode && (options.epsgCode = epsgCode);
        superMapService = new iServerRestService(dataset.url, options);
        if (dataName) {
          let arr = dataName[0].split(':');
          datasetInfo = {
            datasetName: arr[1],
            dataSourceName: arr[0],
            dataUrl: url
          };
        } else {
          datasetInfo = {
            mapName: layerName,
            dataUrl: url
          };
        }
        params = [datasetInfo, queryInfo];
      } else if (type === 'iPortal') {
        queryInfo.withCredentials = withCredentials;
        if (onlyService !== undefined) {
          queryInfo.onlyService = onlyService;
        }
        superMapService = new iPortalDataService(url, withCredentials, {
          epsgCode,
          resourceId: dataset.id,
          dataType: dataset.dataType,
          dataId: dataset.id
        });
        params = [queryInfo, !!preferContent];
      } else if (type === 'rest') {
        superMapService = new RestService({
          proxy: dataset.proxy
        });
        params = [url, queryInfo];
      } else if (type === 'geoJSON' && geoJSON) {
        superMapService = new RestService();
        params = [geoJSON, queryInfo];
      }
    }

    if (superMapService) {
      superMapService.on({
        getdatasucceeded: function(data) {
          resolve(data);
        },
        featureisempty: function(data) {
          resolve(data);
        },
        getdatafailed: function(e) {
          reject(e);
        }
      });
      superMapService.getData(params[0], params[1]);
    }
  });
  return promise;
}
