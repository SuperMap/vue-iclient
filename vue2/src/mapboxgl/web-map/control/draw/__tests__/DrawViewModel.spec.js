import DrawViewModel from '../DrawViewModel';
import drawEvent from 'vue-iclient-core/controllers/mapboxgl/types/DrawEvent';

describe('DrawViewModel', () => {
  it('setMap', done => {
    const viewModel = new DrawViewModel('Draw');
    expect(viewModel.componentName).toBe('Draw');
    const listenList = {};
    const mapInfo = {
      map: {
        center: [0, 0],
        on: jest.fn().mockImplementation((type, layerId, cb) => {
          listenList[type] = cb || layerId;
          listenList[type]({
            features: [
              {
                id: 1,
                type: 'feature',
                properties: { field: 'test', id: 1 },
                geometry: { coodinates: [], tpe: 'Point' }
              }
            ]
          });
        }),
        setFilter: jest.fn(),
        getPaintProperty: jest.fn()
      },
      mapTarget: 'map'
    };
    jest.spyOn(drawEvent, 'getDrawingState').mockReturnValue(true);
    const draw = {
      changeMode: jest.fn(),
      delete: jest.fn(),
      getSelectedIds: jest.fn().mockReturnValue([1])
    };
    jest.spyOn(drawEvent, 'getDraw').mockReturnValue(draw);
    viewModel.setMap(mapInfo);
    expect(viewModel.map).toEqual(mapInfo.map);
    expect(viewModel.mapTarget).toBe(mapInfo.mapTarget);
    expect(listenList['draw.create']).toBeTruthy();
    expect(listenList['draw.selectionchange']).toBeTruthy();
    expect(listenList['mouseout']).toBeTruthy();
    expect(listenList['mouseover']).toBeTruthy();
    expect(viewModel.draw).toEqual(draw);
    expect(viewModel.featureIds).toEqual([1]);
    done();
  });
});
