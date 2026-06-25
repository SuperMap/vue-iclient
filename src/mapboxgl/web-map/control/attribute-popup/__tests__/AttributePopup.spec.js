import { mount, config } from '@vue/test-utils';
import SmAttributePopup from '../AttributePopup.vue';
import AttributePopup from '../index';
describe('AttributePopup.vue', () => {
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

  it('render index correctly', () => {
    wrapper = mount(AttributePopup);
    expect(wrapper.find('.sm-component-attribute-popup').exists()).toBeTruthy();
  });

  it('renders with default props', () => {
    wrapper = mount(AttributePopup);
    expect(wrapper.vm.clickTolerance).toBe(5);
    expect(wrapper.vm.multiSelect).toBe(false);
    expect(wrapper.vm.useMapPopup).toBe(true);
    expect(wrapper.vm.popupInfos).toEqual([]);
    expect(wrapper.vm.popupConfig).toEqual({});
  });

  it('renders with custom props', () => {
    wrapper = mount(SmAttributePopup, {
      propsData: {
        clickTolerance: 10,
        multiSelect: true,
        popupConfig: {
          width: '400px',
          height: '300px'
        }
      }
    });
    expect(wrapper.vm.clickTolerance).toBe(10);
    expect(wrapper.vm.multiSelect).toBe(true);
  });

  it('show popup content when isRender is true', async () => {
    wrapper = mount(AttributePopup, {
      propsData: {
        popupConfig: {
          width: '400px'
        }
      }
    });
    wrapper.vm.isRender = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.content').exists()).toBeTruthy();
  });

  it('hide popup content when isRender is false', async () => {
    wrapper = mount(AttributePopup);
    wrapper.vm.isRender = false;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.sm-component-attribute-popup').isVisible()).toBe(false);
  });

  it('showSelectLayer works correctly', async () => {
    wrapper = mount(AttributePopup);
    // showSelectLayer 默认为 true
    expect(wrapper.vm.showSelectLayer).toBe(true);
    // 当 clickedLayers 有值时，SelectLayer 组件会显示
    wrapper.vm.clickedLayers = ['layer1'];
    await wrapper.vm.$nextTick();
    expect(wrapper.find({ name: 'SmSelectLayer' }).exists()).toBeTruthy();
    // handleClose 会隐藏 SelectLayer
    wrapper.vm.handleClose();
    expect(wrapper.vm.showSelectLayer).toBe(false);
  });

  it('changeIndex updates currentIndex', async () => {
    wrapper = mount(AttributePopup, {
      propsData: {
        popupInfos: [
          { title: 'Layer1' },
          { title: 'Layer2' },
          { title: 'Layer3' }
        ]
      }
    });
    // 设置 allPopupDatas 以启用 enablePopupDatasLength
    wrapper.vm.allPopupDatas = [
      [{ properties: { id: 1 } }],
      [{ properties: { id: 2 } }],
      [{ properties: { id: 3 } }]
    ];
    wrapper.vm.currentIndex = 1;
    await wrapper.vm.$nextTick();
    // changeIndex(+1) 应该在边界内
    wrapper.vm.changeIndex(1);
    expect(wrapper.vm.currentIndex).toBe(2);
    // changeIndex(-1) 从 2 回到 1
    wrapper.vm.changeIndex(-1);
    expect(wrapper.vm.currentIndex).toBe(1);
  });

  it('changeIndex does not go below 0', async () => {
    wrapper = mount(AttributePopup);
    // 设置 allPopupDatas 以启用 enablePopupDatasLength
    wrapper.vm.allPopupDatas = [
      [{ properties: { id: 1 } }]
    ];
    wrapper.vm.currentIndex = 0;
    await wrapper.vm.$nextTick();
    // changeIndex(-1) 不应该改变 currentIndex
    wrapper.vm.changeIndex(-1);
    expect(wrapper.vm.currentIndex).toBe(0);
  });

  it('changeIndex does not exceed max index', async () => {
    wrapper = mount(AttributePopup);
    // 设置 allPopupDatas
    wrapper.vm.allPopupDatas = [
      [{ properties: { id: 1 } }],
      [{ properties: { id: 2 } }]
    ];
    wrapper.vm.currentIndex = 1; // 最大索引
    await wrapper.vm.$nextTick();
    // changeIndex(+1) 不应该改变 currentIndex
    wrapper.vm.changeIndex(1);
    expect(wrapper.vm.currentIndex).toBe(1);
  });

  it('handleClose resets state', async () => {
    wrapper = mount(AttributePopup);
    wrapper.vm.showSelectLayer = true;
    wrapper.vm.currentLayerId = 'test-layer';
    wrapper.vm.handleClose();
    expect(wrapper.vm.showSelectLayer).toBe(false);
    expect(wrapper.vm.currentLayerId).toBe('');
  });

  it('loaded method calls lodedCb', async () => {
    wrapper = mount(AttributePopup);
    const lodedCbSpy = jest.spyOn(wrapper.vm, 'lodedCb');
     const mockWebmap = {
      _handler: {
        getPopupInfos: jest.fn().mockReturnValue([{ title: 'test' }])
      }
    };

    wrapper.vm.viewModel = {
      webmap: mockWebmap,
      setTargetLayers: jest.fn(),
      clear: jest.fn()
    };
    wrapper.vm.$options.lodedCb = wrapper.vm.lodedCb;
     wrapper.vm.$options.loaded();
    expect(lodedCbSpy).toHaveBeenCalled();
  });

  it('lodedCb removes popup and sets layer ids', async () => {
    wrapper = mount(AttributePopup);
    wrapper.vm.removePopup = jest.fn();
    wrapper.vm.removed = jest.fn();
    wrapper.vm.setLayerIds = jest.fn();

    const mockWebmap = {
      _handler: {
        getPopupInfos: jest.fn().mockReturnValue([{ title: 'test' }])
      }
    };

    wrapper.vm.viewModel = {
      webmap: mockWebmap,
      clear: jest.fn()
    };

    wrapper.vm.lodedCb(mockWebmap);

    expect(wrapper.vm.removePopup).toHaveBeenCalled();
    expect(wrapper.vm.removed).toHaveBeenCalled();
    expect(mockWebmap._handler.getPopupInfos).toHaveBeenCalled();
    expect(wrapper.vm.setLayerIds).toHaveBeenCalledWith(wrapper.vm.highlightLayerIds, wrapper.vm.sourceLayers);
  });

  it('lodedCb uses default webmap when no argument passed', async () => {
    wrapper = mount(AttributePopup);
    wrapper.vm.removePopup = jest.fn();
    wrapper.vm.removed = jest.fn();
    wrapper.vm.setLayerIds = jest.fn();

    const mockWebmap = {
      _handler: {
        getPopupInfos: jest.fn().mockReturnValue([{ title: 'test' }])
      }
    };

    wrapper.vm.viewModel = {
      webmap: mockWebmap,
      clear: jest.fn()
    };

    wrapper.vm.lodedCb();

    expect(mockWebmap._handler.getPopupInfos).toHaveBeenCalled();
  });
});
