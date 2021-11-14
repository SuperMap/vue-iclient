import { mount, createLocalVue, config } from '@vue/test-utils';
import SmTdtRoute from '../TdtRoute.vue';
import { Input } from 'ant-design-vue';
import mockAxios from 'axios';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

const localVue = createLocalVue();
localVue.use(Input);
describe('TdtRoute.vue', () => {
  let wrapper;
  let mapWrapper;

  beforeAll(async () => {
    config.mapLoad = false;
    mapWrapper = await createEmptyMap();
  });

  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render', async done => {
    wrapper = mount(SmTdtRoute, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: false
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change route', async done => {
    wrapper = mount(SmTdtRoute, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: false
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.find('.sm-component-tdtRoute').exists()).toBe(true);
    const btnEle = wrapper.find('.bus-icon');
    btnEle.trigger('click');
    wrapper.vm.$nextTick();
    expect(wrapper.vm.routeActive).toBe('bus');
    done();
  });

  it('switch route', async done => {
    wrapper = mount(SmTdtRoute, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: false
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.find('.sm-component-tdtRoute').exists()).toBe(true);
    const iconEle = wrapper.find('.switch-route');
    iconEle.trigger('click');
    wrapper.vm.$nextTick();
    done();
  });

  it('search route', async done => {
    mockAxios.mockImplementation(e => {
      if (e.url === 'https://api.tianditu.gov.cn/search') {
        return Promise.resolve({
          data: {
            pois: [
              {
                address: '站东路1号',
                eaddress: '',
                ename: '',
                hotPointID: '81442006120E2708',
                lonlat: '104.070792 30.69922',
                name: '成都站',
                phone: '028-83322858'
              },
              {
                address: '邛崃山路333',
                eaddress: '',
                ename: '',
                hotPointID: 'C146608747031589',
                lonlat: '104.139088 30.63114',
                name: '成都东站',
                phone: '028-84116089'
              },
              {
                address: '四川省成都市武侯区',
                eaddress: '',
                ename: '',
                hotPointID: '81104484B023A886',
                lonlat: '104.066048 30.6083',
                name: '成都南站',
                phone: '028-85136245'
              }
            ],
            prompt: [
              {
                admins: [
                  {
                    adminCode: 156510100,
                    name: '成都市'
                  }
                ],
                type: 4
              }
            ]
          }
        });
      }
    });
    wrapper = mount(SmTdtRoute, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: false,
        data: {
          tk: '1d109683f4d84198e37a38c442d68311'
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.find('.sm-component-tdtRoute').exists()).toBe(true);
    expect(wrapper.find('.sm-component-input').exists()).toBe(true);
    const startInputEles = wrapper.find('.start-route input');
    startInputEles.setValue('成都');
    expect(wrapper.vm.start).toBe('成都');
    const endInputEles = wrapper.find('.end-route input');
    endInputEles.setValue('北京');
    expect(wrapper.vm.end).toBe('北京');
    const searchBtn = wrapper.find('.search-btn .sm-component-btn');
    searchBtn.trigger('click');
    wrapper.vm.$nextTick();
    setTimeout(() => {
      // expect(wrapper.find('.sm-component-tdtPointsResults').exists()).toBe(true);
      done();
    }, 500);
  });

  it('clear route', async done => {
    wrapper = mount(SmTdtRoute, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: false,
        data: {
          tk: '1d109683f4d84198e37a38c442d68311',
          carUrl: 'https://api.tianditu.gov.cn/drive',
          busUrl: 'https://api.tianditu.gov.cn/transit',
          searchUrl: 'https://api.tianditu.gov.cn/search'
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    const startInputEles = wrapper.find('.start-route input');
    startInputEles.setValue('成都');
    expect(wrapper.vm.start).toBe('成都');
    const endInputEles = wrapper.find('.end-route input');
    endInputEles.setValue('北京');
    expect(wrapper.vm.end).toBe('北京');
    expect(wrapper.find('.clear-route').exists()).toBe(true);
    const clearBtnEle = wrapper.find('.clear-route');
    clearBtnEle.trigger('click');
    wrapper.vm.$nextTick();
    expect(wrapper.vm.start).toBe('');
    expect(wrapper.vm.end).toBe('');
    done();
  });

  it('setData', async done => {
    wrapper = mount(SmTdtRoute, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: false,
        data: {
          carUrl: 'https://api.tianditu.gov.cn/drive',
          busUrl: 'https://api.tianditu.gov.cn/transit',
          searchUrl: 'https://api.tianditu.gov.cn/search',
          tk: '5465465464564564588888999999'
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    const setDataSpy = jest.spyOn(wrapper.vm.viewModel, 'setData');
    wrapper.setProps({
      data: {
        carUrl: 'https://api.tianditu.gov.cn/drive',
        busUrl: 'https://api.tianditu.gov.cn/transit',
        searchUrl: 'https://api.tianditu.gov.cn/search',
        tk: '1d109683f4d84198e37a38c442d68311'
      }
    });
    expect(setDataSpy).toBeCalled();
    done();
  });
});
