import { mount, createLocalVue } from '@vue/test-utils';
import SmWebMap from '../../web-map/WebMap';
import SmSearch from '../Search.vue';
import mapEvent from '@types_mapboxgl/map-event';
import RestMapParameter from '@types_common/RestMapParameter';
import RestDataParameter from '@types_common/RestDataParameter';
import iPortalDataParameter from '@types_common/iPortalDataParameter';
import AddressMatchParameter from '@types_common/AddressMatchParameter';

import { Icon, Input, message } from 'ant-design-vue';

jest.mock('@libs/mapboxgl/mapbox-gl-enhance', () => require('@mocks/mapboxgl').mapboxgl);
jest.mock('@libs/iclient-mapboxgl/iclient-mapboxgl.min', () => require('@mocks/mapboxgl_iclient'));
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

        jest.restoreAllMocks();
        mapWrapper = mount(SmWebMap, {
            localVue,
            propsData: {
                serverUrl: 'http://support.supermap.com.cn:8092/',
                mapId: '1649097980'
                //1649097980
            }
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
        if (wrapper && wrapper !== 'undefined') {
            wrapper.destroy();
        }
        if (mapWrapper && mapWrapper !== 'undefined') {
            mapWrapper.destroy();
        }
        wrapper = null;
        mapWrapper = null;
    });

    it('layerNames', (done) => {
        // var host = 'http://support.supermap.com.cn:8090';
        wrapper = mount(SmSearch, {
            localVue,
            propsData: {
                layerNames: ["UNIQUE-民航数-0"],
                onlineLocalSearch:
                {
                    enable: false,
                    // city: '北京市'
                }
            }
        });
        mapWrapper.vm.viewModel.on("addlayerssucceeded", () => {
            wrapper.vm.$on('loaded', () => {
                try {
                    wrapper.vm.$on('search-succeeded', result => {
                        expect(result.searchResult[0].source).toEqual('UNIQUE-民航数-0');
                        expect(result.searchResult[0].result[0].filterVal).toContain('北京/首都');
                        done();
                    });
                    wrapper.vm.search('北京');
                } catch (exception) {
                    console.log("案例失败：" + exception.name + ':' + exception.message);
                    expect(false).toBeTruthy();
                    done();
                }
            });
        });
    });

    it('onlineLocalSearch', (done) => {
        wrapper = mount(SmSearch, {
            localVue
        });
        mapWrapper.vm.viewModel.on("addlayerssucceeded", () => {
            wrapper.vm.$on('loaded', () => {
                try {
                    wrapper.vm.$on('search-succeeded', result => {
                        expect(result.searchResult[0].source).toEqual('Online 本地搜索');
                        expect(result.searchResult[0].result[0].filterVal).toContain('北京');
                        done();
                    });
                    wrapper.vm.search('北京');
                } catch (exception) {
                    console.log("案例失败：" + exception.name + ':' + exception.message);
                    expect(false).toBeTruthy();
                    done();
                }
            });
        });
    });

    it('restMap', (done) => {
        var host = 'http://support.supermap.com.cn:8090';
        wrapper = mount(SmSearch, {
            localVue,
            propsData: {
                onlineLocalSearch:
                {
                    enable: false,
                    // city: '北京市'
                },
                restMap: [
                    new RestMapParameter({
                        url: host + '/iserver/services/map-world/rest/maps/World',
                        layerName: 'Capitals@World.1'
                    })
                ]
            }
        });
        mapWrapper.vm.viewModel.on("addlayerssucceeded", () => {
            wrapper.vm.$on('loaded', () => {
                try {
                    //需要确认下是否是bug
                    wrapper.vm.$on('search-succeeded', result => {
                    // wrapper.vm.viewModel.on('searchsucceeded', result => {
                        expect(result.searchResult[0].source).toEqual("SuperMap Rest Map");
                        expect(result.searchResult[0].result[0].properties.NAME).toEqual("四川省");
                        done();
                    });
                    wrapper.vm.search('四川');
                } catch (exception) {
                    console.log("案例失败：" + exception.name + ':' + exception.message);
                    expect(false).toBeTruthy();
                    done();
                }
            });
        });
    });

    xit('restData', (done) => {
        var host = 'http://support.supermap.com.cn:8090';
        wrapper = mount(SmSearch, {
            localVue,
            propsData: {
                onlineLocalSearch:
                {
                    enable: false,
                    // city: '北京市'
                },
                restData: [
                    new RestDataParameter({
                        url: host + '/iserver/services/data-world/rest/data',
                        dataName: ['World:Countries']
                    })
                ]
            }
        });
        mapWrapper.vm.viewModel.on("addlayerssucceeded", () => {
            wrapper.vm.$on('loaded', () => {
                try {
                    //与上面的案例，有关联，
                    wrapper.vm.$on('search-succeeded', result => {
                    // wrapper.vm.viewModel.on('searchsucceeded', result => {
                        // expect(result.result[0].source).toEqual("SuperMap Rest Data");
                        expect(result.searchResult[0].source).toEqual("SuperMap Rest Data");
                        expect(result.searchResult[0].result[0].properties.NAME).toEqual("四川省");
                        // expect(result.result[0].result[0].properties.NAME).toEqual("四川省");
                        done();
                    });
                    wrapper.vm.search('四川');
                } catch (exception) {
                    console.log("案例失败：" + exception.name + ':' + exception.message);
                    expect(false).toBeTruthy();
                    done();
                }
            });
        });
    });

    it('iportal data', (done) => {
        var host = 'http://support.supermap.com.cn:8090';
        wrapper = mount(SmSearch, {
            localVue,
            propsData: {
                onlineLocalSearch:
                {
                    enable: false,
                    // city: '北京市'
                },
                iportalData: [
                    new iPortalDataParameter({
                        url: 'http://192.168.12.230:8092/web/datas/2040117719'
                    })
                ],
            }
        });
        mapWrapper.vm.viewModel.on("addlayerssucceeded", () => {
            wrapper.vm.$on('loaded', () => {
                try {
                    wrapper.vm.$on('search-succeeded', result => {
                        expect(result.searchResult[0].source).toEqual("SuperMap iPortal Data");
                        expect(JSON.stringify(result.searchResult[0].result[0].properties)).toContain("黑龙江");
                        done();
                    });
                    wrapper.vm.search('黑龙江');
                } catch (exception) {
                    console.log("案例失败：" + exception.name + ':' + exception.message);
                    expect(false).toBeTruthy();
                    done();
                }
            });
        });
    });

    it('addressMatch', (done) => {
        var host = 'http://support.supermap.com.cn:8090';
        wrapper = mount(SmSearch, {
            localVue,
            propsData: {
                onlineLocalSearch:
                {
                    enable: false,
                    // city: '北京市'
                },
                addressMatch: [
                    new AddressMatchParameter({
                        url: host + '/iserver/services/addressmatch-Address/restjsr/v1/address'
                    })
                ]
            }
        });
        mapWrapper.vm.viewModel.on("addlayerssucceeded", () => {
            wrapper.vm.$on('loaded', () => {
                try {
                    wrapper.vm.$on('search-succeeded', result => {
                    // 没有触发 search-succeeded 需要确认下是否是bug
                    // wrapper.vm.viewModel.on('searchsucceeded', result => {
                        expect(result.searchResult[0].source).toEqual("SuperMap AddressMatch");
                        expect(result.searchResult[0].result[0].address).toEqual("北京市海淀区中关村大街59号中国人民大学");
                        done();
                    });
                    wrapper.vm.search('中国');
                } catch (exception) {
                    console.log("案例失败：" + exception.name + ':' + exception.message);
                    expect(false).toBeTruthy();
                    done();
                }
            });
        });
    });
});
