import { mount, createLocalVue, config } from '@vue/test-utils';
import SmQuery from '../Query';
import iPortalDataParameter from '@types_common/iPortalDataParameter';
import RestDataParameter from '@types_common/RestDataParameter';
import RestMapParameter from '@types_common/RestMapParameter';
import SmButton from '../../../common/button/Button';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import layerData from 'vue-iclient/test/unit/mocks/data/layerData';
import { message } from 'ant-design-vue';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

const localVue = createLocalVue();
localVue.prototype.$message = message;

describe('query', () => {
  let mapWrapper;
  let wrapper;

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

  it('iPortal Data', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/123': layerData
    };
    mockFetch(fetchResource);
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        iportalData: [
          new iPortalDataParameter({
            url: 'https://fakeiportal.supermap.io/iportal/web/datas/123',
            attributeFilter: 'SmID>0'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    const spyquery = jest.spyOn(wrapper.vm, 'query');
    wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
    wrapper.vm.$nextTick(() => {
      expect(spyquery).toBeCalled();
      done();
    });
  });

  it('restData Service', async done => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: 'SmID>0',
            maxFeatures: 30,
            dataName: ['World:Countries']
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    const spyquery = jest.spyOn(wrapper.vm, 'query');
    wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
    wrapper.vm.viewModel.on('querysucceeded', (res) => {
      expect(res.result.result[0].properties['名称']).toBe('四川省');
      done();
    });
    wrapper.vm.$nextTick(() => {
      expect(spyquery).toBeCalled();
    });
  });

  it('restMap Service', async done => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restMap: [
          new RestMapParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/map-world/rest/maps/World',
            attributeFilter: 'SmID>0',
            maxFeatures: 30,
            layerName: 'Rivers@World'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    const spyAddlayer = jest.spyOn(wrapper.vm.map, 'addLayer');
    const spyquery = jest.spyOn(wrapper.vm, 'query');
    wrapper.vm.viewModel.on('querysucceeded', (res) => {
      expect(res.result.result[0].properties['名称']).toBe('四川省');
      expect(spyAddlayer).toBeCalled();
      done();
    });
    wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
    wrapper.vm.$nextTick(() => {
      expect(spyquery).toBeCalled();
    });
  });

  it('change iPortal Data', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/datas/123': layerData
    };
    mockFetch(fetchResource);
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        iportalData: [
          new iPortalDataParameter({
            url: 'https://fakeiportal.supermap.io/iportal/web/datas/123',
            attributeFilter: 'SmID>0'
          })
        ]
      }
    });
    wrapper.setProps({
      iportalData: [
        new iPortalDataParameter({
          url: 'https://fakeiportal.supermap.io/iportal/web/datas/123456',
          attributeFilter: 'SmID>0'
        })
      ]
    });
    await mapSubComponentLoaded(wrapper);
    wrapper.vm.$nextTick(() => {
      done();
    });
  });

  it('change restData Service', async done => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: 'SmID>0',
            maxFeatures: 30,
            dataName: ['World:Countries']
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    wrapper.setProps({
      restData: [
        new RestDataParameter({
          url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data1',
          attributeFilter: 'SmID>0',
          maxFeatures: 40,
          dataName: ['World:Countries']
        })
      ]
    });
    wrapper.vm.$nextTick(() => {
      done();
    });
  });

  it('change restMap Service', async done => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restMap: [
          new RestMapParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/map-world/rest/maps/World',
            attributeFilter: 'SmID>0',
            maxFeatures: 30,
            layerName: 'Rivers@World'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const formatJobInfos = jest.spyOn(wrapper.vm, 'formatJobInfos');
    wrapper.setProps({
      restMap: [
        new RestMapParameter({
          url: 'https://fakeiserver.supermap.io/iserver/services/map-world/rest/maps/World1',
          attributeFilter: 'SmID>0',
          maxFeatures: 40,
          layerName: 'Rivers@World'
        })
      ]
    });
    wrapper.vm.$nextTick(() => {
      expect(formatJobInfos).toBeCalled();
      done();
    });
  });

  it('select query item', async done => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: 'SmID>0',
            maxFeatures: 30,
            dataName: ['World:Countries']
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    const spyquery = jest.spyOn(wrapper.vm, 'query');
    wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
    wrapper.vm.$nextTick(() => {
      expect(spyquery).toBeCalled();
      setTimeout(() => {
        wrapper.find('.sm-component-query__result-body ul li').trigger('click');
        done();
      }, 1000);
    });
  });

  it('restMap Service with bounds', async done => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restMap: [
          new RestMapParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/map-world/rest/maps/World',
            attributeFilter: 'SmID>0',
            maxFeatures: 30,
            layerName: 'Rivers@World'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    const spyAddlayer = jest.spyOn(wrapper.vm.map, 'addLayer');
    const spyBounds = jest.spyOn(wrapper.vm.map, 'fitBounds');
    const spyquery = jest.spyOn(wrapper.vm, 'query');
    wrapper.vm.viewModel.on('querysucceeded', (e) => {
      expect(spyAddlayer).toBeCalled();
      expect(spyBounds).toBeCalledWith(expect.arrayContaining([[180, 26.089841338515914]]),expect.anything());
      done();
    });
    wrapper.vm.jobInfos[0].spaceFilter = 'mapBounds';
    wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
    wrapper.vm.$nextTick(() => {
      expect(spyquery).toBeCalled();
    });
  });

  it('restData Service with bounds', async done => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: 'SmID>0',
            maxFeatures: 30,
            dataName: ['World:Countries']
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    const spyquery = jest.spyOn(wrapper.vm, 'query');
    wrapper.vm.jobInfos[0].spaceFilter = 'mapBounds';
    wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
    wrapper.vm.$nextTick(() => {
      expect(spyquery).toBeCalled();
      done();
    });
  });
});
