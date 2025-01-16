import WebSceneViewModel from '../WebSceneViewModel.ts';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import sceneV1Datas from 'vue-iclient/test/unit/mocks/data/WebScene/v1.json';
import sceneV2Datas from 'vue-iclient/test/unit/mocks/data/WebScene/v2.json';
import flushPromises from 'flush-promises';

const Cesium = {
  when: {
    all: jest.fn()
  }
};
const viewer = {
  scene: {
    layers: {
      removeAll: jest.fn()
    },
    open: jest.fn()
  }
};
describe('WebSceneViewModel.spec', () => {
  it('version is 1.x', async (done) => {
    const fetchResource = {
      '/iportal/web/scenes/678840754.json': sceneV1Datas,
    };
    mockFetch(fetchResource);
    const viewModel = new WebSceneViewModel(Cesium, viewer, '/iportal/web/scenes/678840754');
    await flushPromises();
    expect(viewModel.sceneUrl).toBe('http://fakeiserver.supermap.io/iserver/services/3D-CBD/rest/realspace/datas/Ground_2%40CBD/config');
    done();
  });
  it('version is 2.x', async (done) => {
    const fetchResource = {
      '/iportal/web/scenes/219091390.json': sceneV2Datas,
    };
    mockFetch(fetchResource);
    const viewModel = new WebSceneViewModel(Cesium, viewer, '/iportal/web/scenes/219091390');
    await flushPromises();
    expect(viewModel.sceneUrl).toBe('http://fakeiserver.supermap.io/iserver/services/3D-CBD/rest/realspace/datas/Building%40CBD/config');
    done();
  });
  it('pass iserver url', (done) => {
    expect(() => {
      new WebSceneViewModel(Cesium, viewer, 'http://fakeiserver.supermap.io/iserver/services/3D-CBD/rest/realspace/scenes/CBD');
    }).not.toThrow();
    done();
  });
  it('do not pass url', (done) => {
    expect(() => {
      new WebSceneViewModel(Cesium, viewer, '');
    }).not.toThrow();
    done();
  });
});
