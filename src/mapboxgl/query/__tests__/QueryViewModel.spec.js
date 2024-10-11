import QueryViewModel from '../QueryViewModel';
import { FetchRequest } from 'vue-iclient/static/libs/iclient-common/iclient-common';
import RestDataParameter from '@types_common/RestDataParameter';
import {
  REST_DATA_FIELDS_RESULT,
  dataset_data,
  prj_data,
  iportal_content,
  fakeDataServiceResult,
  fakeMapServiceResult,
  datas
} from '@mocks/services';
import Map from '@mocks/map';

describe('QueryViewMode', () => {
  const highlightStyle = {
    line: {
      paint: {
        'line-width': 3,
        'line-color': '#01ffff',
        'line-opacity': 1
      }
    },
    circle: {
      paint: {
        'circle-color': '#01ffff',
        'circle-opacity': 0.6,
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#01ffff',
        'circle-stroke-opacity': 1
      }
    },
    fill: {
      paint: {
        'fill-color': '#01ffff',
        'fill-opacity': 0.6,
        'fill-outline-color': '#01ffff'
      }
    },
    stokeLine: {
      paint: {
        'line-width': 3,
        'line-color': '#01ffff',
        'line-opacity': 1
      }
    }
  };

  const options = {
    restData: [
      new RestDataParameter({
        url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
        attributeFilter: 'SmID>0',
        maxFeatures: 30,
        dataName: ['World:Countries'],
        queryMode: 'KEYWORD'
      })
    ],
    highlightStyle
  };
  let mapEvents = {},
    map;
  beforeEach(() => {
    const mockImplementationCb = url => {
      if (url.includes('/123')) {
        return Promise.resolve(new Response(JSON.stringify(datas)));
      }
      if (url.includes('/content')) {
        return Promise.resolve(new Response(JSON.stringify(iportal_content)));
      }
      if (url.includes('/fields')) {
        return Promise.resolve(new Response(JSON.stringify(REST_DATA_FIELDS_RESULT)));
      }
      if (url.includes('/prjCoordSys')) {
        return Promise.resolve(new Response(JSON.stringify(prj_data)));
      }
      if (url.includes('/queryResults')) {
        return Promise.resolve(new Response(JSON.stringify(fakeMapServiceResult)));
      }
      if (url.includes('/featureResults')) {
        return Promise.resolve(new Response(JSON.stringify(fakeDataServiceResult)));
      }
      return Promise.resolve(new Response(JSON.stringify(dataset_data)));
    };
    jest.spyOn(FetchRequest, 'get').mockImplementation(mockImplementationCb);
    jest.spyOn(FetchRequest, 'post').mockImplementation(mockImplementationCb);
    mapEvents = {};
    map = {
      on: (type, cb) => {
        mapEvents[type] = cb;
      },
      off: type => {
        delete mapEvents[type];
      }
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('listen map click', done => {
    const viewModel = new QueryViewModel(options);
    const map = new Map({
      style: { center: [0, 0], zoom: 1, layers: [], sources: {} }
    });
    viewModel.setMap({ map });
    viewModel.on('getfeatureinfosucceeded', ({ featureInfo }) => {
      expect(featureInfo.info.length).toBeGreaterThan(0);
      done();
    });
    map.fire('click', { target: map, point: { x: 10, y: 5 } });
  });
});

