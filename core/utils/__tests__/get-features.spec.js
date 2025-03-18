import getFeatures from '../get-features';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import iServerRestService from 'vue-iclient-core/utils/iServerRestService';
import { FetchRequest } from 'vue-iclient-static/libs/iclient-common/iclient-common';

describe('getFeatures test', () => {
  const dataInfo = {
    withCredentials: false,
    epsgCode: 3857,
    displayName: 'restdata-China:District_pt',
    name: 'China:District_pt',
    dataName: ['China:District_pt'],
    id: 'http://fakeiserver:8090/iserver/services/data-China400/rest/dataChina:District_pt',
    type: 'iServer',
    attributeFilter: '州',
    url: 'http://fakeiserver:8090/iserver/services/data-China400/rest/data',
    maxFeatures: 8,
    queryMode: 'KEYWORD',
    keyWord: '州',
    bounds: {
      _sw: {
        lng: -0.000280559546202844,
        lat: -0.0004290205747580024
      },
      _ne: {
        lng: 0.0022943611081505636,
        lat: 0.0007323759284022395
      }
    }
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('getStructureddata', done => {
    const result = {
      timeStamp: '2024-05-13T10:00:45Z',
      features: [
        {
          geometry: {
            coordinates: [
              [116.38050072430798, 39.94888011518407],
              [116.37993841640692, 39.94887730328765],
              [116.38050072430798, 39.94888011518407]
            ],
            type: 'LineString'
          },
          id: '1',
          type: 'Feature',
          properties: {
            SmID: 1,
            标准名称: '地铁二号线',
            smpid: 1
          }
        },
        {
          geometry: {
            coordinates: [
              [116.38050072430798, 39.94888011518407],
              [116.37993841640692, 39.94887730328765],
              [116.38050072430798, 39.94888011518407]
            ],
            type: 'LineString'
          },
          id: '5',
          type: 'Feature',
          properties: {
            SmID: 5,
            标准名称: '地铁一号线',
            smpid: 5
          }
        }
      ],
      numberReturned: 3,
      numberMatched: 3,
      type: 'FeatureCollection'
    };
    const fetchResource = {
      'https://fakeiportal.supermap.io/web/datas/1832028287/structureddata/ogc-features/collections/all/items.json?limit=5000':
        result
    };
    mockFetch(fetchResource);
    const dataset = {
      dataItemServices: [],
      withCredentials: true,
      displayName: 'ms_line-北京市轨道交通线路-打印',
      serviceStatus: 'DOES_NOT_INVOLVE',
      dataType: 'STRUCTUREDDATA',
      name: '北京市轨道交通线路-打印',
      preferContent: false,
      updateTime: '2024-05-10 10:25:14',
      id: '1832028287',
      type: 'iPortal',
      url: 'https://fakeiportal.supermap.io/web/datas/1832028287',
      mapTarget: 'map_1715590875444',
      maxFeatures: 8,
      attributeFilter: 'SmID>0'
    };
    getFeatures(dataset).then(data => {
      expect(data.features.length).toBe(2);
      done();
    });
  });

  it('getStructureddata pagination', done => {
    const result1 = {
      timeStamp: '2024-05-13T10:00:45Z',
      features: [],
      numberReturned: 5000,
      numberMatched: 8000,
      type: 'FeatureCollection'
    };

    for (let i = 0; i < 5000; i++) {
      result1.features.push({
        geometry: {},
        id: i,
        type: 'Feature'
      });
    }

    const result2 = {
      timeStamp: '2024-05-13T10:00:45Z',
      features: [],
      numberReturned: 5000,
      numberMatched: 8000,
      type: 'FeatureCollection'
    };

    for (let i = 0; i < 3000; i++) {
      result2.features.push({
        geometry: {},
        id: i,
        type: 'Feature'
      });
    }
    const fetchResource = {
      'https://fakeiportal.supermap.io/web/datas/1832028287/structureddata/ogc-features/collections/all/items.json?limit=5000':
        result1,
      'https://fakeiportal.supermap.io/web/datas/1832028287/structureddata/ogc-features/collections/all/items.json?limit=5000&offset=5000':
        result2
    };
    mockFetch(fetchResource);
    const dataset = {
      dataItemServices: [],
      withCredentials: true,
      displayName: 'ms_line-北京市轨道交通线路-打印',
      serviceStatus: 'DOES_NOT_INVOLVE',
      dataType: 'STRUCTUREDDATA',
      name: '北京市轨道交通线路-打印',
      preferContent: false,
      updateTime: '2024-05-10 10:25:14',
      id: '1832028287',
      type: 'iPortal',
      url: 'https://fakeiportal.supermap.io/web/datas/1832028287',
      mapTarget: 'map_1715590875444',
      maxFeatures: 8,
      attributeFilter: 'SmID>0'
    };
    getFeatures(dataset).then(data => {
      expect(data.features.length).toBe(8000);
      done();
    });
  });

  it('getStructureddata without dataType param', done => {
    const result1 = {
      timeStamp: '2024-05-13T10:00:45Z',
      features: [],
      numberReturned: 5000,
      numberMatched: 8000,
      type: 'FeatureCollection'
    };

    for (let i = 0; i < 5000; i++) {
      result1.features.push({
        geometry: {},
        id: i,
        type: 'Feature'
      });
    }

    const result2 = {
      timeStamp: '2024-05-13T10:00:45Z',
      features: [],
      numberReturned: 5000,
      numberMatched: 8000,
      type: 'FeatureCollection'
    };

    for (let i = 0; i < 3000; i++) {
      result2.features.push({
        geometry: {},
        id: i,
        type: 'Feature'
      });
    }

    const metadata = {
      type: 'STRUCTUREDDATA'
    };

    const fetchResource = {
      'https://fakeiportal.supermap.io/web/datas/1832028287?parentResType=DATA&parentResId=1832028287': metadata,
      'https://fakeiportal.supermap.io/web/datas/1832028287/structureddata/ogc-features/collections/all/items.json?limit=5000':
        result1,
      'https://fakeiportal.supermap.io/web/datas/1832028287/structureddata/ogc-features/collections/all/items.json?limit=5000&offset=5000':
        result2
    };
    mockFetch(fetchResource);
    const dataset = {
      dataItemServices: [],
      withCredentials: true,
      displayName: 'ms_line-北京市轨道交通线路-打印',
      serviceStatus: 'DOES_NOT_INVOLVE',
      name: '北京市轨道交通线路-打印',
      preferContent: false,
      updateTime: '2024-05-10 10:25:14',
      id: '1832028287',
      type: 'iPortal',
      url: 'https://fakeiportal.supermap.io/web/datas/1832028287',
      mapTarget: 'map_1715590875444',
      maxFeatures: 8,
      attributeFilter: 'SmID>0'
    };
    getFeatures(dataset).then(data => {
      expect(data.features.length).toBe(8000);
      done();
    });
  });

  it('iserver support bounds and keyWord', done => {
    let params;
    jest.spyOn(iServerRestService.prototype, 'getData').mockImplementation((param1, param2) => {
      params = param2;
    });
    getFeatures(dataInfo);
    expect(params).not.toBeUndefined();
    expect(params.bounds).toEqual(dataInfo.bounds);
    expect(params.keyWord).toBe(dataInfo.keyWord);
    done();
  });

  it('event featureisempty', done => {
    const fetchResource = {
      'http://fakeiserver:8090/iserver/services/data-China400/rest/data/datasources/China/datasets/District_pt/fields?returnAll=true':
        [
          {
            isRequired: false,
            defaultValue: '',
            name: 'NAME',
            caption: 'NAME',
            type: 'WTEXT',
            maxLength: 60,
            isZeroLengthAllowed: true,
            isSystemField: false
          }
        ],
      'http://fakeiserver:8090/iserver/services/data-China400/rest/data/featureResults?fromIndex=0&toIndex=7&returnContent=true':
        {
          datasetInfos: [],
          features: [],
          featureCount: 0,
          totalCount: 0
        }
    };
    const mockImplementationCb = url => {
      return new Promise((resolve) => {
        resolve(new Response(JSON.stringify(fetchResource[url])));
      });
    };
    jest.spyOn(FetchRequest, 'get').mockImplementation(mockImplementationCb);
    jest.spyOn(FetchRequest, 'post').mockImplementation(mockImplementationCb);
    getFeatures({ ...dataInfo, bounds: undefined }).then(data => {
      expect(data.type).toBe('featureisempty');
      done();
    });
  });

  it('event getdatafailed', done => {
    const fetchResource = {
      'http://fakeiserver:8090/iserver/services/data-China400/rest/data/datasources/China/datasets/District_pt/fields?returnAll=true':
        [
          {
            isRequired: false,
            defaultValue: '',
            name: 'NAME',
            caption: 'NAME',
            type: 'WTEXT',
            maxLength: 60,
            isZeroLengthAllowed: true,
            isSystemField: false
          }
        ]
    };
    const errorMsg = 'mock error';
    const mockImplementationCb = () => {
      return Promise.reject(errorMsg);
    };
    mockFetch(fetchResource);
    jest.spyOn(FetchRequest, 'post').mockImplementation(mockImplementationCb);
    getFeatures({ ...dataInfo, bounds: undefined }).catch(e => {
      expect(e.type).toBe('getdatafailed');
      expect(e.error).toBe(errorMsg);
      done();
    });
  });
});

