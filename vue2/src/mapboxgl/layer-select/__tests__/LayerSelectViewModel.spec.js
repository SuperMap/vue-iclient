import LayerSelectViewModel from '../LayerSelectViewModel';

describe('LayerSelectViewModel', () => {
  it('layersupdated', done => {
    const viewModel = new LayerSelectViewModel();
    const layerList = [
      {
        id: 'layer1',
        renderLayers: ['layer1'],
        renderSource: {},
        type: 'symbol'
      }
    ];
    const webmap = {
      getLayerList: () => layerList,
      on: jest.fn(),
      un: jest.fn()
    };
    const map = {}
    viewModel.once('layersupdated', ({ sourceList }) => {
      expect(sourceList).toEqual(layerList);
      viewModel.removed();
      expect(webmap.un).toHaveBeenCalled();
      done();
    });
    viewModel.setMap({ map, webmap });
  });
});

