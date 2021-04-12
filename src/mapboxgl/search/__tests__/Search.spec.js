import { mount, createLocalVue } from '@vue/test-utils';
import SmWebMap from '../../web-map/WebMap';
import SmSearch from '../Search.vue';
import mapEvent from '@types_mapboxgl/map-event';
import RestMapParameter from '@types_common/RestMapParameter';
import RestDataParameter from '@types_common/RestDataParameter';
import iPortalDataParameter from '@types_common/iPortalDataParameter';
import AddressMatchParameter from '@types_common/AddressMatchParameter';
import { Icon, Input, message } from 'ant-design-vue';
const localVue = createLocalVue();
localVue.use(Input);
localVue.use(Icon);

localVue.prototype.$message = message;

describe('Search.vue', () => {
  let wrapper;
  let mapWrapper;

  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    mapWrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  //layername
  it('layerNames', (done) => {
    wrapper = mount(SmSearch, {
      localVue,
      propsData: {
        mapTarget: "map",
        layerNames: ["UNIQUE-民航数-0"]
      }
    });
    mapWrapper.vm.$on('load',() =>{
        wrapper.vm.$on('loaded', () => {
          expect(wrapper.vm.mapTarget).toBe('map');
          const spyquery = jest.spyOn(wrapper.vm, 'search');
          try {
            wrapper.find("input.sm-component-input").setValue("北京市");
            wrapper.find('.sm-component-search__search-icon').trigger('click');
            wrapper.vm.$nextTick(() => {
              expect(spyquery).toBeCalled();
              spyquery.mockReset();
              spyquery.mockRestore();
              done()
          })
          } catch (exception) {
            console.log("案例失败：" + exception.name + ':' + exception.message);
            expect(false).toBeTruthy();
            done();
          }
        });
    });
  });

  //onlineLocalSearch
  it('onlineLocalSearch', (done) => {
    wrapper = mount(SmSearch, {
      localVue,
      propsData: { 
        mapTarget: "map",
        layerNames: ["UNIQUE-民航数-0"],
        onlineLocalSearch:
        {
          enable: true,
          city: "北京市"
        }
      }
    });
    mapWrapper.vm.$on('load',() =>{
      wrapper.vm.$on('loaded', () => {
        expect(wrapper.vm.mapTarget).toBe('map');
        const spyquery = jest.spyOn(wrapper.vm, 'search');
        try {
          wrapper.find("input.sm-component-input").setValue("北京市");
          wrapper.find('.sm-component-search__search-icon').trigger('click');
          wrapper.vm.$nextTick(() => {
            expect(spyquery).toBeCalled();
            spyquery.mockReset();
            spyquery.mockRestore();
            done()
        })
        } catch (exception) {
          console.log("案例失败：" + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
  });
});

//restMap
  it('restMap', (done) => {
    wrapper = mount(SmSearch, {
      localVue,
      propsData: {
        layerNames: ["UNIQUE-民航数-0"],
        restMap: [
          new RestMapParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/map-world/rest/maps/World',
            layerName: 'Capitals@World.1'
          })
        ]
      }
    });
    mapWrapper.vm.viewModel.on({
      "addlayerssucceeded": () => {
        wrapper.vm.$on('loaded', () => {
          const spyquery = jest.spyOn(wrapper.vm, 'search');
          try {
            wrapper.find("input.sm-component-input").setValue("北京市");
            wrapper.find('.sm-component-search__search-icon').trigger('click');
            wrapper.vm.$nextTick(() => {
              expect(spyquery).toBeCalled();
              spyquery.mockReset();
              spyquery.mockRestore();
              done()
          })
           wrapper.vm.search('北京');
          } catch (exception) {
            console.log("案例失败：" + exception.name + ':' + exception.message);
            expect(false).toBeTruthy();
            done();
          }
        });
      }
    });
  });

  it('restData', (done) => {
    wrapper = mount(SmSearch, {
      localVue,
      propsData: {
        layerNames: ["UNIQUE-民航数-0"],
        restData: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            dataName: ['World:Countries']
          })
        ]
      }
    }); 
    mapWrapper.vm.viewModel.on({
      "addlayerssucceeded": () => {
        wrapper.vm.$on('loaded', () => {
          const spyquery = jest.spyOn(wrapper.vm, 'search');
          try {
            wrapper.find("input.sm-component-input").setValue("北京市");
            wrapper.find('.sm-component-search__search-icon').trigger('click');
            wrapper.vm.$nextTick(() => {
              expect(spyquery).toBeCalled();
              spyquery.mockReset();
              spyquery.mockRestore();
              done()
          })
           wrapper.vm.search('北京');
          } catch (exception) {
            console.log("案例失败：" + exception.name + ':' + exception.message);
            expect(false).toBeTruthy();
            done();
          }
        });
      }
    });
  });

  it('iportal data', (done) => {
    wrapper = mount(SmSearch, {
      localVue,
      propsData: {
        layerNames: ["UNIQUE-民航数-0"],
        iportalData: [
          new iPortalDataParameter({
            url: 'https://fakeiportal.supermap.io/iportal/web/datas/123'
          })
        ],
      }
    });
    mapWrapper.vm.viewModel.on({
      "addlayerssucceeded": () => {
        wrapper.vm.$on('loaded', () => {
          const spyquery = jest.spyOn(wrapper.vm, 'search');
          try {
            wrapper.find("input.sm-component-input").setValue("超图");
            wrapper.find('.sm-component-search__search-icon').trigger('click');
            wrapper.vm.$nextTick(() => {
              expect(spyquery).toBeCalled();
              spyquery.mockReset();
              spyquery.mockRestore();
              done()
          })
           wrapper.vm.search('超图');
          } catch (exception) {
            console.log("案例失败：" + exception.name + ':' + exception.message);
            expect(false).toBeTruthy();
            done();
          }
        });
      }
    });
  });

  it('addressMatch', (done) => {
    wrapper = mount(SmSearch, {
      localVue,
      propsData: {
        layerNames: ["UNIQUE-民航数-0"],
        addressMatch: [
          new AddressMatchParameter({
            url: 'https://fakeiserver.supermap.io/iserver/iserver/services/addressmatch-Address/restjsr/v1/address'
          })
        ]
      }
    });
    mapWrapper.vm.viewModel.on({
      "addlayerssucceeded": () => {
        wrapper.vm.$on('loaded', () => {
          const spyquery = jest.spyOn(wrapper.vm, 'search');
          try {
            wrapper.find("input.sm-component-input").setValue("超图");
            wrapper.find('.sm-component-search__search-icon').trigger('click');
            wrapper.vm.$nextTick(() => {
              expect(spyquery).toBeCalled();
              spyquery.mockReset();
              spyquery.mockRestore();
              done()
          })
           wrapper.vm.search('超图');
          } catch (exception) {
            console.log("案例失败：" + exception.name + ':' + exception.message);
            expect(false).toBeTruthy();
            done();
          }
        });
      }
    });
  });
});
