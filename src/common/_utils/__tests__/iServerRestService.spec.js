import iServerRestService from '../../../common/_utils/iServerRestService';
const SuperMap = require('../../../../test/unit/mocks/supermap');
import { FetchRequest } from 'vue-iclient/static/libs/iclient-common/iclient-common';

describe('iServerRestService', () => {
  beforeAll(() => {
    jest.spyOn(FetchRequest, 'post').mockImplementation((url, params) => {
      const postParams = JSON.parse(params.replace(/'/g, '"'));
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
                    { name: 'NAME', caption: '名称', type: 'WTEXT' }
                  ]
                }
              ])
            )
          );
        });
      }
      return new Promise((resolve, reject) => {
        const obj = {
          datasetInfos: [
            {
              fieldInfos: [
                { name: 'SmID', caption: 'SmID', type: 'INT32' },
                { name: 'NAME', caption: '名称', type: 'WTEXT' }
              ]
            }
          ],
          features: [
            {
              fieldNames: ['SMID', 'NAME'],
              fieldValues: ['18', 'AAAAA']
            }
          ]
        };
        if (
          postParams.queryParameters &&
          postParams.queryParameters.queryOption &&
          postParams.queryParameters.queryOption.indexOf('GEOMETRY') >= 0
        ) {
          obj.features[0].geometry = {
            type: 'Point',
            coordinates: [101.84004968, 26.0859968692659]
          };
        }
        resolve(new Response(JSON.stringify(obj)));
      });
    });
  });
  afterAll(() => {
    jest.resetAllMocks();
  });
  it('_getMapFeatureBySql hasGeometry false', done => {
    const service = new iServerRestService('url', { hasGeometry: false });
    service.on({
      getdatasucceeded: function (data) {
        expect(data.features[0].geometry).toBeUndefined();
        done();
      }
    });
    service._getMapFeatureBySql('mock', {});
  });
  it('_getMapFeatureBySql hasGeometry default', done => {
    const service = new iServerRestService();
    service.on({
      getdatasucceeded: function (data) {
        expect(data.features[0].geometry).not.toBeUndefined();
        done();
      }
    });
    service._getMapFeatureBySql('mock', {});
  });
  it('_getMapFeatureBySql hasGeometry true', done => {
    const service = new iServerRestService('url', { hasGeometry: true });
    service.on({
      getdatasucceeded: function (data) {
        expect(data.features[0].geometry).not.toBeUndefined();
        done();
      }
    });
    service._getMapFeatureBySql('mock', {});
  });
  it('_getDataFeaturesBySql', done => {
    const service = new iServerRestService('url', { hasGeometry: true });
    service._getDataFeaturesBySql('mock', {});
    service.on({
      getdatasucceeded: data => {
        expect(data.fields).toEqual(['SMID', '名称']);
        done();
      }
    });
  });
  it('getDataFeaturesCount', async done => {
    const service = new iServerRestService();
    const result = await service.getDataFeaturesCount({
      dataUrl: 'http://localhost:8090/iserver/services/xxx/rest/data',
      datasetName: 'test',
      dataSourceName: 'test'
    });
    expect(result).toBe(500);
    done();
  });
  it('getFeaturesDatasetInfo', async done => {
    const service = new iServerRestService();
    const result = await service.getFeaturesDatasetInfo({
      dataUrl: 'http://localhost:8090/iserver/services/xxx/rest/data',
      datasetName: 'test',
      dataSourceName: 'test'
    });
    expect(result[0].name).toBe('SmID');
    expect(result[0].caption).toBe('SmID');
    done();
  });
});
