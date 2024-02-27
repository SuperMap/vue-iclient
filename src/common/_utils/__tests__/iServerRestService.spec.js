import iServerRestService from '../../../common/_utils/iServerRestService';
const SuperMap = require('../../../../test/unit/mocks/supermap');
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';

describe('iServerRestService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('_getMapFeatureBySql hasGeometry false', done => {
    const service = new iServerRestService('url', { hasGeometry: false });
    service._getMapFeatureBySql('mock', {});
    const params = SuperMap.QueryBySQLParameters.mock.calls;
    expect(params[0][0].queryOption).toBe('ATTRIBUTE');
    done();
  });
  it('_getMapFeatureBySql hasGeometry default', done => {
    const service = new iServerRestService();
    service._getMapFeatureBySql('mock', {});
    const params = SuperMap.QueryBySQLParameters.mock.calls;
    expect(params[0][0].queryOption).toBe('ATTRIBUTEANDGEOMETRY');
    done();
  });
  it('_getMapFeatureBySql hasGeometry true', done => {
    const service = new iServerRestService('url', { hasGeometry: true });
    service._getMapFeatureBySql('mock', {});
    const params = SuperMap.QueryBySQLParameters.mock.calls;
    expect(params[0][0].queryOption).toBe('ATTRIBUTEANDGEOMETRY');
    done();
  });
  it('_getDataFeaturesBySql', done => {
    const service = new iServerRestService('url', { hasGeometry: true });
    service._getDataFeaturesBySql('mock', {});
    service.on({
      getdatasucceeded: data => {
        expect(data.fields).toEqual(['SMID', '名称'])
        done();
      },
    })
  });
  it('getDataFeaturesCount', async (done) => {
    const fetchResource = {
      'http://localhost:8090/iserver/services/xxx/rest/data/featureResults.json?fromIndex=0&toIndex=19&&returnCountOnly=true&returnContent=true': {
        totalCount: 200
      }
    };
    mockFetch(fetchResource);
    const service = new iServerRestService();
    const result = await service.getDataFeaturesCount({ dataUrl: 'http://localhost:8090/iserver/services/xxx/rest/data', datasetName: 'test', dataSourceName: 'test' });
    expect(result).toBe(500);
    done();
  });
  it('getFeaturesDatasetInfo', async (done) => {
    const fetchResource = {
      'http://localhost:8090/iserver/services/xxx/rest/data/featureResults.json?fromIndex=0&toIndex=19&&returnDatasetInfoOnly=true&returnContent=true': {
        fieldInfos: []
      }
    };
    mockFetch(fetchResource);
    const service = new iServerRestService();
    const result = await service.getFeaturesDatasetInfo({ dataUrl: 'http://localhost:8090/iserver/services/xxx/rest/data', datasetName: 'test', dataSourceName: 'test'});
    expect(result[0].name).toBe('capital');
    expect(result[0].caption).toBe('Capital');
    done();
  });
});
