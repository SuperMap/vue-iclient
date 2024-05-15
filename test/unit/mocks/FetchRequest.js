import { FetchRequest } from 'vue-iclient/static/libs/iclient-common/iclient-common';

function mockFetch(resource) {
  const mockImplementation = url => {
    return new Promise((resolve, reject) => {
      if (url.indexOf('prjCoordSys.wkt') > -1) {
        resolve(new Response(resource[url]));
      } else if (url.indexOf('?REQUEST=GetCapabilities&SERVICE=WMS') > -1) {
        resolve(new Response(resource[url]));
      } else if (url.indexOf('?REQUEST=GetCapabilities&SERVICE=WMTS') > -1) {
        resolve(new Response(resource[url]));
      } else if (resource[url]) {
        resolve(new Response(JSON.stringify(resource[url])));
      } else {
        reject('未匹配到' + url);
      }
    });
  };

  jest.spyOn(SuperMap.FetchRequest, 'get').mockImplementation(mockImplementation);
  jest.spyOn(FetchRequest, 'get').mockImplementation(mockImplementation);
}
export default mockFetch;
