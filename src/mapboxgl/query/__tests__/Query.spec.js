import { mount, createLocalVue, config } from '@vue/test-utils';
import SmQuery from '../Query';
import iPortalDataParameter from '@types_common/iPortalDataParameter';
import RestDataParameter from '@types_common/RestDataParameter';
import RestMapParameter from '@types_common/RestMapParameter';
import SmButton from '../../../common/button/Button';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import { message } from 'ant-design-vue';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';
import { FetchRequest } from 'vue-iclient/static/libs/iclient-common/iclient-common';
import { REST_DATA_FIELDS_RESULT, dataset_data, prj_data, iportal_content, fakeDataServiceResult, fakeMapServiceResult, datas } from '@mocks/services';
import Message from 'vue-iclient/src/common/message/Message.js';

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
    const mockImplementationCb = url => {
      if (url.includes('/123')) {
        return Promise.resolve(new Response(JSON.stringify(datas)));
      }
      if (url.includes('/content')) {
        return Promise.resolve(new Response(JSON.stringify(iportal_content)));
      }
      if (url.includes('/fields')) {
        return Promise.resolve(new Response(JSON.stringify(REST_DATA_FIELDS_RESULT)));
      }
      if (url.includes('/prjCoordSys')) {
        return Promise.resolve(new Response(JSON.stringify(prj_data)));
      }
      if (url.includes('/queryResults')) {
        return Promise.resolve(new Response(JSON.stringify(fakeMapServiceResult)));
      }
      if (url.includes('/featureResults')) {
        return Promise.resolve(new Response(JSON.stringify(fakeDataServiceResult)));
      }
      return Promise.resolve(new Response(JSON.stringify(dataset_data)));
    };
    jest.spyOn(FetchRequest, 'get').mockImplementation(mockImplementationCb);
    jest.spyOn(FetchRequest, 'post').mockImplementation(mockImplementationCb);
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
    wrapper.vm.$on('query-succeeded', () => {
      expect(wrapper.vm.queryResult.result[0]['NAME']).toBe('四川省');
      done();
    });
    wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
    expect(spyquery).toBeCalled();
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
    wrapper.vm.$on('query-succeeded', () => {
      expect(wrapper.vm.queryResult.result[0]['NAME']).toBe('四川省');
      expect(spyAddlayer).toBeCalled();
      done();
    });
    wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
    expect(spyquery).toBeCalled();
  });

  it('change iPortal Data', async done => {
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
    await wrapper.vm.$nextTick();
    done();
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
    await wrapper.vm.$nextTick();
    const queryModeDom = wrapper.find('.sm-component-query__job-info-body .sm-component-query__item-holder div')
    expect(queryModeDom.exists()).toBeTruthy();
    expect(queryModeDom.text()).toBe('query.attributeCondition');
    done();
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
    await wrapper.vm.$nextTick();
    expect(formatJobInfos).toBeCalled();
    done();
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
        ],
        multiSelect: false
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    const spyquery = jest.spyOn(wrapper.vm, 'query');
    wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
    wrapper.vm.$on('query-succeeded', async () => {
      const highlightDom = wrapper.find({ ref: wrapper.vm.highlightCompRefName });
      const selectionSpy = jest.spyOn(highlightDom.vm, 'updateHighlightDatas');
      await wrapper.findAll('.sm-component-query__result-body ul li').at(0).trigger('click');
      expect(highlightDom.exists()).toBeTruthy();
      expect(selectionSpy).toBeCalled();
      expect(wrapper.vm.activeResultIndexList).toEqual([0]);
      await wrapper.findAll('.sm-component-query__result-body ul li').at(1).trigger('click');
      expect(wrapper.vm.activeResultIndexList).toEqual([1]);
      await wrapper.findAll('.sm-component-query__result-body ul li').at(1).trigger('click');
      expect(wrapper.vm.activeResultIndexList).toEqual([]);
      done();
    });
    expect(spyquery).toBeCalled();
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
    wrapper.vm.$on('query-succeeded', () => {
      expect(spyAddlayer).toBeCalled();
      expect(spyBounds).toBeCalled();
      done();
    });
    wrapper.vm.jobInfos[0].spaceFilter = 'mapBounds';
    wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
    expect(spyquery).toBeCalled();
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
    await wrapper.vm.$nextTick();
    expect(spyquery).toBeCalled();
    done();
  });

  it('query keyWord', async (done) => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: 'SmID>0',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'KEYWORD'
          })
        ]
      },
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    const spyquery = jest.spyOn(wrapper.vm, 'query');
    wrapper.vm.$on('query-succeeded', () => {
      expect(wrapper.vm.queryResult.result[0]['NAME']).toBe('四川省');
      expect(wrapper.vm.activeTab).toBe('result');
      wrapper.find('.sm-component-query__job-button').trigger('click');
      expect(wrapper.vm.activeTab).toBe('job');
      const repeatTip = jest.spyOn(Message, 'warning');
      wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
      expect(repeatTip).toBeCalledWith('query.resultAlreadyExists');
      done();
    });
    const queryModeDom = wrapper.find('.sm-component-query__job-info-body .sm-component-query__item-holder div')
    expect(queryModeDom.exists()).toBeTruthy();
    expect(queryModeDom.text()).toBe('query.keyQueryCondition');
    wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
    expect(spyquery).toBeCalled();
  });

  it('query clear result', async (done) => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: 'SmID>0',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'KEYWORD'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    const spyquery = jest.spyOn(wrapper.vm, 'query');
    wrapper.vm.$on('query-succeeded', () => {
      expect(wrapper.vm.queryResult.result[0]['NAME']).toBe('四川省');
      expect(wrapper.vm.activeTab).toBe('result');
      let resultHeader = wrapper.find('.sm-component-query__result-header i');
      expect(resultHeader.exists()).toBeTruthy();
      const clearSpy = jest.spyOn(wrapper.vm.viewModel, 'clear');
      resultHeader.trigger('click');
      expect(wrapper.find('.sm-component-query__result-header i').exists()).toBeFalsy();
      expect(clearSpy).toBeCalled();
      done();
    });
    const queryModeDom = wrapper.find('.sm-component-query__job-info-body .sm-component-query__item-holder div')
    expect(queryModeDom.exists()).toBeTruthy();
    expect(queryModeDom.text()).toBe('query.keyQueryCondition');
    wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
    expect(spyquery).toBeCalled();
  });

  it('multiSelect true', async (done) => {
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
        ],
        multiSelect: true
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    const spyquery = jest.spyOn(wrapper.vm, 'query');
    wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
    wrapper.vm.$on('query-succeeded', async () => {
      const highlightDom = wrapper.find({ ref: wrapper.vm.highlightCompRefName });
      const selectionSpy = jest.spyOn(highlightDom.vm, 'updateHighlightDatas');
      await wrapper.findAll('.sm-component-query__result-body ul li').at(0).trigger('click');
      expect(highlightDom.exists()).toBeTruthy();
      expect(selectionSpy).toBeCalled();
      expect(wrapper.vm.activeResultIndexList).toEqual([0]);
      await wrapper.findAll('.sm-component-query__result-body ul li').at(1).trigger('click');
      expect(wrapper.vm.activeResultIndexList).toEqual([0, 1]);
      await wrapper.findAll('.sm-component-query__result-body ul li').at(0).trigger('click');
      expect(wrapper.vm.activeResultIndexList).toEqual([1]);
      done();
    });
    expect(spyquery).toBeCalled();
  });
});

