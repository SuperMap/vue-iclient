import iServerRestService from './iServerRestService';
import iPortalDataService from './iPortalDataService';
import RestService from './RestService';

export default function getFeatures(dataset) {
  let promise = new Promise((resolve, reject) => {
    if (dataset && dataset.url && dataset.type) {
      let superMapService;
      let queryInfo = {
        maxFeatures: dataset.maxFeatures,
        attributeFilter: dataset.attributeFilter
      };
      if (dataset.type === 'iServer') {
        let datasetInfo;
        superMapService = new iServerRestService(dataset.url);
        if (dataset.dataName) {
          let arr = dataset.dataName[0].split(':');
          datasetInfo = {
            datasetName: arr[1],
            dataSourceName: arr[0],
            dataUrl: dataset.url
          };
        } else {
          datasetInfo = {
            mapName: dataset.layerName,
            dataUrl: dataset.url
          };
        }
        superMapService.getData(datasetInfo, queryInfo);
      } else if (dataset.type === 'iPortal') {
        queryInfo.withCredentials = dataset.withCredentials;
        superMapService = new iPortalDataService(dataset.url, dataset.withCredentials);
        superMapService.getData(queryInfo);
      } else if (dataset.type === 'rest') {
        superMapService = new RestService();
        superMapService.getData(dataset.url, queryInfo);
      }
      superMapService.on('getdatafailed', function(e) {
        reject(e);
      });
      superMapService.on('getdatasucceeded', function(data) {
        resolve(data);
      });
    }
  });
  return promise;
}
