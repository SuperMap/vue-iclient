import { mount, config } from '@vue/test-utils';
import SelectLayer from '../SelectLayer.vue';

describe('SelectLayer.vue', () => {
  let wrapper;

  beforeEach(() => {
    config.mapLoad = false;
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    config.mapLoad = true;
    if (wrapper) {
      wrapper.destroy();
    }
  });

  const layerInfos = [
    { id: 'layer1', name: 'Point Layer', type: 'circle' },
    { id: 'layer2', name: 'Polygon Layer', type: 'fill' },
    { id: 'layer3', name: 'Line Layer', type: 'line' },
    { id: 'layer4', name: 'Symbol Layer', type: 'symbol' },
    { id: 'layer5', name: 'Unknown Layer', type: 'raster' }
  ];

  it('renders with default props', () => {
    wrapper = mount(SelectLayer);
    expect(wrapper.vm.isShow).toBe(true);
    expect(wrapper.vm.layerInfos).toEqual([]);
  });

  it('renders layer list', () => {
    wrapper = mount(SelectLayer, {
      propsData: { layerInfos, show: true }
    });
    const items = wrapper.findAll('.sm-component-popup__select-layer-item');
    expect(items.length).toBe(5);
    expect(items.at(0).find('.sm-component-layer-name').text()).toBe('Point Layer');
  });

  it('syncs isShow with show prop', async () => {
    wrapper = mount(SelectLayer, {
      propsData: { layerInfos, show: true }
    });
    expect(wrapper.vm.isShow).toBe(true);
    await wrapper.setProps({ show: false });
    expect(wrapper.vm.isShow).toBe(false);
  });

  it('emits close when close icon clicked', () => {
    wrapper = mount(SelectLayer, {
      propsData: { layerInfos }
    });
    wrapper.find('.sm-components-icon-close').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close').length).toBe(1);
  });

  it('emits select with layer id when item clicked', () => {
    wrapper = mount(SelectLayer, {
      propsData: { layerInfos }
    });
    wrapper.findAll('.sm-component-popup__select-layer-item').at(1).trigger('click');
    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')[0]).toEqual(['layer2']);
  });

  describe('getTypeIcon', () => {
    it('returns point icon for point-like layers', () => {
      wrapper = mount(SelectLayer, { propsData: { layerInfos: [] } });
      expect(wrapper.vm.getTypeIcon('symbol')).toBe('sm-components-icon-multi-point');
      expect(wrapper.vm.getTypeIcon('circle')).toBe('sm-components-icon-multi-point');
      expect(wrapper.vm.getTypeIcon('point-extrusion')).toBe('sm-components-icon-multi-point');
    });

    it('returns polygon icon for fill layers', () => {
      wrapper = mount(SelectLayer, { propsData: { layerInfos: [] } });
      expect(wrapper.vm.getTypeIcon('fill')).toBe('sm-components-icon-ploygon');
      expect(wrapper.vm.getTypeIcon('fill-extrusion')).toBe('sm-components-icon-ploygon');
    });

    it('returns line icon for line layers', () => {
      wrapper = mount(SelectLayer, { propsData: { layerInfos: [] } });
      expect(wrapper.vm.getTypeIcon('line')).toBe('sm-components-icon-line');
      expect(wrapper.vm.getTypeIcon('line-extrusion')).toBe('sm-components-icon-line');
    });

    it('returns empty string for unknown type', () => {
      wrapper = mount(SelectLayer, { propsData: { layerInfos: [] } });
      expect(wrapper.vm.getTypeIcon('raster')).toBe('');
    });
  });
});
