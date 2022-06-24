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

  it('finish route', async done => {
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
      } else if (e.url === 'https://api.tianditu.gov.cn/drive') {
        return Promise.resolve({
          data: `<?xml version="1.0" encoding="UTF-8" ?><result orig='104.139088,30.63114' mid=''        dest='104.129978,30.624306'>    <parameters>        <orig>104.139088,30.63114</orig>        <dest>104.129978,30.624306</dest>        <mid></mid>        <key></key>        <width>600</width>        <height>400</height>        <style>0</style>        <version></version>        <sort></sort>    </parameters>    <routes count='4' time='0.0'>                <item id='0'>            <strguide>向西出发,走200米并从中环路出口驶离,</strguide>            <signage>中环路出口</signage>            <streetName></streetName>            <nextStreetName></nextStreetName>            <tollStatus>0</tollStatus>            <turnlatlon>104.1388,30.63031</turnlatlon>        </item>                <item id='1'>            <strguide>走300米并右转到青衣江路,</strguide>            <signage></signage>            <streetName></streetName>            <nextStreetName>青衣江路</nextStreetName>            <tollStatus>0</tollStatus>            <turnlatlon>104.13669,30.63086</turnlatlon>        </item>                <item id='2'>            <strguide>沿青衣江路走300米并左转到中环路锦绣大道段,</strguide>            <signage></signage>            <streetName>青衣江路</streetName>            <nextStreetName>中环路锦绣大道段</nextStreetName>            <tollStatus>0</tollStatus>            <turnlatlon>104.13556,30.62876</turnlatlon>        </item>                <item id='3'>            <strguide>沿中环路锦绣大道段走0.7公里到达目的地。</strguide>            <signage></signage>            <streetName>中环路锦绣大道段</streetName>            <nextStreetName></nextStreetName>            <tollStatus>0</tollStatus>            <turnlatlon>104.13292,30.62978</turnlatlon>        </item>            </routes>        <simple>                <item id='0'>            <strguide>从起始点出发,进入中环路锦绣大道段。</strguide>            <streetNames></streetNames>            <lastStreetName></lastStreetName>            <linkStreetName>中环路锦绣大道段</linkStreetName>            <signage>中环路出口</signage>            <tollStatus>0</tollStatus>            <turnlatlon>104.1388,30.63031</turnlatlon>            <streetLatLon>104.1388,30.63031;104.13853,30.63041;104.13802,30.63059;104.13802,30.63059;104.13799,30.6306;104.1378,30.63066;104.13755,30.63074;104.13752,30.63075;104.13697,30.63091;104.13689,30.63092;104.13677,30.6309;104.13669,30.63086;</streetLatLon>            <streetDistance>216.0</streetDistance>                        <segmentNumber>0</segmentNumber>                    </item>                <item id='1'>            <strguide>沿中环路锦绣大道段行驶到目的地。</strguide>            <streetNames>中环路锦绣大道段</streetNames>            <lastStreetName></lastStreetName>            <linkStreetName></linkStreetName>            <signage></signage>            <tollStatus>0</tollStatus>            <turnlatlon>104.13292,30.62978</turnlatlon>            <streetLatLon>104.13292,30.62978;104.13287,30.6298;104.13279,30.62982;104.13273,30.62984;104.13273,30.62984;104.13243,30.62924;104.13243,30.62924;104.13242,30.62921;104.13226,30.62885;104.13226,30.62885;104.13212,30.62857;104.13212,30.62857;104.13206,30.62844;104.13199,30.6283;104.13195,30.62822;104.13195,30.62822;104.13189,30.62818;104.13183,30.62811;104.1318,30.62809;104.13178,30.62806;104.13176,30.62804;104.13176,30.62804;104.1317,30.62791;104.1317,30.62791;104.13164,30.62779;104.13164,30.62779;104.13143,30.62736;104.13136,30.62722;104.13136,30.62722;104.13131,30.6271;104.13131,30.6271;104.13124,30.62694;104.13111,30.6266;104.13111,30.62652;104.13112,30.62643;104.13112,30.62643;104.13105,30.62628;104.13105,30.62628;104.13056,30.62515;104.13055,30.62513;104.13055,30.62513;104.13036,30.62462;104.13036,30.62462;104.13032,30.62452;104.13032,30.62452;104.13031,30.62449;104.1303,30.62447;104.1302,30.62421;</streetLatLon>            <streetDistance>694.0</streetDistance>                        <segmentNumber>1-3</segmentNumber>                    </item>            </simple>        <distance>1.45</distance>    <duration>106.0</duration>    <routelatlon>104.139088,30.63114;104.1388,30.63031;104.13802,30.63059;104.13697,30.63091;104.13677,30.6309;104.13669,30.63086;104.13669,30.63086;104.13661,30.63084;104.13648,30.63075;104.13618,30.63018;104.136,30.62977;104.13556,30.62876;104.13556,30.62876;104.1345,30.62917;104.13424,30.62927;104.1333,30.62963;104.13292,30.62978;104.13292,30.62978;104.13273,30.62984;104.13226,30.62885;104.13212,30.62857;104.13195,30.62822;104.13189,30.62818;104.1318,30.62809;104.13176,30.62804;104.1317,30.62791;104.13164,30.62779;104.13111,30.6266;104.13112,30.62643;104.13105,30.62628;104.13055,30.62513;104.1302,30.62421;104.12997,30.6243;</routelatlon>        <mapinfo>        <center>104.13453,30.62772</center>        <scale>12</scale>    </mapinfo></result>`
        });
      }
    });
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
    const endInputEles = wrapper.find('.end-route input');
    endInputEles.setValue('北京');
    const searchBtn = wrapper.find('.search-btn .sm-component-btn');
    searchBtn.trigger('click');
    wrapper.vm.$nextTick();
    setTimeout(() => {
      expect(wrapper.find('.sm-component-tdtPointsResults').exists()).toBe(true);
      const li = wrapper.find('.sm-component-tdtPointsResults li');
      li.trigger('mouseenter');
      const clearBtnEle = wrapper.find('.sm-component-tdtPointsResults .set-start-point');
      clearBtnEle.trigger('click');
      wrapper.vm.$nextTick();
      setTimeout(() => {
        const li = wrapper.find('.sm-component-tdtPointsResults li');
        li.trigger('mouseenter');
        const clearBtnEle = wrapper.find('.sm-component-tdtPointsResults .set-start-point');
        clearBtnEle.trigger('click');
        done();
      }, 200);
    }, 1000);
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

  it('switch route', async done => {
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
    const endInputEles = wrapper.find('.end-route input');
    endInputEles.setValue('北京');
    const switchBtnEle = wrapper.find('.switch-route');
    switchBtnEle.trigger('click');
    wrapper.vm.$nextTick();
    expect(wrapper.vm.start).toBe('北京');
    expect(wrapper.vm.end).toBe('成都');
    done();
  });

  it('switch statistics route', async done => {
    mockAxios.mockImplementation(e => {
      if (e.url === 'https://api.tianditu.gov.cn/search') {
        return Promise.resolve({
          data: {
            count: '47352',
            resultType: 2,
            prompt: [
              {
                type: 4,
                admins: [
                  {
                    name: '四川省',
                    adminCode: 156510000
                  }
                ]
              }
            ],
            mclayer: '',
            statistics: {
              citysCount: 21,
              priorityCitys: [
                {
                  ename: 'Chengdu Shi',
                  name: '成都市',
                  count: '26982',
                  adminCode: 156510100,
                  lon: '103.821047',
                  lat: '30.701446999999998'
                },
                {
                  ename: 'Mianyang City',
                  name: '绵阳市',
                  count: '2109',
                  adminCode: 156510700,
                  lon: '104.703244',
                  lat: '31.849019'
                },
                {
                  ename: 'Nanchong City',
                  name: '南充市',
                  count: '1875',
                  adminCode: 156511300,
                  lon: '106.203825',
                  lat: '31.195531'
                },
                {
                  ename: 'Deyang City',
                  name: '德阳市',
                  count: '1789',
                  adminCode: 156510600,
                  lon: '104.43494299999999',
                  lat: '31.130108999999997'
                }
              ],
              provinceCount: 1,
              countryCount: 1,
              keyword: ''
            },
            keyWord: '四川'
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
    const endInputEles = wrapper.find('.end-route input');
    endInputEles.setValue('北京');
    const searchBtn = wrapper.find('.search-btn .sm-component-btn');
    searchBtn.trigger('click');
    wrapper.vm.$nextTick();
    done();
  });

  it('switch bus mode', async done => {
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
      } else if (e.url === 'https://api.tianditu.gov.cn/transit') {
        return Promise.resolve({
          data: {
            hasSubway: true,
            resultCode: 0,
            results: [
              {
                lineType: 1,
                lines: [
                  {
                    lineName: '地铁7号线 |',
                    segments: [
                      {
                        stationEnd: {
                          name: '成都东客站东广场北口',
                          uuid: '194708',
                          lonlat: '104.138282,30.63169'
                        },
                        segmentLine: [
                          {
                            linePoint: '104.139088,30.6311;104.141176,30.63131;104.138282,30.63169;',
                            segmentTime: 11,
                            byuuid: '',
                            lineName: '',
                            segmentDistance: 481,
                            segmentStationCount: '',
                            direction: ''
                          }
                        ],
                        segmentType: 1,
                        stationStart: {
                          name: '',
                          uuid: '',
                          lonlat: '104.139088,30.6311'
                        }
                      },
                      {
                        stationEnd: {
                          name: '大观站',
                          uuid: '195985',
                          lonlat: '104.129984,30.624296'
                        },
                        segmentLine: [
                          {
                            linePoint:
                              '104.138282,30.63169;104.137455,30.630647;104.136474,30.62943;104.134984,30.627533;104.132685,30.625694;104.130399,30.624494;104.129984,30.624296;',
                            segmentTime: 2,
                            byuuid: '27781',
                            SEndTime: '06:15-22:55',
                            lineName: '地铁7号线',
                            segmentDistance: 1161.07937975409,
                            segmentTransferTime: 0,
                            segmentStationCount: 1,
                            direction: '地铁7号线(火车北站地铁站-火车北站地铁站)'
                          }
                        ],
                        segmentType: 3,
                        stationStart: {
                          name: '成都东客站',
                          uuid: '194708',
                          lonlat: '104.138282,30.63169'
                        }
                      },
                      {
                        stationEnd: {
                          name: '',
                          uuid: '',
                          lonlat: '104.131303,30.62436'
                        },
                        segmentLine: [
                          {
                            linePoint: '104.129984,30.624296;104.131033,30.624498;104.131303,30.62436;',
                            segmentTime: 3,
                            byuuid: '',
                            lineName: '',
                            segmentDistance: 132,
                            segmentStationCount: 0,
                            direction: ''
                          }
                        ],
                        segmentType: 1,
                        stationStart: {
                          name: '大观站A口',
                          uuid: '195985',
                          lonlat: '104.129984,30.624296'
                        }
                      }
                    ]
                  }
                ]
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
          tk: '1d109683f4d84198e37a38c442d68311',
          carUrl: 'https://api.tianditu.gov.cn/drive',
          busUrl: 'https://api.tianditu.gov.cn/transit',
          searchUrl: 'https://api.tianditu.gov.cn/search'
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    const busBtnEle = wrapper.find('.route-tabs .bus-icon');
    busBtnEle.trigger('click');
    const startInputEles = wrapper.find('.start-route input');
    startInputEles.setValue('成都');
    const endInputEles = wrapper.find('.end-route input');
    endInputEles.setValue('北京');
    const searchBtn = wrapper.find('.search-btn .sm-component-btn');
    searchBtn.trigger('click');
    wrapper.vm.$nextTick();
    setTimeout(() => {
      expect(wrapper.find('.sm-component-tdtPointsResults').exists()).toBe(true);
      const li = wrapper.find('.sm-component-tdtPointsResults li');
      li.trigger('mouseenter');
      const clearBtnEle = wrapper.find('.sm-component-tdtPointsResults .set-start-point');
      clearBtnEle.trigger('click');
      wrapper.vm.$nextTick();
      setTimeout(() => {
        const li = wrapper.find('.sm-component-tdtPointsResults li');
        li.trigger('mouseenter');
        const clearBtnEle = wrapper.find('.sm-component-tdtPointsResults .set-start-point');
        clearBtnEle.trigger('click');
        done();
      }, 1000);
    }, 2000);
  });
});
