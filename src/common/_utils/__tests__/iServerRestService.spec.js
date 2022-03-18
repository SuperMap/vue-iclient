import iServerRestService from '../../../common/_utils/iServerRestService';
const SuperMap = require('../../../../test/unit/mocks/supermap');

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
});
