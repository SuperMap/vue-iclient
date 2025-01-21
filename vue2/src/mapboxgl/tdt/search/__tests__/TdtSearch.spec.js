import { mount, createLocalVue, config } from '@vue/test-utils';
import SmTdtSearch from '../TdtSearch.vue';
import mockAxios from 'axios';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';
import { Input, message } from 'ant-design-vue';

const localVue = createLocalVue();
localVue.use(Input);
message.config({
  top: `10%`,
  maxCount: 1
});
localVue.prototype.$message = message;

describe('TdtSearch.vue', () => {
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
    jest.resetAllMocks();
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

  it('render', async done => {
    wrapper = mount(SmTdtSearch, {
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

  it('search', async done => {
    mockAxios.mockImplementation(e => {
      if (e.url === 'https://api.tianditu.gov.cn/v2/search') {
        return Promise.resolve({
          data: {
            count: '61719',
            keyWord: 'c',
            mclayer: '',
            resultType: '4',
            suggests: [
              {
                address: '浙江省杭州市萧山区',
                gbCode: '156330109',
                name: '成都1'
              },
              {
                address: '湖南省邵阳市新邵县',
                gbCode: '156430522',
                name: '成都2'
              },
              {
                address: '四川省眉山市彭山区',
                gbCode: '156511403',
                name: '成都3'
              }
            ]
          }
        });
      } else if (e.url === 'https://api.tianditu.gov.cn/v2/search/detail') {
        return Promise.resolve({
          data: {
            area: {
              level: '11',
              bound: '102.75196199999999,29.967584,104.890132,31.435309999999998',
              name: '成都市',
              type: '1',
              lonlat: '104.062269,30.661123'
            },
            count: 1,
            keyWord: '成都',
            mclayer: '',
            prompt: [
              {
                admins: [{ adminCode: 156510100, name: '成都市' }],
                keyword: '成都',
                type: 1
              }
            ]
          }
        });
      }
    });
    wrapper = mount(SmTdtSearch, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: true,
        data: {
          tk: '1d109683f4d84198e37a38c442d68311'
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.collapsed).toBeTruthy();
    expect(wrapper.vm.mapTarget).toBe('map');
    const searchSucceeded = jest.spyOn(wrapper.vm, 'searchSucceeded');
    const inputSearch = wrapper.find('.sm-component-input');
    expect(inputSearch.exists()).toBeTruthy();
    inputSearch.setValue('成都');
    setTimeout(async () => {
      expect(mockAxios).toHaveBeenCalledTimes(1);
      expect(searchSucceeded).toHaveBeenCalledTimes(1);
      const resultLi = wrapper.findAll('.sm-component-search__result li');
      expect(resultLi.length).toBe(3);
      wrapper.setProps({
        mapTarget: 'map',
        collapsed: true,
        data: {
          searchUrl: 'https://api.tianditu.gov.cn/v2/search/detail',
          tk: '1d109683f4d84198e37a38c442d68311'
        }
      });
      await resultLi.at(0).trigger('click');
      setTimeout(() => {
        expect(wrapper.vm.componentId).toBe('AreaResult');
        done();
      }, 500);
    }, 500);
  });

  it('search lineString detail', async done => {
    mockAxios.mockImplementation(e => {
      if (e.url === 'https://api.tianditu.gov.cn/v2/search') {
        return Promise.resolve({
          data: {
            count: '61719',
            keyWord: 'c',
            mclayer: '',
            resultType: '4',
            suggests: [
              {
                address: '四川省成都市',
                gbCode: '156510100',
                name: '222路'
              },
              {
                address: '四川省成都市',
                gbCode: '156430522',
                name: '202路'
              }
            ]
          }
        });
      } else if (e.url === 'https://api.tianditu.gov.cn/transit') {
        return Promise.resolve({
          data: {
            byuuid: 27818,
            company: '成都公交集团星辰巴士公司',
            endtime: '22:00',
            increasedprice: 0,
            increasedstep: 0,
            interval: 0,
            isbidirectional: 1,
            ismanual: 1,
            ismonticket: 1,
            length: 7716,
            linename: '222路(二环少陵路口-高朋西路南)',
            linepoint: '104.019416,30.64978;104.019437,30.648794;104.019508,30.648143;104.019556,30.647934;',
            linetype: 1,
            startprice: 200,
            starttime: '07:00',
            station: [
              { lonlat: '104.019397,30.649789', name: '二环少陵路口', uuid: '195155' },
              { lonlat: '104.017162,30.647675', name: '逸都路东', uuid: '186190' },
              { lonlat: '104.015942,30.64658', name: '云霞路', uuid: '194496' },
              { lonlat: '104.016924,30.643464', name: '云霞路武侯大道口', uuid: '184199' }
            ],
            stationnum: 13,
            ticketcal: 0,
            totalprice: 0
          }
        });
      } else if (e.url === 'https://api.tianditu.gov.cn/v2/search/lineStringDetail') {
        return Promise.resolve({
          data: {
            dataversion: '2021-9-28 17:58:41',
            engineversion: '20180412',
            keyWord: '222路',
            lineData: [
              {
                name: '222路(二环少陵路口-高朋西路南)',
                poiType: '103',
                stationNum: '13',
                uuid: '28318'
              },
              {
                name: '222路(高朋西路南-二环少陵路口)',
                poiType: '103',
                stationNum: '14',
                uuid: '27818'
              }
            ],
            mclayer: '',
            count: 2,
            prompt: [
              {
                admins: [{ adminCode: 156510100, name: '成都市' }],
                type: 4
              }
            ]
          }
        });
      }
    });
    wrapper = mount(SmTdtSearch, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: true,
        data: {
          tk: '1d109683f4d84198e37a38c442d68311'
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.collapsed).toBeTruthy();
    expect(wrapper.vm.mapTarget).toBe('map');
    const inputSearch = wrapper.find('.sm-component-input');
    inputSearch.setValue('22');
    setTimeout(async () => {
      const resultLi = wrapper.findAll('.sm-component-search__result li');
      expect(resultLi.length).toBe(2);
      await wrapper.setProps({
        mapTarget: 'map',
        collapsed: true,
        data: {
          searchUrl: 'https://api.tianditu.gov.cn/v2/search/lineStringDetail',
          tk: '1d109683f4d84198e37a38c442d68311'
        }
      });
      await resultLi.at(0).trigger('click');
      setTimeout(() => {
        expect(wrapper.vm.componentId).toBe('LinesResult');
        done();
      }, 200);
    }, 200);
  });

  it('search point detail', async done => {
    mockAxios.mockImplementation(e => {
      if (e.url === 'https://api.tianditu.gov.cn/v2/search') {
        return Promise.resolve({
          data: {
            count: '61719',
            keyWord: 'c',
            mclayer: '',
            resultType: '4',
            suggests: [
              {
                address: '四川省成都市双流区',
                gbCode: '156510116',
                name: '华阳地铁站-B口'
              },
              {
                address: '四川省成都市双流区',
                gbCode: '156510116',
                name: '华阳地铁站-C2口'
              }
            ]
          }
        });
      } else if (e.url === 'https://api.tianditu.gov.cn/v2/search/pointDetail') {
        return Promise.resolve({
          data: {
            count: '1',
            dataversion: '2021-9-28 17:58:41',
            engineversion: '20180412',
            keyWord: '华阳地铁站-B口',
            landmarkcount: 0,
            mclayer: '',
            pois: [
              {
                address: '天府大道南段1632东南方向100米',
                eaddress: '',
                ename: 'HuayangStationExit/EntranceB',
                hotPointID: '90F80006632F5615',
                lonlat: '104.067352,30.50491',
                name: '华阳地铁站-B口',
                phone: ''
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
            ],
            resultType: 1
          }
        });
      }
    });
    wrapper = mount(SmTdtSearch, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: true,
        data: {
          tk: '1d109683f4d84198e37a38c442d68311'
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.collapsed).toBeTruthy();
    expect(wrapper.vm.mapTarget).toBe('map');
    const inputSearch = wrapper.find('.sm-component-input');
    inputSearch.setValue('华阳');
    setTimeout(async () => {
      const resultLi = wrapper.findAll('.sm-component-search__result li');
      expect(resultLi.length).toBe(2);
      await wrapper.setProps({
        mapTarget: 'map',
        collapsed: true,
        data: {
          searchUrl: 'https://api.tianditu.gov.cn/v2/search/pointDetail',
          tk: '1d109683f4d84198e37a38c442d68311'
        }
      });
      await resultLi.at(0).trigger('click');
      setTimeout(() => {
        expect(wrapper.vm.componentId).toBe('PointsResult');
        done();
      }, 200);
    }, 200);
  });

  it('keyboard event', async done => {
    mockAxios.mockImplementation(e => {
      if (e.url === 'https://api.tianditu.gov.cn/v2/search') {
        return Promise.resolve({
          data: {
            count: '61719',
            keyWord: 'c',
            mclayer: '',
            resultType: '4',
            suggests: [
              {
                address: '浙江省杭州市萧山区',
                gbCode: '156330109',
                name: '成都'
              },
              {
                address: '湖南省邵阳市新邵县',
                gbCode: '156430522',
                name: '成都2'
              },
              {
                address: '四川省眉山市彭山区',
                gbCode: '156511403',
                name: '成都3'
              }
            ]
          }
        });
      }
    });
    wrapper = mount(SmTdtSearch, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: true,
        data: {
          tk: '1d109683f4d84198e37a38c442d68311'
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    const searchSucceeded = jest.spyOn(wrapper.vm, 'searchSucceeded');
    const inputSearch = wrapper.find('.sm-component-input');
    expect(inputSearch.exists()).toBeTruthy();
    inputSearch.setValue('成都');
    setTimeout(async () => {
      expect(mockAxios).toHaveBeenCalledTimes(1);
      expect(searchSucceeded).toHaveBeenCalledTimes(1);
      const resultLi = wrapper.findAll('.sm-component-search__result li');
      expect(resultLi.length).toBe(3);
      const downChoose = jest.spyOn(wrapper.vm, 'downChoose');
      await inputSearch.trigger('keyup.down');
      await inputSearch.trigger('keyup.down');
      await inputSearch.trigger('keyup.down');
      expect(downChoose).toBeCalled();
      expect(inputSearch.element.value).toBe('成都3');
      await inputSearch.trigger('keyup.up');
      await inputSearch.trigger('keyup.up');
      expect(inputSearch.element.value).toBe('成都');
      done();
    }, 500);
  });

  it('select search item', async done => {
    mockAxios.mockImplementation(e => {
      if (e.url === 'https://api.tianditu.gov.cn/v2/search') {
        return Promise.resolve({
          data: {
            count: '61719',
            keyWord: 'c',
            mclayer: '',
            resultType: '4',
            suggests: [
              {
                address: '四川省成都市双流区',
                gbCode: '156510116',
                name: '华阳地铁站-B口'
              },
              {
                address: '四川省成都市双流区',
                gbCode: '156510116',
                name: '华阳地铁站-C2口'
              }
            ]
          }
        });
      } else if (e.url === 'https://api.tianditu.gov.cn/v2/search/pointDetail') {
        return Promise.resolve({
          data: {
            count: '1',
            dataversion: '2021-9-28 17:58:41',
            engineversion: '20180412',
            keyWord: '华阳地铁站-B口',
            landmarkcount: 0,
            mclayer: '',
            pois: [
              {
                address: '天府大道南段1632东南方向100米',
                eaddress: '',
                ename: 'HuayangStationExit/EntranceB',
                hotPointID: '90F80006632F5615',
                lonlat: '104.067352,30.50491',
                name: '华阳地铁站-B口',
                phone: ''
              }
            ],
            suggests: [
              {
                address: '四川省成都市',
                gbCode: '156510100',
                name: '222路'
              },
              {
                address: '四川省成都市',
                gbCode: '156430522',
                name: '202路'
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
            ],
            resultType: 1
          }
        });
      }
    });
    wrapper = mount(SmTdtSearch, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: true,
        data: {
          tk: '1d109683f4d84198e37a38c442d68311',
          searchUrl: 'https://api.tianditu.gov.cn/v2/search/pointDetail'
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    const inputSearch = wrapper.find('.sm-component-input');
    inputSearch.setValue('华阳');
    inputSearch.trigger('input');
    setTimeout(async () => {
      const resultLi = wrapper.find('.sm-component-search__result ul li');
      await resultLi.trigger('click');
      setTimeout(() => {
        done();
      }, 200);
    }, 1000);
  });
});
