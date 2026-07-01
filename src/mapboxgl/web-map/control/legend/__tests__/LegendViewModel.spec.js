import LegendViewModel from '../LegendViewModel.js';

describe('LegendViewModel', () => {
  let legendVM;
  const ImageBak = Image;
  const documentBak = document;

  beforeEach(function() {
    document.getElementById = function() {
      return {
        getContext: function() {
          return {
            arc: jest.fn(),
            fill: jest.fn(),
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            clearRect: jest.fn(),
            beginPath: jest.fn(),
            closePath: jest.fn(),
            setLineDash: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
            drawImage: jest.fn(),
            createPattern: jest.fn(),
            createLinearGradient: function() {
              return {
                addColorStop: jest.fn()
              };
            }
          };
        }
      };
    };
  });

  beforeAll(() => {
    Object.defineProperty(Image.prototype, 'onload', {
      get: function () {
        return this._onload;
      },
      set: function (fn) {
        this._onload = fn;
      }
    });
  });

  afterAll(() => {
    global.Image = ImageBak;
    global.document = documentBak;
  });

  it('getStyle returns styles for given layerName', () => {
    legendVM = new LegendViewModel();
    const mockWebmap = {
      on: jest.fn(),
      getAppreciableLayers: () => [{ id: 'layer1', visible: true }],
      getLegendInfo: () => [
        { layerId: 'layer1', styleGroup: [{ color: 'red' }] },
        { layerId: 'layer2', styleGroup: [{ color: 'blue' }] }
      ]
    };
    legendVM.setMap({ webmap: mockWebmap });
    const result = legendVM.getStyle('layer1');
    expect(result).toHaveLength(1);
    expect(result[0].layerId).toBe('layer1');
  });

  it('getStyle returns empty array when layer not visible', () => {
    legendVM = new LegendViewModel();
    const mockWebmap = {
      on: jest.fn(),
      getAppreciableLayers: () => [{ id: 'layer1', visible: false }],
      getLegendInfo: () => [
        { layerId: 'layer1', styleGroup: [{ color: 'red' }] }
      ]
    };
    legendVM.setMap({ webmap: mockWebmap });
    const result = legendVM.getStyle('layer1');
    expect(result).toHaveLength(0);
  });

  it('getStyle returns empty array when styleGroup is empty', () => {
    legendVM = new LegendViewModel();
    const mockWebmap = {
      on: jest.fn(),
      getAppreciableLayers: () => [{ id: 'layer1', visible: true }],
      getLegendInfo: () => [
        { layerId: 'layer1', styleGroup: [] }
      ]
    };
    legendVM.setMap({ webmap: mockWebmap });
    const result = legendVM.getStyle('layer1');
    expect(result).toHaveLength(0);
  });

  it('getLayerNamesFromWebmap returns layer ids with showLegend true', () => {
    legendVM = new LegendViewModel();
    const mockWebmap = {
      on: jest.fn(),
      getLegendInfos: () => [
        { id: 'layer1', showLegend: true },
        { id: 'layer2', showLegend: false },
        { id: 'layer3', showLegend: true }
      ]
    };
    legendVM.setMap({ webmap: mockWebmap });
    const result = legendVM.getLayerNamesFromWebmap();
    expect(result).toEqual(['layer1', 'layer3']);
  });

  it('getLayerNamesFromWebmap returns empty array when no showLegend', () => {
    legendVM = new LegendViewModel();
    const mockWebmap = {
      on: jest.fn(),
      getLegendInfos: () => [
        { id: 'layer1', showLegend: false },
        { id: 'layer2', showLegend: false }
      ]
    };
    legendVM.setMap({ webmap: mockWebmap });
    const result = legendVM.getLayerNamesFromWebmap();
    expect(result).toEqual([]);
  });

  it('setMap registers layerupdatechanged event', () => {
    legendVM = new LegendViewModel();
    const mockWebmap = {
      on: jest.fn(),
      un: jest.fn(),
      getAppreciableLayers: () => [],
      getLegendInfo: () => []
    };
    legendVM.setMap({ webmap: mockWebmap });
    expect(mockWebmap.on).toHaveBeenCalledWith({
      layerupdatechanged: legendVM._layersUpdatedHandler
    });
  });

  it('removed unbinds layerupdatechanged event', () => {
    legendVM = new LegendViewModel();
    const mockWebmap = {
      on: jest.fn(),
      un: jest.fn(),
      getAppreciableLayers: () => [],
      getLegendInfo: () => []
    };
    legendVM.setMap({ webmap: mockWebmap });
    legendVM.removed();
    expect(mockWebmap.un).toHaveBeenCalledWith({
      layerupdatechanged: legendVM._layersUpdatedHandler
    });
  });

  it('_layersUpdatedHandler fires layersupdated event', () => {
    legendVM = new LegendViewModel();
    const callback = jest.fn();
    legendVM.on('layersupdated', callback);
    legendVM._layersUpdatedHandler();
    expect(callback).toHaveBeenCalled();
  });
});
