import iPortalDataService from '../iPortalDataService';
import { FetchRequest } from 'vue-iclient/static/libs/iclient-common/iclient-common';
import { REST_DATA_FIELDS_RESULT, prj_data } from '@mocks/services';

describe('iPortalDataService', () => {
  let requestUrl = null;

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('StructureData query attributeFilter', done => {
    jest.spyOn(FetchRequest, 'get').mockImplementation((url) => {
      if (url.includes('/structureddata/')) {
        requestUrl = url;
        return new Promise(resolve => {
          resolve(new Response(JSON.stringify(REST_DATA_FIELDS_RESULT)));
        });
      }
    });
    const service = new iPortalDataService('/iportal/web/datas/1245952851', true, {
      iportalServiceProxyUrl: 'http://localhost:8195/portalproxy',
      resourceId: '1245952851',
      dataType: 'STRUCTUREDDATA',
      dataId: '1245952851'
    });
    service.on({
      getdatasucceeded: function (data) {
        expect(data).not.toBeFalsy();
        expect(requestUrl).toBeTruthy();
        expect(requestUrl.includes("&filter='NAME=test'&filter-lang=cql-tex")).toBeTruthy();
        done();
      }
    });
    const attributeFilter = "'NAME=test'";
    service.getData({ attributeFilter });
  });

  it('StructureData query failed with error message', done => {
    jest.spyOn(FetchRequest, 'get').mockImplementation((url) => {
      if (url.includes('/structureddata/')) {
        return new Promise(resolve => {
          resolve(new Response(JSON.stringify({ succeed: false, error: { errorMsg: 'bad cpl', code: 400} })));
        });
      }
    });
    const service = new iPortalDataService('/iportal/web/datas/1245952851', true, {
      iportalServiceProxyUrl: 'http://localhost:8195/portalproxy',
      resourceId: '1245952851',
      dataType: 'STRUCTUREDDATA',
      dataId: '1245952851'
    });
    service.on({
      getdatafailed: function ({ error }) {
        expect(error).toBe('bad cpl');
        done();
      }
    });
    service.getData();
  });

  it('StructureData query failed with no-error message', done => {
    jest.spyOn(FetchRequest, 'get').mockImplementation((url) => {
      if (url.includes('/structureddata/')) {
        return new Promise(resolve => {
          resolve(new Response(JSON.stringify('')));
        });
      }
    });
    const service = new iPortalDataService('/iportal/web/datas/1245952851', true, {
      iportalServiceProxyUrl: 'http://localhost:8195/portalproxy',
      resourceId: '1245952851',
      dataType: 'STRUCTUREDDATA',
      dataId: '1245952851'
    });
    service.on({
      getdatafailed: function (e) {
        expect(e.error).toBe('empty data');
        done();
      }
    });
    service.getData();
  });
});

