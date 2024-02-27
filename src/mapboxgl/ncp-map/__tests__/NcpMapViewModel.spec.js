import NcpMapViewModel from '../NcpMapViewModel.ts';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import flushPromises from 'flush-promises';
import iportal_serviceProxy from '../../../../test/unit/mocks/data/iportal_serviceProxy.json';
import markerLayer from 'vue-iclient/test/unit/mocks/data/WebMap/markerLayer';

const mapOptions = {
  container: 'map',
  center: {
    lng: 104.93846582803894,
    lat: 33.37080662210445
  },
  zoom: 3,
  bearing: 0,
  pitch: 0,
  interactive: true,
  style: {
    version: 8,
    sources: {
      中国地图: {
        type: 'raster',
        tiles: [
          'https://maptiles.supermapol.com/iserver/services/map_China/rest/maps/China_Dark/zxyTileImage.png?z={z}&x={x}&y={y}'
        ],
        tileSize: 256
      }
    },
    layers: [
      {
        id: '中国地图',
        source: '中国地图',
        type: 'raster',
        minzoom: 0,
        maxzoom: 22
      }
    ]
  },
  rasterTileSize: 256,
  preserveDrawingBuffer: true
};
const dataOptions = {
  name: '全省确诊人数',
  proxyUrl: '',
  url: ''
};

describe('NcpMapViewModel.spec', () => {
  it('initNcpMap', () => {
    expect(() => {
      new NcpMapViewModel('', dataOptions, mapOptions);
    }).not.toThrow();
  });

  it('set props', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/4845656956/map.json': markerLayer
    };
    mockFetch(fetchResource);
    const callback = jest.fn();
    const viewModel = new NcpMapViewModel('', dataOptions, mapOptions);
    await flushPromises();
    await viewModel.setCenter({
      x: 11615300.701720804,
      y: 4436879.386230171,
      lat: 33.37080662210445,
      lng: 104.93846582803894
    });
    await viewModel.setZoom(10);
    await viewModel.setMaxBounds([
      [0, 0],
      [180, 180]
    ]);
    await viewModel.setBearing(10);
    await viewModel.setPitch(6);
    expect(callback.mock.called).toBeTruthy;
    setTimeout(() => {
      expect(callback.mock.called).toBeTruthy;
      expect(viewModel.mapOptions.center).toStrictEqual({
        x: 11615300.701720804,
        y: 4436879.386230171,
        lat: 33.37080662210445,
        lng: 104.93846582803894
      });
      expect(viewModel.mapOptions.zoom).toBe(10);
      expect(viewModel.mapOptions.maxBounds).toStrictEqual([
        [0, 0],
        [180, 180]
      ]);
      expect(viewModel.mapOptions.pitch).toBe(6);
      done();
    }, 100);
  });
});
