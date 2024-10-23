import { mount } from '@vue/test-utils';
import SmMapPopup from '../MapPopup.vue';
import SmWebMap from '../../web-map/WebMap';

const columns = [
  { dataIndex: 'attribute', width: 80 },
  { dataIndex: 'attributeValue', width: 150 }
];
const data = [
  [
    { attribute: 'name', attributeValue: '福建省' },
    { attribute: 'childrenNum', attributeValue: 9 },
    { attribute: 'index', attributeValue: 25 }
  ],
  [
    { attribute: 'name', attributeValue: '福建省' },
    { attribute: 'childrenNum', attributeValue: 12 },
    { attribute: 'index', attributeValue: 123 }
  ]
];
describe('MapPopup.vue', () => {
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
    wrapper = mount(SmMapPopup, {
      propsData: {
        mapTarget: 'map',
        defaultIndex: 0,
        title: '图层1',
        lnglats: [
          [110, 30],
          [120, 31]
        ],
        data: data,
        columns: columns
      }
    });
    wrapper.vm.$nextTick();
    expect(wrapper.find('.sm-component-map-popup').exists()).toBe(true);
    expect(wrapper.find('.sm-component-map-popup__self-content').exists()).toBe(true);
    expect(wrapper.vm.currentIndex).toBe(0);
    expect(wrapper.vm.headerTitle).toBe('图层1');
    expect(wrapper.vm.tablePopupProps).toEqual({ data: data[0], columns: columns, showHeader: true, background: 'transparent', color: 'inherit' });

    done();
  });
  it('showIcon', done => {
    wrapper = mount(SmMapPopup, {
      propsData: {
        mapTarget: 'map',
        defaultIndex: 0,
        showIcon: true,
        lnglats: [
          [110, 30],
          [120, 31]
        ],
        data: data,
        columns: columns
      }
    });
    wrapper.vm.$nextTick();
    expect(wrapper.find('.sm-component-map-popup').exists()).toBe(true);
    expect(wrapper.find('.sm-component-map-popup__self-content').exists()).toBe(true);
    expect(wrapper.find('.icon').exists()).toBe(true);
    expect(wrapper.vm.showIcon).toBe(true);
    expect(wrapper.vm.headerTitle).toBe('1/2');
    done();
  });
  it('contentSlot', done => {
    wrapper = mount(SmMapPopup, {
      propsData: {
        mapTarget: 'map',
        defaultIndex: 0,
        showIcon: true,
        lnglats: [
          [110, 30],
          [120, 31]
        ],
        contentSlot: 'identify'
      },
      slots: {
        identify: '<div class="slot-test">test</div>' // 将匹配 `<slot name="FooBar" />`。
      }
    });
    wrapper.vm.$nextTick();
    expect(wrapper.find('.sm-component-map-popup').exists()).toBe(true);
    expect(wrapper.find('.sm-component-map-popup__self-content').exists()).toBe(false);
    expect(wrapper.find('.slot-test').exists()).toBe(true);

    done();
  });
  it('changeDefaultIndex', done => {
    wrapper = mount(SmMapPopup, {
      propsData: {
        mapTarget: 'map',
        defaultIndex: 0,
        showIcon: true,
        lnglats: [
          [110, 30],
          [120, 31]
        ],
        data: data,
        columns: columns
      }
    });
    wrapper.vm.$nextTick();
    wrapper.vm.$options.loaded();
    wrapper.vm.viewModel = wrapper.vm.$options.viewModel;
    wrapper.setProps({ defaultIndex: 1 });
    wrapper.vm.$nextTick();
    expect(wrapper.vm.showIcon).toBe(true);
    expect(wrapper.vm.headerTitle).toBe('2/2');
    expect(wrapper.vm.currentCoordinate).toEqual([120, 31]);
    expect(wrapper.vm.tablePopupProps).toEqual({ data: data[1], columns: columns, showHeader: true, background: 'transparent', color: 'inherit' });
    done();
  });
  it('trigger change index', done => {
    wrapper = mount(SmMapPopup, {
      propsData: {
        mapTarget: 'map',
        defaultIndex: 0,
        showIcon: true,
        lnglats: [
          [110, 30],
          [120, 31]
        ],
        data: data,
        columns: columns
      }
    });
    wrapper.vm.$nextTick();
    wrapper.vm.$options.loaded();
    wrapper.vm.viewModel = wrapper.vm.$options.viewModel;

    wrapper.vm.$on('change', index => {
      expect(index).toBe(1);
    });
    wrapper.find('.right-icon').trigger('click');
    expect(wrapper.vm.currentCoordinate).toEqual([120, 31]);
    expect(wrapper.vm.tablePopupProps).toEqual({ data: data[1], columns: columns, showHeader: true, background: 'transparent', color: 'inherit' });
    done();
  });
  it('change background', done => {
    wrapper = mount(SmMapPopup, {
      propsData: {
        mapTarget: 'map',
        defaultIndex: 0,
        showIcon: true,
        lnglats: [
          [110, 30],
          [120, 31]
        ],
        background:"#fff",
        data: data,
        columns: columns
      }
    });
    wrapper.vm.$nextTick();
    wrapper.vm.$options.loaded();
    
    wrapper.setProps({ background: "#333" });
    wrapper.vm.$nextTick();
    expect(wrapper.vm.tablePopupBgData).toBe('#333');
    done();
  });
});
