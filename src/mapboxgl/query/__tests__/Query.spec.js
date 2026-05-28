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
import {
  REST_DATA_FIELDS_RESULT,
  dataset_data,
  prj_data,
  iportal_content,
  fakeDataServiceResult,
  fakeMapServiceResult,
  datas,
  restMap_Layers_Res,
  restMap_Maps_Res
} from '@mocks/services';
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
      if (url.indexOf('/123') > -1) {
        return Promise.resolve(new Response(JSON.stringify(datas)));
      }
      if (url.indexOf('/1763883342') > -1) {
        return Promise.resolve(new Response(JSON.stringify({ ...datas, dataItemServices: [] })));
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
      if (url.includes('/maps/mapOfsupermap1_pg/layers')) {
        return Promise.resolve(new Response(JSON.stringify(restMap_Layers_Res)));
      }
      if (url.includes('/queryResults')) {
        return Promise.resolve(new Response(JSON.stringify(fakeMapServiceResult)));
      }
      if (url.includes('/featureResults')) {
        return Promise.resolve(new Response(JSON.stringify(fakeDataServiceResult)));
      }
      if (url.includes('/maps')) {
        return Promise.resolve(new Response(JSON.stringify(restMap_Maps_Res)));
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

  it('iPortal unpublished Data', async done => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        iportalData: [
          {
            name: '四川省电站发电-四川发电站上月发电量',
            displayName: '分段&-四川省电站发电-四川发电站上月发电量',
            mapTarget: 'map_1731901870198',
            type: 'iPortal',
            id: '1763883342',
            url: 'http://lcoalhost:8190/iportal/web/datas/1763883342',
            dataType: 'GEOJSON',
            updateTime: '2024-10-25 11:38:12',
            serviceStatus: 'PUBLISHED',
            dataItemServices: null,
            withCredentials: false,
            preferContent: true,
            maxFeatures: 8,
            queryMode: 'SQL',
            fields: [],
            attributeFilter: 'SmID>0'
          }
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    const queryErrorTip = jest.spyOn(Message, 'warning');
    wrapper.vm.$on('query-failed', (e) => {
      expect(queryErrorTip).toHaveBeenCalledTimes(1);
      expect(queryErrorTip).toHaveBeenCalledWith(e.message);
      expect(e.message).toBe('query.seviceNotSupport');
      expect(wrapper.vm.isQuery).toBe(false);
      expect(wrapper.vm.activeTab).toBe('job');
      expect(wrapper.vm.activeResultIndexList).toEqual([]);
      expect(wrapper.vm.queryResult).toBeNull();
      expect(wrapper.vm.activeQueryJob).toBeNull();
      done();
    })
    wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
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
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    const spyquery = jest.spyOn(wrapper.vm, 'query');
    wrapper.vm.$on('query-succeeded', () => {
      expect(wrapper.vm.queryResult.result[0]['NAME']).toBe('四川省');
      wrapper.setProps({
        iportalData: [
          new iPortalDataParameter({
            url: 'https://fakeiportal.supermap.io/iportal/web/datas/123456',
            attributeFilter: 'SmID>0'
          })
        ]
      });
      expect(wrapper.vm.queryResult).toBeFalsy();
      done();
    });
    wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
    expect(spyquery).toBeCalled();
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
    expect(wrapper.vm.mapTarget).toBe('map');
    const queryModeDom = wrapper.find('.sm-component-query__job-info-body .sm-component-query__item-holder div')
    expect(queryModeDom.exists()).toBeTruthy();
    expect(queryModeDom.text()).toBe('query.attributeCondition');
    const spyquery = jest.spyOn(wrapper.vm, 'query');
    wrapper.vm.$on('query-succeeded', () => {
      expect(wrapper.vm.queryResult.result[0]['NAME']).toBe('四川省');
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
      expect(wrapper.vm.queryResult).toBeFalsy();
      done();
    });
    wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
    expect(spyquery).toBeCalled();
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
    expect(wrapper.vm.mapTarget).toBe('map');
    const spyquery = jest.spyOn(wrapper.vm, 'query');
    wrapper.vm.$on('query-succeeded', () => {
      expect(wrapper.vm.queryResult.result[0]['NAME']).toBe('四川省');
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
      expect(wrapper.vm.queryResult).toBeFalsy();
      expect(formatJobInfos).toBeCalled();
      done();
    });
    wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
    expect(spyquery).toBeCalled();
  });

  it('change same restMap Service', async done => {
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
    const spyquery = jest.spyOn(wrapper.vm, 'query');
    wrapper.vm.$on('query-succeeded', () => {
      const currentResult = wrapper.vm.queryResult;
      expect(wrapper.vm.queryResult.result[0]['NAME']).toBe('四川省');
      const formatJobInfos = jest.spyOn(wrapper.vm, 'formatJobInfos');
      wrapper.setProps({
        restMap: [
          new RestMapParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/map-world/rest/maps/World',
            attributeFilter: 'SmID>0',
            maxFeatures: 30,
            layerName: 'Rivers@World'
          })
        ]
      });
      expect(wrapper.vm.queryResult).toEqual(currentResult);
      expect(formatJobInfos).not.toBeCalled();
      done();
    });
    wrapper.find(SmButton).find('.sm-component-query__a-button').trigger('click');
    expect(spyquery).toBeCalled();
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

  it('shows sql builder button when enabled', async () => {
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
            queryMode: 'SQL',
            showSqlBuilderButton: true
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.find('.sm-component-query__sql-config-button').exists()).toBeTruthy();

    wrapper.destroy();
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
            queryMode: 'KEYWORD',
            showSqlBuilderButton: true
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.find('.sm-component-query__sql-config-button').exists()).toBeFalsy();
  });

  it('hides sql builder button when disabled', async () => {
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
            queryMode: 'SQL',
            showSqlBuilderButton: false
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.find('.sm-component-query__sql-config-button').exists()).toBeFalsy();
  });

  it('renders sql builder content in the fixed popover panel', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.find('.sm-component-query__sql-config-button').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.sm-component-query__sql-builder-panel').exists()).toBeTruthy();
  });

  it('shows a light mask while the sql builder popover is open', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.find('.sm-component-query__sql-builder-mask').exists()).toBeFalsy();

    await wrapper.find('.sm-component-query__sql-config-button').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.sm-component-query__sql-builder-mask').exists()).toBeTruthy();

    wrapper.vm.closeSqlBuilder();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.sm-component-query__sql-builder-mask').exists()).toBeFalsy();
  });

  it('applies sql builder expression to attribute filter', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.find('.sm-component-query__sql-config-button').trigger('click');
    wrapper.vm.sqlBuilderConditions[0] = { field: 'SmID', operator: '>', value: '10' };
    await wrapper.vm.$nextTick();
    wrapper.vm.confirmSqlBuilder(wrapper.vm.jobInfos[0]);
    expect(wrapper.vm.jobInfos[0].queryParameter.attributeFilter).toBe('SmID > 10');
  });

  it('keeps sql builder operators to basic attribute filter conditions', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: false,
        background: '',
        datasetNames: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: 'SmID>0',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.getSqlBuilderOperators()).toEqual(['=', '<>', '>', '>=', '<', '<=', 'LIKE', 'IS NULL', 'IS NOT NULL']);
  });

  it('shows not equal operator as != but keeps <> in sql expression', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL'
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.getSqlBuilderOperatorLabel('<>')).toBe('!=');
    expect(wrapper.vm.buildSqlCondition({ field: 'SmID', operator: '<>', value: '10' }, wrapper.vm.jobInfos[0])).toBe('SmID <> 10');
  });

  it('builds sql expression from multiple condition rows', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL',
            fields: [{ name: 'SmID' }, { name: 'Name' }]
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.find('.sm-component-query__sql-config-button').trigger('click');
    wrapper.vm.sqlBuilderConditions[0] = { field: 'SmID', operator: '>', value: '10' };
    wrapper.vm.addSqlBuilderCondition();
    wrapper.vm.sqlBuilderConnectors[0] = 'OR';
    wrapper.vm.sqlBuilderConditions[1] = { field: 'Name', operator: 'LIKE', value: 'road' };
    await wrapper.vm.$nextTick();
    wrapper.vm.confirmSqlBuilder(wrapper.vm.jobInfos[0]);
    expect(wrapper.vm.jobInfos[0].queryParameter.attributeFilter).toBe("SmID > 10 OR Name LIKE '%road%'");
  });

  it('removes connector when deleting sql builder condition row', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL',
            fields: [{ name: 'SmID' }, { name: 'Name' }]
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.find('.sm-component-query__sql-config-button').trigger('click');
    wrapper.vm.sqlBuilderConditions[0] = { field: 'SmID', operator: '>', value: '10' };
    wrapper.vm.addSqlBuilderCondition();
    wrapper.vm.sqlBuilderConditions[1] = { field: 'Name', operator: '=', value: 'road' };
    wrapper.vm.removeSqlBuilderCondition(0);
    expect(wrapper.vm.sqlBuilderConditions).toEqual([{ field: 'Name', operator: '=', value: 'road' }]);
    expect(wrapper.vm.sqlBuilderConnectors).toEqual([]);
  });

  it('uses the sql builder condition close icon instead of a delete button', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL',
            fields: [{ name: 'SmID' }, { name: 'Name' }]
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.find('.sm-component-query__sql-config-button').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.sm-component-query__sql-builder-condition-close').exists()).toBeFalsy();

    wrapper.vm.addSqlBuilderCondition(wrapper.vm.jobInfos[0]);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.sm-component-query__sql-builder-delete').exists()).toBeFalsy();
    const closeIcons = wrapper.findAll('.sm-component-query__sql-builder-condition-close');
    expect(closeIcons).toHaveLength(2);
    closeIcons.at(1).trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.sqlBuilderConditions).toHaveLength(1);
  });

  it('does not require value for sql builder null operators', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL',
            fields: [{ name: 'SmID' }]
          })
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.find('.sm-component-query__sql-config-button').trigger('click');
    wrapper.vm.sqlBuilderConditions[0] = { field: 'SmID', operator: 'IS NULL', value: '' };
    await wrapper.vm.$nextTick();
    wrapper.vm.confirmSqlBuilder(wrapper.vm.jobInfos[0]);
    expect(wrapper.vm.jobInfos[0].queryParameter.attributeFilter).toBe('SmID IS NULL');
  });

  it('limits sql builder operators by selected field value type', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          {
            type: 'iServer',
            name: 'restData',
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL',
            fields: [
              { name: 'SmID', type: 'INT32' },
              { name: 'Name', type: 'WTEXT' }
            ]
          }
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const jobInfo = wrapper.vm.jobInfos[0];
    wrapper.vm.$set(wrapper.vm.sqlBuilderFieldMap, wrapper.vm.getSqlBuilderJobCacheKey(jobInfo), ['SmID', 'Name']);
    wrapper.vm.$set(wrapper.vm.sqlBuilderFieldValueMap, wrapper.vm.getSqlBuilderFieldValueCacheKey(jobInfo, 'SmID'), [1]);
    wrapper.vm.$set(wrapper.vm.sqlBuilderFieldValueMap, wrapper.vm.getSqlBuilderFieldValueCacheKey(jobInfo, 'Name'), ['Airport']);
    expect(wrapper.vm.getSqlBuilderOperators({ field: 'SmID' }, jobInfo)).toEqual([
      '=',
      '<>',
      '>',
      '>=',
      '<',
      '<=',
      'IS NULL',
      'IS NOT NULL'
    ]);
    expect(wrapper.vm.getSqlBuilderOperators({ field: 'Name' }, jobInfo)).toEqual([
      '=',
      '<>',
      'LIKE',
      'IS NULL',
      'IS NOT NULL'
    ]);
  });

  it('shows friendly sql builder operator labels without changing stored operator values', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          {
            type: 'iServer',
            name: 'restData',
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL'
          }
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.getSqlBuilderOperatorLabel('<>')).toBe('!=');
    expect(wrapper.vm.getSqlBuilderOperatorLabel('LIKE')).toBe('LIKE');
  });

  it('formats sql builder values by selected field value type', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          {
            type: 'iServer',
            name: 'restData',
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL',
            fields: [
              { name: 'SmID', type: 'INT32' },
              { name: 'Code', type: 'WTEXT' }
            ]
          }
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const jobInfo = wrapper.vm.jobInfos[0];
    wrapper.vm.$set(wrapper.vm.sqlBuilderFieldMap, wrapper.vm.getSqlBuilderJobCacheKey(jobInfo), ['SmID', 'Code']);
    wrapper.vm.$set(wrapper.vm.sqlBuilderFieldValueMap, wrapper.vm.getSqlBuilderFieldValueCacheKey(jobInfo, 'SmID'), [1]);
    wrapper.vm.$set(wrapper.vm.sqlBuilderFieldValueMap, wrapper.vm.getSqlBuilderFieldValueCacheKey(jobInfo, 'Code'), ['A001']);
    expect(wrapper.vm.buildSqlCondition({ field: 'SmID', operator: '=', value: '123' }, jobInfo)).toBe('SmID = 123');
    expect(wrapper.vm.buildSqlCondition({ field: 'Code', operator: '=', value: '123' }, jobInfo)).toBe("Code = '123'");
  });

  it('resets sql builder operator and value when field changes to a field with different operators', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          {
            type: 'iServer',
            name: 'restData',
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL',
            fields: [
              { name: 'SmID', type: 'INT32' },
              { name: 'Name', type: 'WTEXT' }
            ]
          }
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const jobInfo = wrapper.vm.jobInfos[0];
    wrapper.vm.$set(wrapper.vm.sqlBuilderFieldMap, wrapper.vm.getSqlBuilderJobCacheKey(jobInfo), ['SmID', 'Name']);
    wrapper.vm.$set(wrapper.vm.sqlBuilderFieldValueMap, wrapper.vm.getSqlBuilderFieldValueCacheKey(jobInfo, 'Name'), ['Airport']);
    const condition = { field: 'Name', operator: '>', value: '10' };
    wrapper.vm.handleSqlBuilderFieldChange(condition, jobInfo);
    expect(condition).toEqual({ field: 'Name', operator: '=', value: '' });
  });

  it('clears sql builder value when field changes without changing operator', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          {
            type: 'iServer',
            name: 'restData',
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL',
            fields: [
              { name: 'Name', type: 'WTEXT' },
              { name: 'Code', type: 'WTEXT' }
            ]
          }
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const jobInfo = wrapper.vm.jobInfos[0];
    wrapper.vm.$set(wrapper.vm.sqlBuilderFieldMap, wrapper.vm.getSqlBuilderJobCacheKey(jobInfo), ['Name', 'Code']);
    wrapper.vm.$set(wrapper.vm.sqlBuilderFieldValueMap, wrapper.vm.getSqlBuilderFieldValueCacheKey(jobInfo, 'Code'), ['A001']);
    const condition = { field: 'Code', operator: '=', value: 'Airport' };
    wrapper.vm.handleSqlBuilderFieldChange(condition, jobInfo);
    expect(condition).toEqual({ field: 'Code', operator: '=', value: '' });
  });

  it('shows sql builder value options again after clearing a typed value', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          {
            type: 'iServer',
            name: 'restData',
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL',
            fields: [{ name: 'Name', type: 'WTEXT' }]
          }
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const jobInfo = wrapper.vm.jobInfos[0];
    wrapper.vm.sqlBuilderVisibleIndex = 0;
    wrapper.vm.sqlBuilderConditions = [{ field: 'Name', operator: '=', value: 'dasdasd' }];
    wrapper.vm.$set(wrapper.vm.sqlBuilderFieldValueMap, wrapper.vm.getSqlBuilderFieldValueCacheKey(jobInfo, 'Name'), [
      'Airport',
      'Station'
    ]);

    wrapper.vm.handleSqlBuilderValueSearch(0, 'dasdasd');
    expect(wrapper.vm.getSqlBuilderFieldValueOptions(wrapper.vm.sqlBuilderConditions[0], 0)).toEqual([]);

    wrapper.vm.sqlBuilderConditions[0].value = '';
    wrapper.vm.handleSqlBuilderValueChange(0, jobInfo);
    wrapper.vm.handleSqlBuilderValueFocus(0);

    expect(wrapper.vm.getSqlBuilderFieldValueOptions(wrapper.vm.sqlBuilderConditions[0], 0)).toEqual([
      { label: 'Airport', value: 'Airport' },
      { label: 'Station', value: 'Station' }
    ]);
  });

  it('loads first 100 unique sql builder values from queried features', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          {
            type: 'iServer',
            name: 'restData',
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL',
            fields: [{ name: 'Name', type: 'WTEXT' }]
          }
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const features = Array.from({ length: 105 }).map((item, index) => ({
      properties: {
        Name: index === 1 ? 'Name-0' : `Name-${index}`
      }
    }));
    jest.spyOn(wrapper.vm, 'querySqlBuilderValueFeatures').mockResolvedValue(features);
    const jobInfo = wrapper.vm.jobInfos[0];
    const values = await wrapper.vm.loadSqlBuilderFieldValues(jobInfo, 'Name');
    expect(values).toHaveLength(100);
    expect(values[0]).toBe('Name-0');
    expect(values[1]).toBe('Name-2');
    expect(values[99]).toBe('Name-100');
  });

  it('reuses queried sql builder features when loading values for different fields', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          {
            type: 'iServer',
            name: 'restData',
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL',
            fields: [
              { name: 'Name', type: 'WTEXT' },
              { name: 'Code', type: 'WTEXT' }
            ]
          }
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const features = [
      {
        properties: {
          Name: 'Airport',
          Code: 'A001'
        }
      }
    ];
    const querySpy = jest.spyOn(wrapper.vm, 'querySqlBuilderValueFeatures').mockResolvedValue(features);
    const jobInfo = wrapper.vm.jobInfos[0];

    await wrapper.vm.loadSqlBuilderFieldValues(jobInfo, 'Name');
    await wrapper.vm.loadSqlBuilderFieldValues(jobInfo, 'Code');

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.sqlBuilderFieldValueMap[wrapper.vm.getSqlBuilderFieldValueCacheKey(jobInfo, 'Name')]).toEqual(['Airport']);
    expect(wrapper.vm.sqlBuilderFieldValueMap[wrapper.vm.getSqlBuilderFieldValueCacheKey(jobInfo, 'Code')]).toEqual(['A001']);
  });

  it('loads sql builder fields from queried feature fieldNames', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          {
            type: 'iServer',
            name: 'restData',
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL'
          }
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    jest.spyOn(wrapper.vm, 'querySqlBuilderValueFeatures').mockResolvedValue([
      {
        fieldNames: ['SmID', 'Name'],
        fieldValues: [1, 'Airport']
      }
    ]);
    const jobInfo = wrapper.vm.jobInfos[0];
    await wrapper.vm.loadSqlBuilderFieldValues(jobInfo, '');
    expect(wrapper.vm.getSqlBuilderFields(jobInfo)).toEqual([
      { value: 'SmID', label: 'SmID', type: undefined },
      { value: 'Name', label: 'Name', type: undefined }
    ]);
  });

  it('loads sql builder field values from fieldValues arrays and removes duplicates', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          {
            type: 'iServer',
            name: 'restData',
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL'
          }
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    jest.spyOn(wrapper.vm, 'querySqlBuilderValueFeatures').mockResolvedValue([
      {
        fieldNames: ['SmID', 'Name'],
        fieldValues: [1, 'Airport']
      },
      {
        fieldNames: ['SmID', 'Name'],
        fieldValues: [1, 'Airport']
      },
      {
        fieldNames: ['SmID', 'Name'],
        fieldValues: [2, 'Station']
      }
    ]);
    const jobInfo = wrapper.vm.jobInfos[0];

    const values = await wrapper.vm.loadSqlBuilderFieldValues(jobInfo, 'Name');

    expect(values).toEqual(['Airport', 'Station']);
    expect(wrapper.vm.sqlBuilderFieldValueMap[wrapper.vm.getSqlBuilderFieldValueCacheKey(jobInfo, 'Name')]).toEqual([
      'Airport',
      'Station'
    ]);
  });

  it('returns null when sql builder expression cannot be parsed', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          {
            type: 'iServer',
            name: 'restData',
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL'
          }
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    const jobInfo = wrapper.vm.jobInfos[0];

    expect(wrapper.vm.parseSqlBuilderExpression('SmID = 1 AND invalid sql', jobInfo)).toBeNull();
    expect(wrapper.vm.parseSqlBuilderExpression('', jobInfo)).toBeNull();
  });

  it('loads first discovered sql builder field values on first open', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          {
            type: 'iServer',
            name: 'restData',
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL'
          }
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    jest.spyOn(wrapper.vm, 'querySqlBuilderValueFeatures').mockResolvedValue([
      {
        fieldNames: ['SMID', 'Name'],
        fieldValues: [1, 'Airport']
      },
      {
        fieldNames: ['SMID', 'Name'],
        fieldValues: [2, 'Station']
      }
    ]);
    const jobInfo = wrapper.vm.jobInfos[0];

    await wrapper.vm.openSqlBuilder(jobInfo, 0);

    expect(wrapper.vm.sqlBuilderConditions[0].field).toBe('SMID');
    expect(wrapper.vm.getSqlBuilderFieldValueOptions(wrapper.vm.sqlBuilderConditions[0], 0)).toEqual([
      { label: 1, value: 1 },
      { label: 2, value: 2 }
    ]);
  });

  it('does not use configured fields for sql builder field options', async () => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          {
            type: 'iServer',
            name: 'restData',
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: '',
            maxFeatures: 30,
            dataName: ['World:Countries'],
            queryMode: 'SQL',
            fields: [{ name: 'ConfiguredField', type: 'WTEXT' }]
          }
        ]
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.getSqlBuilderFields(wrapper.vm.jobInfos[0])).toEqual([]);
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

  it('showPopup false', async (done) => {
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
    expect(wrapper.find('.sm-component-layer-highlight').exists()).toBeTruthy();
    wrapper.setProps({ showPopup: false });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.sm-component-layer-highlight').exists()).toBeFalsy();
    done();
  });
  it('identifyField', async (done) => {
    wrapper = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: 'map',
        restData: [
          new RestDataParameter({
            url: 'https://fakeiserver.supermap.io/iserver/services/data-world/rest/data',
            attributeFilter: 'SmID>0',
            maxFeatures: 30,
            identifyField: { field: 'NAME', fieldCaption: '国家名称' },
            dataName: ['World:Countries']
          })
        ]
      }
    });
     wrapper.vm.$on('query-succeeded', async () => {
      expect(wrapper.vm.resultDisplayTitle({ NAME: '中国' })).toBe('国家名称：中国');
    });
    done();
  });
});


