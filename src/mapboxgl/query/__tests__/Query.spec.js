import {
  config
} from '@vue/test-utils';
import SmQuery from '../Query';
import {
  mount,
  createLocalVue
} from '@vue/test-utils';
import iPortalDataParameter from "@types_common/iPortalDataParameter";
import mapEvent from '@types_mapboxgl/map-event';
import RestDataParameter from "@types_common/RestDataParameter";
import RestMapParameter from "@types_common/RestMapParameter";
import SmWebMap from '../../web-map/WebMap';
import SmButton from '../../../common/button/Button';
import {
  Icon,
  Card,
  Collapse,
  Select,
  Button,
  message
} from 'ant-design-vue';

config.stubs.transition = false
const localVue = createLocalVue()
localVue.use(Card);
localVue.use(Collapse);
localVue.use(Icon);
localVue.use(Select);
localVue.use(Button);
localVue.prototype.$message = message;

describe('query', () => {
  let mapWrapper;
  let query;

  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    query = null;
    mapWrapper = null;

    mapWrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });

  })

  afterEach(() => {
    jest.restoreAllMocks();
    if (query && query !== "undefined") {
      query.destroy();
    }
    if (mapWrapper && mapWrapper !== "undefined") {
      mapWrapper.destroy();
    }

  })


  it('iPortal Data', (done) => {

    query = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: "map",
        iportalData: [
          new iPortalDataParameter({
            url: 'https://fakeiportal.supermap.io/iportal/web/datas/123',
            attributeFilter: 'SmID>0'
          })
        ]
      }
    });
    // 监控loaded是为了判断组件加载完成了
    query.vm.$on("loaded", () => {
      try {
        expect(query.vm.mapTarget).toBe('map');
        const spyAddlayer = jest.spyOn(query.vm.map, 'addLayer');
        const spyquery = jest.spyOn(query.vm, 'query');
        query.vm.$on("querysucceeded", () => {
          expect(spyAddlayer).toBeCalled();
          spyAddlayer.mockReset();
          spyAddlayer.mockRestore();
          done()
        })
        query.find(SmButton).find('.sm-component-query__a-button').trigger('click');
        query.vm.$nextTick(() => {
          expect(spyquery).toBeCalled();
          spyquery.mockReset();
          spyquery.mockRestore();
          done()
        })
      } catch (exception) {
        console.log("query" + exception.name + ":" + exception.message);
        expect(false).toBeTruthy();
        spyAddlayer.mockReset();
        spyAddlayer.mockRestore();
        done()
      }
    })
  })

  //iserver rest 数据服务
  it('Rest Data', (done) => {

    query = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: "map",
        restData: [
          new RestDataParameter({
            url: "https://fakeiserver.supermap.io/iserver/services/data-world/rest/data",
            attributeFilter: "SmID>0",
            maxFeatures: 30,
            dataName: ["World:Countries"],
          })
        ]
      },
    });
    // expect(vm.$options.methods.sum(1, 2)).toBe(3);

    //监控loaded是为了判断组件加载完成了
    query.vm.$on("loaded", () => {
      // console.log(query.vm)
      try {
        expect(query.vm.mapTarget).toBe('map');
        const spyAddlayer = jest.spyOn(query.vm, 'addPopupToFeature');
        const spyquery = jest.spyOn(query.vm, 'query');
        query.vm.$on("querysucceeded", () => {
          expect(spyAddlayer).toBeCalled();
          spyAddlayer.mockReset();
          spyAddlayer.mockRestore();
          done()
        })
        query.find(SmButton).find('.sm-component-query__a-button').trigger('click');
        query.vm.$nextTick(() => {
          expect(spyquery).toBeCalled();
          spyquery.mockReset();
          spyquery.mockRestore();
          done()
        })

      } catch (exception) {
        console.log("query" + exception.name + ":" + exception.message);
        expect(false).toBeTruthy();
        spyAddlayer.mockReset();
        spyAddlayer.mockRestore();
        done()
      }
    })
  })

  //iserver rest 地图服务
  it('Rest Map', (done) => {
    query = mount(SmQuery, {
      localVue,
      propsData: {
        mapTarget: "map",
        restMap: [
          new RestMapParameter({
            url: "https://fakeiserver.supermap.io/iserver/services/map-world/rest/maps/World",
            attributeFilter: "SmID>0",
            maxFeatures: 30,
            layerName: "Rivers@World",
          })
        ]
      }
    });
    //监控loaded是为了判断组件加载完成了
    query.vm.$on("loaded", () => {
      try {
        expect(query.vm.mapTarget).toBe('map');
        const spyAddlayer = jest.spyOn(query.vm.map, 'addLayer');
        const spyquery = jest.spyOn(query.vm, 'query');
        query.vm.$on("querysucceeded", () => {
          expect(spyAddlayer).toBeCalled();
          spyAddlayer.mockReset();
          spyAddlayer.mockRestore();
          done()
        })
        query.find(SmButton).find('.sm-component-query__a-button').trigger('click');
        query.vm.$nextTick(() => {
          expect(spyquery).toBeCalled();
          spyquery.mockReset();
          spyquery.mockRestore();
          done()
        })
      } catch (exception) {
        console.log("query" + exception.name + ":" + exception.message);
        expect(false).toBeTruthy();
        spyAddlayer.mockReset();
        spyAddlayer.mockRestore();
        done()
      }
    })
  })

})