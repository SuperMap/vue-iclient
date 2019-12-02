import iServerRestService from './iServerRestService';
import iPortalDataService from './iPortalDataService';
import RestService from './RestService';

export default function getFeatures(dataset) {
  let promise = new Promise((resolve, reject) => {
    let { url, type, maxFeatures, attributeFilter, dataName, layerName, withCredentials, preferContent } = dataset;
    if (dataset && url && type) {
      let superMapService;
      let queryInfo = {
        maxFeatures: maxFeatures,
        attributeFilter: attributeFilter
      };
      if (type === 'iServer') {
        let datasetInfo;
        const options = {};
        if (dataset.proxy) {
          options.proxy = dataset.proxy;
        }
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
        superMapService.getData(datasetInfo, queryInfo);
      } else if (type === 'iPortal') {
        queryInfo.withCredentials = withCredentials;
        superMapService = new iPortalDataService(url, withCredentials);
        superMapService.getData(queryInfo, !!preferContent);
      } else if (type === 'rest') {
        superMapService = new RestService({
          proxy: dataset.proxy
        });
        superMapService.getData(url, queryInfo);
      }

      if (superMapService) {
        superMapService.on({
          getdatasucceeded: function(data) {
            resolve(data);
          },
          getdatafailed: function(e) {
            reject(e);
          }
        });
      }
    }
  });
  return promise;
}
