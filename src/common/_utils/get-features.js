import iServerRestService from './iServerRestService';
import iPortalDataService from './iPortalDataService';
import RestService from './RestService';

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
      epsgCode
    } = dataset;
    if (dataset && (url || geoJSON) && type) {
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
        superMapService = new iPortalDataService(url, withCredentials, { epsgCode });
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
        getdatafailed: function(e) {
          reject(e);
        }
      });
      superMapService.getData(params[0], params[1]);
    }
  });
  return promise;
}
