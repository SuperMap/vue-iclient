import getFeatures from '../get-features';
import iPortalDataService from '../iPortalDataService';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';

describe('getFeatures test', () => {

  it('getStructureddata', (done) => {
    const result = {
      "timeStamp": "2024-05-13T10:00:45Z",
      "features": [
        {
          "geometry": {
            "coordinates": [
              [
                116.38050072430798,
                39.94888011518407
              ],
              [
                116.37993841640692,
                39.94887730328765
              ],
              [
                116.38050072430798,
                39.94888011518407
              ]
            ],
            "type": "LineString"
          },
          "id": "1",
          "type": "Feature",
          "properties": {
            "SmID": 1,
            "标准名称": "地铁二号线",
            "smpid": 1
          }
        },
        {
          "geometry": {
            "coordinates": [
              [
                116.38050072430798,
                39.94888011518407
              ],
              [
                116.37993841640692,
                39.94887730328765
              ],
              [
                116.38050072430798,
                39.94888011518407
              ]
            ],
            "type": "LineString"
          },
          "id": "5",
          "type": "Feature",
          "properties": {
            "SmID": 5,
            "标准名称": "地铁一号线",
            "smpid": 5
          }
        }
      ],
      "numberReturned": 3,
      "numberMatched": 3,
      "type": "FeatureCollection"
    }
    const fetchResource = {
      'https://fakeiportal.supermap.io/web/datas/1832028287/structureddata/ogc-features/collections/all/items.json?limit=5000': result
    };
    mockFetch(fetchResource);
    const dataset = {
      "dataItemServices": [],
      "withCredentials": true,
      "displayName": "ms_line-北京市轨道交通线路-打印",
      "serviceStatus": "DOES_NOT_INVOLVE",
      "dataType": "STRUCTUREDDATA",
      "name": "北京市轨道交通线路-打印",
      "preferContent": false,
      "updateTime": "2024-05-10 10:25:14",
      "id": "1832028287",
      "type": "iPortal",
      "url": "https://fakeiportal.supermap.io/web/datas/1832028287",
      "mapTarget": "map_1715590875444",
      "maxFeatures": 8,
      "attributeFilter": "SmID>0"
    }
    getFeatures(dataset).then((data) => {
      expect(data.features.length).toBe(2);
      done();
    })
  });

  it('getStructureddata pagination', (done) => {
    const result1 = {
      "timeStamp": "2024-05-13T10:00:45Z",
      "features": [],
      "numberReturned": 5000,
      "numberMatched": 8000,
      "type": "FeatureCollection"
    }

    for (let i = 0; i < 5000; i++) {
      result1.features.push({
        "geometry": {},
        "id": i,
        "type": "Feature"
      })
    }

    const result2 = {
      "timeStamp": "2024-05-13T10:00:45Z",
      "features": [],
      "numberReturned": 5000,
      "numberMatched": 8000,
      "type": "FeatureCollection"
    }

    for (let i = 0; i < 3000; i++) {
      result2.features.push({
        "geometry": {},
        "id": i,
        "type": "Feature"
      })
    }
    const fetchResource = {
      'https://fakeiportal.supermap.io/web/datas/1832028287/structureddata/ogc-features/collections/all/items.json?limit=5000': result1,
      'https://fakeiportal.supermap.io/web/datas/1832028287/structureddata/ogc-features/collections/all/items.json?limit=5000&offset=5000': result2
    };
    mockFetch(fetchResource);
    const dataset = {
      "dataItemServices": [],
      "withCredentials": true,
      "displayName": "ms_line-北京市轨道交通线路-打印",
      "serviceStatus": "DOES_NOT_INVOLVE",
      "dataType": "STRUCTUREDDATA",
      "name": "北京市轨道交通线路-打印",
      "preferContent": false,
      "updateTime": "2024-05-10 10:25:14",
      "id": "1832028287",
      "type": "iPortal",
      "url": "https://fakeiportal.supermap.io/web/datas/1832028287",
      "mapTarget": "map_1715590875444",
      "maxFeatures": 8,
      "attributeFilter": "SmID>0"
    }
    getFeatures(dataset).then((data) => {
      expect(data.features.length).toBe(8000);
      done();
    })
  });
});
