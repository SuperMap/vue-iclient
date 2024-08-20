import iServerRestService, { transformFeatures } from '../../../common/_utils/iServerRestService';
import { getProjection, registerProjection } from '../../../common/_utils/epsg-define';
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

  it('transformFeatures', (done) => {
    const epsgCode = 'EPSG:4548';
    const wkt = `PROJCS["China_2000_3_DEGREE_GK_Zone_39N",GEOGCS["GCS_China_2000",DATUM["D_China_2000",SPHEROID["CGCS2000",6378137.0,298.257222101,AUTHORITY["EPSG","7044"]]],PRIMEM["Greenwich",0.0,AUTHORITY["EPSG","8901"]],UNIT["DEGREE",0.017453292519943295],AUTHORITY["EPSG","4490"]],PROJECTION["Transverse_Mercator",AUTHORITY["EPSG","9807"]],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",117.0],PARAMETER["Latitude_Of_Origin",0.0],PARAMETER["Scale_Factor",1.0],UNIT["METER",1.0],AUTHORITY["EPSG","4548"]]`;
    registerProjection(epsgCode, wkt);
    expect(getProjection(epsgCode)).not.toBeUndefined();
    const features = [{
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [478591, 3734142]
      },
      properties: {}
    }];
    const result = transformFeatures(4548, features);
    expect(result).toEqual(features);
    expect(result[0].geometry.coordinates).toEqual([116.76898148293563, 33.733651143352695]);
    done();
  })
});
