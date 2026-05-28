import iServerRestService, { transformFeatures } from '../../../common/_utils/iServerRestService';
import { getProjection, registerProjection } from '../../../common/_utils/epsg-define';
import { FetchRequest } from 'vue-iclient/static/libs/iclient-common/iclient-common';
import { REST_DATA_FIELDS_RESULT, prj_data } from '@mocks/services';

describe('iServerRestService', () => {
  let mockPostParams;
  let postSpy;
  beforeEach(() => {
    jest.spyOn(FetchRequest, 'get').mockImplementation((url, params) => {
      if (url.includes('fields?returnAll=true')) {
        return new Promise(resolve => {
          resolve(new Response(JSON.stringify(REST_DATA_FIELDS_RESULT)));
        });
      }
      if (url.includes('/datasources/') && url.endsWith('.json')) {
        return new Promise(resolve => {
          resolve(new Response(JSON.stringify({})));
        });
      }
      return Promise.resolve(new Response(JSON.stringify(prj_data)));
    });
    postSpy = jest.spyOn(FetchRequest, 'post').mockImplementation((url, params) => {
      mockPostParams = params;
      if (url.indexOf('returnCountOnly=true') >= 0) {
        return new Promise((resolve, reject) => {
          resolve(new Response(JSON.stringify({ totalCount: 500 })));
        });
      }
      if (url.indexOf('returnDatasetInfoOnly=true') >= 0) {
        return new Promise((resolve, reject) => {
          resolve(
            new Response(
              JSON.stringify([
                {
                  fieldInfos: [
                    { name: 'SmID', caption: 'SmID', type: 'INT32' },
                    { name: 'NAME', caption: '名称', type: 'WTEXT' },
                    { name: 'lowercase', caption: 'lowercase', type: 'WTEXT' }
                  ]
                }
              ])
            )
          );
        });
      }
      const features = [
        {
          fieldNames: ['SMID', 'NAME', 'lowercase'],
          fieldValues: ['18', 'AAAAA', 'test']
        }
      ];
      if (params.includes('ATTRIBUTEANDGEOMETRY')) {
        features[0].geometry = {
          id: 18,
          center: {
            y: 32.2567100524902,
            x: 99.9542236328125
          },
          style: null,
          parts: [1],
          partTopo: [],
          points: [
            {
              y: 32.2567100524902,
              x: 99.9542236328125
            }
          ],
          type: 'POINT'
        };
      }
      if (url.includes('queryResults?returnContent=true')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              recordsets: [
                {
                  features,
                  fieldCaptions: ['SmID', '名称', 'lowercase'],
                  fieldTypes: ['INT32', 'WTEXT', 'WTEXT'],
                  fields: ['SmID', 'NAME', 'lowercase']
                }
              ],
              totalCount: 1
            })
          )
        );
      }
      return new Promise((resolve, reject) => {
        const obj = {
          datasetInfos: [
            {
              fieldInfos: [
                { name: 'SmID', caption: 'SmID', type: 'INT32' },
                { name: 'NAME', caption: '名称', type: 'WTEXT' },
                { name: 'lowercase', caption: 'lowercase', type: 'WTEXT' }
              ]
            }
          ],
          features
        };
        resolve(new Response(JSON.stringify(obj)));
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  it('getMapFeatures hasGeometry false', done => {
    const service = new iServerRestService('url', { hasGeometry: false, epsgCode: 3857 });
    service.on({
      getdatasucceeded: function (data) {
        expect(data.features[0].geometry).toBeFalsy();
        done();
      }
    });
    service.getMapFeatures({ dataUrl: 'http://fakeiserver/rest/map', mapName: 'mockLayer' }, {});
  });

  it('getMapFeatures hasGeometry default', done => {
    const service = new iServerRestService();
    service.on({
      getdatasucceeded: function (data) {
        expect(data.features[0].geometry).toBeTruthy();
        done();
      }
    });
    service.getMapFeatures({ dataUrl: 'http://fakeiserver/rest/map', mapName: 'mockLayer' }, {});
  });

  it('getMapFeatures hasGeometry true', done => {
    const service = new iServerRestService('url', { hasGeometry: true });
    service.on({
      getdatasucceeded: function (data) {
        expect(data.features[0].geometry).toBeTruthy();
        done();
      }
    });
    service.getMapFeatures({ dataUrl: 'http://fakeiserver/rest/map', mapName: 'mockLayer' }, {});
  });

  it('getMapFeatures by keyWord', done => {
    const service = new iServerRestService('url', { hasGeometry: true });
    service.on({
      getdatasucceeded: function (data) {
        expect(postSpy).toHaveBeenCalledWith(
          expect.stringContaining('queryResults?returnContent=true'),
          expect.stringContaining(`'expectCount':1,`),
          expect.any(Object)
        );
        expect(data.features[0].geometry).toBeTruthy();
        expect(data.features[0].properties['NAME']).toBeTruthy();
        expect(data.features[0].properties['名称']).toBeFalsy();
        expect(mockPostParams).toMatch(/'attributeFilter':"NAME LIKE '%25A%25'/);
        done();
      }
    });
    service.getMapFeatures({ dataUrl: 'http://fakeiserver/rest/map', mapName: 'mockLayer' }, { keyWord: 'A' });
  });

  it('getDataFeatures preferServer true', done => {
    const service = new iServerRestService('url', { hasGeometry: true, returnFeaturesOnly: true, preferServer: true });
    service.getDataFeatures(
      { datasetName: 'District_pt', dataSourceName: 'China', dataUrl: 'http://fakeiserver/rest/data' },
      {}
    );
    expect(service.options.preferServer).toBe(true);
    service.on({
      getdatasucceeded: data => {
        expect(service.options.preferServer).toBe(true);
        done();
      }
    });
  });
  it('getDataFeatures', done => {
    const service = new iServerRestService('url', { hasGeometry: true });
    service.getDataFeatures(
      { datasetName: 'District_pt', dataSourceName: 'China', dataUrl: 'http://fakeiserver/rest/data' },
      {}
    );
    expect(service.options.preferServer).toBe(undefined);
    service.on({
      getdatasucceeded: data => {
        expect(data.fields).toEqual(['SMID', 'NAME', 'lowercase']);
        expect(data.fieldCaptions).toEqual(['SmID', '名称', 'lowercase']);
        const featureFields = Object.keys(data.features[0].properties);
        expect(data.fields).toEqual(featureFields);
        done();
      }
    });
  });
  it('_getAttributeFilterByKeywords with isLower true', () => {
    const service = new iServerRestService('url', { hasGeometry: true });
    const fields = ['NAME', 'SmID'];
    const keyWord = 'test';
    const result = service._getAttributeFilterByKeywords(fields, keyWord, true);
    expect(result).toBe("LOWER(NAME) LIKE LOWER('%test%') OR LOWER(SmID) LIKE LOWER('%test%')");
  });

  it('_getAttributeFilterByKeywords with isLower false (SHAPEFILE)', () => {
    const service = new iServerRestService('url', { hasGeometry: true });
    const fields = ['NAME', 'SmID'];
    const keyWord = 'test';
    const result = service._getAttributeFilterByKeywords(fields, keyWord, false);
    expect(result).toBe("NAME LIKE '%test%' OR SmID LIKE '%test%'");
  });

  it('_getAttributeFilterByKeywords with empty fields', () => {
    const service = new iServerRestService('url', { hasGeometry: true });
    const fields = [];
    const keyWord = 'test';
    const result = service._getAttributeFilterByKeywords(fields, keyWord, true);
    expect(result).toBe('');
  });

  it('_getRestDataEngineType returns SHAPEFILE', async () => {
    jest.spyOn(FetchRequest, 'get').mockImplementation((url) => {
      if (url.includes('/rest/data') && url.includes('/datasources/') && url.endsWith('.json')) {
        return new Promise(resolve => {
          resolve(new Response(JSON.stringify({
            datasourceInfo: {
                engineType: 'SHAPEFILE'
            }
          })));
        });
      }
      return Promise.resolve(new Response(JSON.stringify({})));
    });
    const service = new iServerRestService('url', { hasGeometry: true });
    const result = await service._getRestDataEngineType('http://fakeiserver/rest/data/datasources/test/datasets/test', false);
    expect(result).toBe('SHAPEFILE');
  });

  it('_getRestDataAttributeFilter with SHAPEFILE engineType', async () => {
    jest.spyOn(FetchRequest, 'get').mockImplementation((url) => {
      if (url.includes('/rest/data') && url.includes('/datasources/') && url.endsWith('.json')) {
        return new Promise(resolve => {
          resolve(new Response(JSON.stringify({
            datasourceInfo: {
                engineType: 'SHAPEFILE'
            }
          })));
        });
      }
      return Promise.resolve(new Response(JSON.stringify({})));
    });
    const service = new iServerRestService('url', { hasGeometry: true });
    const datasetInfo = {
      datasetName: 'test',
      dataSourceName: 'test',
      dataUrl: 'http://fakeiserver/rest/data'
    };
    const fields = ['NAME', 'SmID'];
    const keyWord = 'test';
    const result = await service._getRestDataAttributeFilter(datasetInfo, fields, keyWord, false);
    expect(result).toBe("NAME LIKE '%test%' OR SmID LIKE '%test%'");
  });

  it('_getRestDataAttributeFilter with VECTORFILE engineType', async () => {
    jest.spyOn(FetchRequest, 'get').mockImplementation((url) => {
      if (url.includes('/rest/data') && url.includes('/datasources/') && url.endsWith('.json')) {
        return new Promise(resolve => {
          resolve(new Response(JSON.stringify({
            datasourceInfo: {
                engineType: 'VECTORFILE'
            }
          })));
        });
      }
      return Promise.resolve(new Response(JSON.stringify({})));
    });
    const service = new iServerRestService('url', { hasGeometry: true });
    const datasetInfo = {
      datasetName: 'test',
      dataSourceName: 'test',
      dataUrl: 'http://fakeiserver/rest/data'
    };
    const fields = ['NAME', 'SmID'];
    const keyWord = 'test';
    const result = await service._getRestDataAttributeFilter(datasetInfo, fields, keyWord, false);
    expect(result).toBe("NAME LIKE '%test%' OR SmID LIKE '%test%'");
  });
});
