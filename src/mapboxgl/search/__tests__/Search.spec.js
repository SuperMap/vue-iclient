import { mount, createLocalVue, config } from '@vue/test-utils';
import SmSearch from '../Search.vue';
import RestMapParameter from '@types_common/RestMapParameter';
import RestDataParameter from '@types_common/RestDataParameter';
import iPortalDataParameter from '@types_common/iPortalDataParameter';
import AddressMatchParameter from '@types_common/AddressMatchParameter';
import search_cityConfig from 'vue-iclient/test/unit/mocks/data/search_cityConfig.json';
import layerData from 'vue-iclient/test/unit/mocks/data/layerData.json';
import featuresInfo from 'vue-iclient/test/unit/mocks/data/featuresInfo.json';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import { Input, message } from 'ant-design-vue';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

const localVue = createLocalVue();
localVue.use(Input);
localVue.prototype.$message = message;

describe('Search.vue', () => {
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

  afterAll(() => {
    config.mapLoad = true;
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  it('layerNames', async done => {
    const fetchResource = {
      'https://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos.json?keywords=北京市&city=北京市&pageSize=10&pageNum=1&key=fvV2osxwuZWlY0wJb8FEb2i5':
        search_cityConfig
    };
    mockFetch(fetchResource);
    wrapper = mount(SmSearch, {
      localVue,
      propsData: {
        mapTarget: 'map',
        layerNames: ['UNIQUE-民航数-0']
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    const spyquery = jest.spyOn(wrapper.vm, 'search');
    wrapper.find('input.sm-component-input').setValue('北京市');
    wrapper.find('.sm-component-search__search-icon').trigger('click');
    wrapper.vm.$nextTick(() => {
      expect(spyquery).toBeCalled();
      done();
    });
  });

  it('onlineLocalSearch', async done => {
    const fetchResource = {
      'https://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos.json?keywords=北京市&city=北京市&pageSize=10&pageNum=1&key=fvV2osxwuZWlY0wJb8FEb2i5':
        search_cityConfig
    };
    mockFetch(fetchResource);
    wrapper = mount(SmSearch, {
      localVue,
      propsData: {
        mapTarget: 'map',
        layerNames: ['UNIQUE-民航数-0'],
        onlineLocalSearch: {
          enable: true,
          city: '北京市'
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    const spyquery = jest.spyOn(wrapper.vm, 'search');
    wrapper.find('input.sm-component-input').setValue('北京市');
    wrapper.find('.sm-component-search__search-icon').trigger('click');
    wrapper.vm.$nextTick(() => {
      expect(spyquery).toBeCalled();
      done();
    });
  });

  it('restMap', async done => {
    const fetchResource = {
      'https://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos.json?keywords=北京市&city=北京市&pageSize=10&pageNum=1&key=fvV2osxwuZWlY0wJb8FEb2i5':
        search_cityConfig
    };
    mockFetch(fetchResource);
    wrapper = mount(SmSearch, {
      localVue,
      propsData: {
        layerNames: ['UNIQUE-民航数-0'],
        restMap: [
          new RestMapParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/map-world/rest/maps/World',
            layerName: 'Capitals@World.1'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const spyquery = jest.spyOn(wrapper.vm, 'search');
    wrapper.find('input.sm-component-input').setValue('北京市');
    wrapper.find('.sm-component-search__search-icon').trigger('click');
    wrapper.vm.$nextTick(() => {
      expect(spyquery).toBeCalled();
      done();
    });
    wrapper.vm.search('北京');
  });

  it('restData', async done => {
    const fetchResource = {
      'https://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos.json?keywords=北京市&city=北京市&pageSize=10&pageNum=1&key=fvV2osxwuZWlY0wJb8FEb2i5':
        search_cityConfig,
      'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data/datasources/World/datasets/Countries/fields.rjson?returnAll=true':
        featuresInfo,
      'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data/datasources/World/datasets/Countries':
        featuresInfo
    };
    mockFetch(fetchResource);
    wrapper = mount(SmSearch, {
      localVue,
      propsData: {
        layerNames: ['UNIQUE-民航数-0'],
        restData: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            dataName: ['World:Countries']
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const spyquery = jest.spyOn(wrapper.vm, 'search');
    wrapper.find('input.sm-component-input').setValue('北京市');
    wrapper.find('.sm-component-search__search-icon').trigger('click');
    wrapper.vm.$nextTick(() => {
      expect(spyquery).toBeCalled();
      done();
    });
    wrapper.vm.search('北京');
  });

  it('iportal data', async done => {
    const fetchResource = {
      'https://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos.json?keywords=超图&city=北京市&pageSize=10&pageNum=1&key=fvV2osxwuZWlY0wJb8FEb2i5':
        search_cityConfig,
      'https://fakeiportal.supermap.io/iportal/web/datas/123': layerData,
      'https://fakeiportal.supermap.io/iportal/web/datas/123/content.json?pageSize=9999999&currentPage=1': layerData
    };
    mockFetch(fetchResource);
    wrapper = mount(SmSearch, {
      localVue,
      propsData: {
        layerNames: ['UNIQUE-民航数-0'],
        iportalData: [
          new iPortalDataParameter({
            url: 'https://fakeiportal.supermap.io/iportal/web/datas/123'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const spyquery = jest.spyOn(wrapper.vm, 'search');
    wrapper.find('input.sm-component-input').setValue('超图');
    wrapper.find('.sm-component-search__search-icon').trigger('click');
    wrapper.vm.$nextTick(() => {
      expect(spyquery).toBeCalled();
      done();
    });
    wrapper.vm.search('超图');
  });

  it('addressMatch', async done => {
    const fetchResource = {
      'https://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos.json?keywords=超图&city=北京市&pageSize=10&pageNum=1&key=fvV2osxwuZWlY0wJb8FEb2i5':
        search_cityConfig
    };
    mockFetch(fetchResource);
    wrapper = mount(SmSearch, {
      localVue,
      propsData: {
        layerNames: ['UNIQUE-民航数-0'],
        addressMatch: [
          new AddressMatchParameter({
            url: 'https://fakeiserver.supermap.io/iserver/iserver/services/addressmatch-Address/restjsr/v1/address'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const spyquery = jest.spyOn(wrapper.vm, 'search');
    wrapper.find('input.sm-component-input').setValue('超图');
    wrapper.find('.sm-component-search__search-icon').trigger('click');
    wrapper.vm.$nextTick(() => {
      expect(spyquery).toBeCalled();
      done();
    });
    wrapper.vm.search('超图');
  });

  it('change address match', async done => {
    const fetchResource = {
      'https://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos.json?keywords=超图&city=北京市&pageSize=10&pageNum=1&key=fvV2osxwuZWlY0wJb8FEb2i5':
        search_cityConfig
    };
    mockFetch(fetchResource);
    wrapper = mount(SmSearch, {
      localVue,
      propsData: {
        layerNames: ['UNIQUE-民航数-0'],
        addressMatch: [
          new AddressMatchParameter({
            url: 'https://fakeiserver.supermap.io/iserver/iserver/services/addressmatch-Address/restjsr/v1/address'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const spyquery = jest.spyOn(wrapper.vm, 'search');
    wrapper.find('input.sm-component-input').setValue('超图');
    wrapper.setProps({
      addressMatch: [
        new AddressMatchParameter({
          url: 'https://fakeiserver.supermap.io/iserver/iserver/services/addressmatch-Address/restjsr/v1/newaddress'
        })
      ]
    });
    wrapper.vm.$nextTick(() => {
      expect(spyquery).toBeCalled();
      done();
    });
  });

  it('change iportal data', async done => {
    wrapper = mount(SmSearch, {
      localVue,
      propsData: {
        layerNames: ['UNIQUE-民航数-0'],
        iportalData: [
          new iPortalDataParameter({
            url: 'https://fakeiportal.supermap.io/iportal/web/datas/123'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const spyquery = jest.spyOn(wrapper.vm, 'search');
    wrapper.find('input.sm-component-input').setValue('超图');
    wrapper.setProps({
      iportalData: [
        new iPortalDataParameter({
          url: 'https://fakeiportal.supermap.io/iportal/web/datas/123456'
        })
      ]
    });
    wrapper.vm.$nextTick(() => {
      expect(spyquery).toBeCalled();
      done();
    });
  });

  it('change restMap', async done => {
    wrapper = mount(SmSearch, {
      localVue,
      propsData: {
        layerNames: ['UNIQUE-民航数-0'],
        restMap: [
          new RestMapParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/map-world/rest/maps/World',
            layerName: 'Capitals@World.1'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const spyquery = jest.spyOn(wrapper.vm, 'search');
    wrapper.find('input.sm-component-input').setValue('北京市');
    wrapper.setProps({
      restMap: [
        new RestMapParameter({
          url: 'https://fakeiserver.supermap.io/iserver/services/map-world/rest/maps/World111',
          layerName: 'Capitals@World.1'
        })
      ]
    });
    wrapper.vm.$nextTick(() => {
      expect(spyquery).toBeCalled();
      done();
    });
  });

  it('change restData', async done => {
    wrapper = mount(SmSearch, {
      localVue,
      propsData: {
        layerNames: ['UNIQUE-民航数-0'],
        restData: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            dataName: ['World:Countries']
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const spyquery = jest.spyOn(wrapper.vm, 'search');
    wrapper.find('input.sm-component-input').setValue('北京市');
    wrapper.setProps({
      restMap: [
        new RestDataParameter({
          url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data111',
          dataName: ['World:Countries']
        })
      ]
    });
    wrapper.vm.$nextTick(() => {
      expect(spyquery).toBeCalled();
      done();
    });
  });
  
  it('ketup down', async done => {
    const fetchResource = {
      'https://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos.json?keywords=超图&city=北京市&pageSize=10&pageNum=1&key=fvV2osxwuZWlY0wJb8FEb2i5':
        search_cityConfig,
      'https://fakeiportal.supermap.io/iportal/web/datas/123': layerData,
      'https://fakeiportal.supermap.io/iportal/web/datas/123/content.json?pageSize=9999999&currentPage=1': layerData
    };
    mockFetch(fetchResource);
    wrapper = mount(SmSearch, {
      localVue,
      propsData: {
        layerNames: ['UNIQUE-民航数-0'],
        iportalData: [
          new iPortalDataParameter({
            url: 'https://fakeiportal.supermap.io/iportal/web/datas/123'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const spyquery = jest.spyOn(wrapper.vm, 'search');
    const input = wrapper.find('input.sm-component-input');
    input.setValue('超图');
    wrapper.find('.sm-component-search__search-icon').trigger('click');
    wrapper.vm.$nextTick(() => {
      setTimeout(() => {
        expect(spyquery).toBeCalled();
        input.trigger('keyup.up');
        done();
      }, 1000);
    });
  });

  it('ketup up', async done => {
    const fetchResource = {
      'https://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos.json?keywords=超图&city=北京市&pageSize=10&pageNum=1&key=fvV2osxwuZWlY0wJb8FEb2i5':
        search_cityConfig,
      'https://fakeiportal.supermap.io/iportal/web/datas/123': layerData,
      'https://fakeiportal.supermap.io/iportal/web/datas/123/content.json?pageSize=9999999&currentPage=1': layerData
    };
    mockFetch(fetchResource);
    wrapper = mount(SmSearch, {
      localVue,
      propsData: {
        layerNames: ['UNIQUE-民航数-0'],
        iportalData: [
          new iPortalDataParameter({
            url: 'https://fakeiportal.supermap.io/iportal/web/datas/123'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const spyquery = jest.spyOn(wrapper.vm, 'search');
    const input = wrapper.find('input.sm-component-input');
    input.setValue('超图');
    wrapper.find('.sm-component-search__search-icon').trigger('click');
    wrapper.vm.$nextTick(() => {
      setTimeout(() => {
        expect(spyquery).toBeCalled();
        input.trigger('keyup.down');
        done();
      }, 1000);
    });
  });

  it('click search result', async done => {
    const fetchResource = {
      'https://www.supermapol.com/iserver/services/localsearch/rest/searchdatas/China/poiinfos.json?keywords=超图&city=北京市&pageSize=10&pageNum=1&key=fvV2osxwuZWlY0wJb8FEb2i5':
        search_cityConfig,
      'https://fakeiportal.supermap.io/iportal/web/datas/123': layerData,
      'https://fakeiportal.supermap.io/iportal/web/datas/123/content.json?pageSize=9999999&currentPage=1': layerData
    };
    mockFetch(fetchResource);
    wrapper = mount(SmSearch, {
      localVue,
      propsData: {
        layerNames: ['UNIQUE-民航数-0'],
        iportalData: [
          new iPortalDataParameter({
            url: 'https://fakeiportal.supermap.io/iportal/web/datas/123'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const spyquery = jest.spyOn(wrapper.vm, 'search');
    const input = wrapper.find('input.sm-component-input');
    input.setValue('超图');
    wrapper.find('.sm-component-search__search-icon').trigger('click');
    wrapper.vm.$nextTick(() => {
      setTimeout(() => {
        expect(spyquery).toBeCalled();
        const liEle = wrapper.find('.sm-component-search__result ul li');
        liEle.trigger('click');
        done();
      }, 1000);
    });
  });
});