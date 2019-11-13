import iServerRestService from './iServerRestService';
import iPortalDataService from './iPortalDataService';
import RestService from '../../common/_utils/RestService';

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
        superMapService = new iServerRestService(url);
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
        let restService = new RestService();
        restService.getData(url, queryInfo);
        restService.on({
          'getdatafailed': function (e) {
            reject(e);
          }
        });
        restService.on({
          'getdatasucceeded': function (data) {
            resolve(data);
          }
        });
      }
      if (['iServer', 'iPortal'].includes(type) && superMapService) {
        superMapService.on('getdatafailed', function (e) {
          reject(e);
        });
        superMapService.on('getdatasucceeded', function (data) {
          resolve(data);
        });
      }
    }
  });
  return promise;
}
