import { config } from '@vue/test-utils';
import SmQuery from '../Query';
import {
    mount, createLocalVue
} from '@vue/test-utils';
import iPortalDataParameter from "@types_common/iPortalDataParameter";
import mapEvent from '@types_mapboxgl/map-event';
import RestDataParameter from "@types_common/RestDataParameter";
import RestMapParameter from "@types_common/RestMapParameter";

import SmWebMap from '../../web-map/WebMap';

import { Icon, Card, Collapse, Select, Button, message } from 'ant-design-vue';

config.stubs.transition = false
const localVue = createLocalVue()
localVue.use(Card);
localVue.use(Collapse);
localVue.use(Icon);
localVue.use(Select);
localVue.use(Button);
localVue.prototype.$message = message;

jest.mock('@libs/mapboxgl/mapbox-gl-enhance', () => require('@mocks/mapboxgl').mapboxgl);
jest.mock('@libs/iclient-mapboxgl/iclient9-mapboxgl.min', () => require('@mocks/mapboxgl_iclient'));


describe('query', () => {
    let mapWrapper;
    let query;

    beforeEach(() => {
        mapEvent.firstMapTarget = null;
        mapEvent.$options.mapCache = {};
        mapEvent.$options.webMapCache = {};
        query = null;
        mapWrapper = null;
        jest.restoreAllMocks();
        mapWrapper = mount(SmWebMap,
            {
                localVue,
                propsData: {
                    serverUrl: 'http://support.supermap.com.cn:8092/',
                    mapId: '1649097980'
                }
            });

    })

    afterEach(() => {
        if (query && query !== "undefined") {
            query.destroy();
        }
        if (mapWrapper && mapWrapper !== "undefined") {
            mapWrapper.destroy();
        }

    })


    it('iPortal Data default', (done) => {

        query = mount(SmQuery, {
            localVue,
            propsData: {
                mapTarget: "map",
                iportalData: [
                    new iPortalDataParameter({
                        url: "http://192.168.12.230:8092/web/datas/1962026684",
                        attributeFilter: "SmID>0",
                    })
                ]
            }
        });
        //监控loaded是为了判断组件加载完成了
        query.vm.$on("loaded", () => {
            try {
                expect(query.vm.getMapTarget).toBe('map');
                const spyAddlayer = jest.spyOn(query.vm.map, 'addLayer');
                query.vm.$on("query-succeeded", () => {
                    expect(spyAddlayer).toBeCalled();
                    spyAddlayer.mockReset();
                    spyAddlayer.mockRestore();
                    done()
                })

                query.find('.sm-component-query__job-info-header').trigger('click');
                query.vm.$nextTick(() => {
                    query.find('.sm-component-query__a-button').trigger('click');

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

    it('iPortal Data currentMapBounds', (done) => {
        query = mount(SmQuery, {
            localVue,
            propsData: {
                mapTarget: "map",
                iportalData: [
                    new iPortalDataParameter({
                        url: "http://192.168.12.230:8092/web/datas/1962026684",
                        attributeFilter: "SmID>0",
                    })
                ]
            }
        });

        query.vm.$on("loaded", () => {
            try {
                expect(query.vm.getMapTarget).toBe('map');
                const spyAddlayer = jest.spyOn(query.vm.map, "addLayer");
                const spyGetBounds = jest.spyOn(query.vm.map, "getBounds");
                query.vm.$on("query-succeeded", () => {
                    //要先选择当前地图，才会调用 
                    expect(spyGetBounds).toBeCalled();
                    expect(spyAddlayer).toBeCalledTimes(2);
                    console.log("query")
                    spyAddlayer.mockReset();
                    spyAddlayer.mockRestore();
                    spyGetBounds.mockReset();
                    spyGetBounds.mockRestore();
                    done()
                })
                query.find('.sm-component-query__job-info-header').trigger('click');
                query.vm.$nextTick(() => {
                    query.find('.ant-select-selection__rendered').trigger('click');
                    query.vm.$nextTick(() => {
                        query.find('i.ant-select-arrow-icon').trigger('click');
                        query.vm.$nextTick(() => {
                            query.findAll('ul.ant-select-dropdown-menu li').at(0).trigger('click');
                            query.vm.$nextTick(() => {
                                query.find('.sm-component-query__a-button').trigger('click');
                            })
                        })
                    })
                })
            } catch (exception) {
                console.log("query" + exception.name + ":" + exception.message);
                expect(false).toBeTruthy();
                spyAddlayer.mockReset();
                spyAddlayer.mockRestore();
                spyGetBounds.mockReset();
                spyGetBounds.mockRestore();
                done()
            }
        })
    })

    it('Rest Data default', (done) => {

        query = mount(SmQuery, {
            localVue,
            propsData: {
                mapTarget: "map",
                restData: [
                    new RestDataParameter({
                        url: "http://192.168.12.230:8092/iserver/services/data-world/rest/data",
                        attributeFilter: "SmID>0",
                        dataName: ["World:Countries"],
                    })
                ]
            },
        });
        //监控loaded是为了判断组件加载完成了
        query.vm.$on("loaded", () => {
            try {
                expect(query.vm.getMapTarget).toBe('map');
                const spyAddlayer = jest.spyOn(query.vm.map, 'addLayer');
                query.vm.$on("query-succeeded", () => {
                    expect(spyAddlayer).toBeCalled();
                    spyAddlayer.mockReset();
                    spyAddlayer.mockRestore();
                    done()
                })

                query.find('.sm-component-query__job-info-header').trigger('click');
                query.vm.$nextTick(() => {
                    query.find('.sm-component-query__a-button').trigger('click');
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

    it('Rest Map default', (done) => {

        query = mount(SmQuery, {
            localVue,
            propsData: {
                mapTarget: "map",
                restMap: [
                    new RestMapParameter({
                        url: "http://192.168.12.230:8092/iserver/services/map-world/rest/maps/World",
                        attributeFilter: "SmID>0",
                        layerName: "Capitals@World.1",
                    })
                ]
            }
        });
        //监控loaded是为了判断组件加载完成了
        query.vm.$on("loaded", () => {
            try {
                expect(query.vm.getMapTarget).toBe('map');
                const spyAddlayer = jest.spyOn(query.vm.map, 'addLayer');
                query.vm.$on("query-succeeded", () => {
                    expect(spyAddlayer).toBeCalledTimes(2);
                    spyAddlayer.mockReset();
                    spyAddlayer.mockRestore();
                    done()
                })
                query.find('.sm-component-query__job-info-header').trigger('click');
                query.vm.$nextTick(() => {
                    query.find('.sm-component-query__a-button').trigger('click');
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

    it('Rest Map currentMapBounds', (done) => {

        query = mount(SmQuery, {
            localVue,
            propsData: {
                mapTarget: "map",
                restMap: [
                    new RestMapParameter({
                        url: "http://192.168.12.230:8092/iserver/services/map-world/rest/maps/World",
                        attributeFilter: "SmID>0",
                        layerName: "Capitals@World.1",
                    })
                ]
            },
            sync: false
        });
        query.vm.$on("loaded", () => {
            try {
                expect(query.vm.getMapTarget).toBe('map');
                // query.setData({ value: 'currentMapBounds' });
                const spyAddlayer = jest.spyOn(query.vm.map, "addLayer");
                const spyGetBounds = jest.spyOn(query.vm.map, "getBounds");

                query.vm.$on("query-succeeded", () => {
                    expect(spyGetBounds).toBeCalled();
                    expect(spyAddlayer).toBeCalledTimes(2);
                    spyAddlayer.mockReset();
                    spyAddlayer.mockRestore();
                    spyGetBounds.mockReset();
                    spyGetBounds.mockRestore();
                    done()
                })
                query.find('.sm-component-query__job-info-header').trigger('click');
                query.vm.$nextTick(() => {
                    query.find('.ant-select-selection__rendered').trigger('click');
                    query.vm.$nextTick(() => {
                        query.find('i.ant-select-arrow-icon').trigger('click');
                        query.vm.$nextTick(() => {
                            query.findAll('ul.ant-select-dropdown-menu li').at(0).trigger('click');
                            query.vm.$nextTick(() => {
                                query.find('.sm-component-query__a-button').trigger('click');
                            })
                        })
                    })
                })
            } catch (exception) {
                console.log("query" + exception.name + ":" + exception.message);
                expect(false).toBeTruthy();
                spyAddlayer.mockReset();
                spyAddlayer.mockRestore();
                spyGetBounds.mockReset();
                spyGetBounds.mockRestore();
                done()
            }
        })
    })

   
/**
 * 案例关联，先ignore后面再处理
 */
    xit('Rest Data currentMapBounds', (done) => {

        query = mount(SmQuery, {
            localVue,
            propsData: {
                mapTarget: "map",
                restData: [
                    new RestDataParameter({
                        url: "http://192.168.12.230:8092/iserver/services/data-world/rest/data",
                        attributeFilter: "SmID>0",
                        dataName: ["World:Countries"],
                    })
                ]
            },
            sync: false
        });
        query.vm.$on("loaded", () => {
            try {
                expect(query.vm.getMapTarget).toBe('map');
                const spyAddlayer = jest.spyOn(query.vm.map, "addLayer");
                const spyGetBounds = jest.spyOn(query.vm.map, "getBounds");

                query.vm.$on("query-succeeded", () => {
                    //要先选择当前地图，才会调用 
                    expect(spyGetBounds).toBeCalled();
                    expect(spyAddlayer).toBeCalledTimes(2);
                    spyAddlayer.mockReset();
                    spyAddlayer.mockRestore();
                    spyGetBounds.mockReset();
                    spyGetBounds.mockRestore();
                    done()
                })
                query.find('.sm-component-query__job-info-header').trigger('click');
                query.vm.$nextTick(() => {
                    query.find('.ant-select-selection__rendered').trigger('click');
                    query.vm.$nextTick(() => {
                        query.find('i.ant-select-arrow-icon').trigger('click');
                        query.vm.$nextTick(() => {
                            query.findAll('ul.ant-select-dropdown-menu li').at(0).trigger('click');
                            query.vm.$nextTick(() => {
                                query.find('.sm-component-query__a-button').trigger('click');
                            })
                        })
                    })
                    // })
                })
            } catch (exception) {
                console.log("query" + exception.name + ":" + exception.message);
                expect(false).toBeTruthy();
                spyAddlayer.mockReset();
                spyAddlayer.mockRestore();
                spyGetBounds.mockReset();
                spyGetBounds.mockRestore();
                done()
            }
        })
    })


})