import iServerRestService, { transformFeatures } from '../iServerRestService';
import { getProjection, registerProjection } from '../epsg-define';
import { FetchRequest } from 'vue-iclient-core/libs/iclient-common/iclient-common';
import { REST_DATA_FIELDS_RESULT, prj_data } from '@mocks/services';

describe('iServerRestService', () => {
  let mockPostParams;
  beforeEach(() => {
    jest.spyOn(FetchRequest, 'get').mockImplementation((url, params) => {
      if (url.includes('fields?returnAll=true')) {
        return new Promise(resolve => {
          resolve(new Response(JSON.stringify(REST_DATA_FIELDS_RESULT)));
        });
      }
      return Promise.resolve(new Response(JSON.stringify(prj_data)));
    });
    jest.spyOn(FetchRequest, 'post').mockImplementation((url, params) => {
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
                    { name: 'NAME', caption: '名称', type: 'WTEXT' }
                  ]
                }
              ])
            )
          );
        });
      }
      const features = [
        {
          fieldNames: ['SMID', 'NAME'],
          fieldValues: ['18', 'AAAAA']
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
                  fieldCaptions: ['SmID', '名称'],
                  fieldTypes: ['INT32', 'WTEXT'],
                  fields: ['SmID', 'NAME']
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
                { name: 'NAME', caption: '名称', type: 'WTEXT' }
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
        expect(data.features[0].geometry).toBeTruthy();
        expect(data.features[0].properties['NAME']).toBeTruthy();
        expect(data.features[0].properties['名称']).toBeFalsy();
        expect(mockPostParams).toMatch(/'attributeFilter':"NAME LIKE '%25A%25'/);
        done();
      }
    });
    service.getMapFeatures({ dataUrl: 'http://fakeiserver/rest/map', mapName: 'mockLayer' }, { keyWord: 'A' });
  });

  it('getDataFeatures', done => {
    const service = new iServerRestService('url', { hasGeometry: true });
    service.getDataFeatures(
      { datasetName: 'District_pt', dataSourceName: 'China', dataUrl: 'http://fakeiserver/rest/data' },
      {}
    );
    service.on({
      getdatasucceeded: data => {
        expect(data.fields).toEqual(['SMID', 'NAME']);
        expect(data.fieldCaptions).toEqual(['SMID', '名称']);
        done();
      }
    });
  });

  it('getDataFeatures by keyWord', done => {
    const service = new iServerRestService('url', { hasGeometry: true });
    service.getDataFeatures(
      { datasetName: 'District_pt', dataSourceName: 'China', dataUrl: 'http://fakeiserver/rest/data' },
      { keyWord: 'A' }
    );
    service.on({
      getdatasucceeded: data => {
        expect(data.fields).toEqual(['SMID', 'NAME']);
        expect(data.fieldCaptions).toEqual(['SMID', '名称']);
        expect(mockPostParams).toMatch(/'attributeFilter':"NAME LIKE '%25A%25'/);
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

  it('transformFeatures', done => {
    const epsgCode = 'EPSG:4548';
    const wkt = `PROJCS["China_2000_3_DEGREE_GK_Zone_39N",GEOGCS["GCS_China_2000",DATUM["D_China_2000",SPHEROID["CGCS2000",6378137.0,298.257222101,AUTHORITY["EPSG","7044"]]],PRIMEM["Greenwich",0.0,AUTHORITY["EPSG","8901"]],UNIT["DEGREE",0.017453292519943295],AUTHORITY["EPSG","4490"]],PROJECTION["Transverse_Mercator",AUTHORITY["EPSG","9807"]],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",117.0],PARAMETER["Latitude_Of_Origin",0.0],PARAMETER["Scale_Factor",1.0],UNIT["METER",1.0],AUTHORITY["EPSG","4548"]]`;
    registerProjection(epsgCode, wkt);
    expect(getProjection(epsgCode)).not.toBeUndefined();
    const features = [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [478591, 3734142]
        },
        properties: {}
      }
    ];
    const result = transformFeatures(4548, features);
    expect(result).toEqual(features);
    expect(result[0].geometry.coordinates).toEqual([116.76898148293563, 33.733651143352695]);
    done();
  });
});

