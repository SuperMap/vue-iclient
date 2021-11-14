function mockFetch(resource) {
  const FetchRequest = jest.spyOn(SuperMap.FetchRequest, 'get');
  FetchRequest.mockImplementation(url => {
    return new Promise((resolve, reject) => {
      if(url.indexOf(('?REQUEST=GetCapabilities&SERVICE=WMS') || ('?REQUEST=GetCapabilities&SERVICE=WMTS&VERSION=1.0.0'))  > -1) {
        resolve(new Response(resource[url]));
      } else if(resource[url]){
        resolve(new Response(JSON.stringify(resource[url])));
      } else {
        reject('未匹配到' + url);
      }
    });
  });
}
export default mockFetch;
