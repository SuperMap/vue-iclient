import { mount } from '@vue/test-utils';
import SmLayerHighlight from '../LayerHighlight.vue';
import SmMapPopup from '../../map-popup/MapPopup.vue';
import SmWebMap from '../../web-map/WebMap';

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

describe('LayerHighlight.vue', () => {
  let wrapper, mapWrapper;
  beforeAll(() => {
    mapWrapper = mount(SmWebMap, {
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
  });
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
      mapWrapper.destroy();
    }
  });

  it('render default correctly', done => {
    wrapper = mount(SmLayerHighlight, {
      propsData: {
        mapTarget: 'map',
        uniqueName: 'Test',
        layers: ['layer1'],
        highlightStyle
      }
    });
    wrapper.vm.$nextTick();
    expect(wrapper.find(SmMapPopup).exists()).toBe(true);
    expect(wrapper.vm.tableColumns.length).toBe(2);
    const style = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
    expect(wrapper.vm.columnStyle.keyStyle).toEqual({ ...style, maxWidth: '160px' });
    expect(wrapper.vm.columnStyle.valueStyle).toEqual({ ...style, maxWidth: '300px' });
    done();
  });

  it('set layers', done => {
    wrapper = mount(SmLayerHighlight, {
      propsData: {
        mapTarget: 'map',
        uniqueName: 'Test',
        highlightStyle: {}
      }
    });
    const setSpy = jest.spyOn(wrapper.vm.viewModel, 'setTargetLayers');
    const clearSpy = jest.spyOn(wrapper.vm.viewModel, 'clear');
    wrapper.setProps({ layers: ['layer1'] });
    wrapper.vm.$nextTick();
    expect(setSpy).toBeCalled();
    expect(clearSpy).toBeCalled();
    done();
  });

  it('set highlightStyle', done => {
    wrapper = mount(SmLayerHighlight, {
      propsData: {
        mapTarget: 'map',
        uniqueName: 'Test',
        highlightStyle: {}
      }
    });
    const setSpy = jest.spyOn(wrapper.vm.viewModel, 'setHighlightStyle');
    wrapper.setProps({ highlightStyle });
    wrapper.vm.$nextTick();
    expect(setSpy).toBeCalled();
    done();
  });

  it('set multiSelection', done => {
    wrapper = mount(SmLayerHighlight, {
      propsData: {
        mapTarget: 'map',
        uniqueName: 'Test',
        highlightStyle: {},
        multiSelection: false
      }
    });
    const setSpy = jest.spyOn(wrapper.vm.viewModel, 'setMultiSelection');
    wrapper.setProps({ multiSelection: true });
    wrapper.vm.$nextTick();
    expect(setSpy).toBeCalled();
    done();
  });

  it('set featureFieldsMap', done => {
    wrapper = mount(SmLayerHighlight, {
      propsData: {
        mapTarget: 'map',
        uniqueName: 'Test',
        highlightStyle: {}
      }
    });
    const setSpy = jest.spyOn(wrapper.vm.viewModel, 'setFeatureFieldsMap');
    wrapper.setProps({ featureFieldsMap: {} });
    wrapper.vm.$nextTick();
    expect(setSpy).toBeCalled();
    done();
  });

  it('set featureFieldsMap', done => {
    wrapper = mount(SmLayerHighlight, {
      propsData: {
        mapTarget: 'map',
        uniqueName: 'Test',
        highlightStyle: {}
      }
    });
    const setSpy = jest.spyOn(wrapper.vm.viewModel, 'setDisplayFieldsMap');
    wrapper.setProps({ displayFieldsMap: {} });
    wrapper.vm.$nextTick();
    expect(setSpy).toBeCalled();
    done();
  });

  it('set clickTolerance', done => {
    wrapper = mount(SmLayerHighlight, {
      propsData: {
        mapTarget: 'map',
        uniqueName: 'Test',
        highlightStyle: {}
      }
    });
    const setSpy = jest.spyOn(wrapper.vm.viewModel, 'setClickTolerance');
    wrapper.setProps({ clickTolerance: 8 });
    wrapper.vm.$nextTick();
    expect(setSpy).toBeCalled();
    done();
  });

  it('events', done => {
    wrapper = mount(SmLayerHighlight, {
      propsData: {
        mapTarget: 'map',
        uniqueName: 'Test',
        highlightStyle: {}
      },
      stubs: ['SmMapPopup']
    });
    const params = {
      features: [
        { properties: { name: '11' }, geometry: { type: 'Point', coordinates: [0, 0] } },
        { properties: { name: '22' }, geometry: { type: 'Point', coordinates: [1, 2] } }
      ],
      popupInfos: [
        [{ attribute: 'key1', attributeValue: 'value1', alias: 'alias1', slotName: 1 }],
        [{ attribute: 'key2', attributeValue: 'value2', alias: 'alias2', slotName: 2 }]
      ],
      lnglats: [
        [0, 0],
        [1, 2]
      ]
    };
    wrapper.vm.viewModel.fire('mapselectionchanged', params);
    expect(wrapper.emitted().mapselectionchanged).toBeTruthy();
    expect(wrapper.vm.allPopupDatas).toEqual(params.popupInfos);
    expect(wrapper.vm.lnglats).toEqual(params.lnglats);
    expect(wrapper.vm.currentIndex).toBe(1);
    done();
  });

  it('mapopup change index', done => {
    wrapper = mount(SmLayerHighlight, {
      propsData: {
        mapTarget: 'map',
        uniqueName: 'Test',
        layers: ['layer1'],
        highlightStyle
      }
    });
    wrapper.vm.$nextTick();
    const mapPopupNode = wrapper.find(SmMapPopup).exists();
    expect(mapPopupNode).toBe(true);
    expect(wrapper.vm.currentIndex).toBe(0);
    wrapper.vm.handleChange(1);
    expect(wrapper.vm.currentIndex).toBe(1);
    expect(wrapper.emitted().mapselectionchanged.length).toBe(1);
    done();
  });
});
