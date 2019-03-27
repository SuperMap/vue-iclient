import { config } from '@vue/test-utils';
import SmMap from '@/view/components/Map';
import SmQuery from '@/view/components/Query';
import { mount, createLocalVue } from '@vue/test-utils';
import iPortalDataParameter from "@/view/commontypes/iPortalDataParameter";
import mapEvent from '@/view/commontypes/mapEvent';
import RestDataParameter from "@/view/commontypes/RestDataParameter";
import RestMapParameter from "@/view/commontypes/RestMapParameter";
import ElementUI from 'element-ui'
import { Loading } from "element-ui";

config.stubs.transition = false
const localVue = createLocalVue()
localVue.use(ElementUI)
localVue.prototype.$loading = Loading;

jest.mock('@libs/mapboxgl/mapbox-gl-enhance.js', () => require('@mocks/mapboxgl').mapboxgl);
jest.mock('@libs/iclient-mapboxgl/iclient9-mapboxgl-es6.js', () => require('@mocks/mapboxgl_iclient'));


describe('query', () => {
    let mapWrapper;
    let query;

    beforeEach(() => {
        mapEvent.firstMapTarget = null;
        mapEvent.$options.mapCache = {};
        mapEvent.$options.webMapCache = {};
        query = null;
        mapWrapper = null;
        // jest.restoreAllMocks();

    })

    afterEach(() => {
        if (query) {
            query.destroy();
        }
        if (mapWrapper) {
            mapWrapper.destroy();
        }

    })

    it('iPortal Data default', (done) => {
        mapWrapper = mount(SmMap);
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
        //监控loaded是为了判断微件加载完成了
        query.vm.$on("loaded", () => {
            try {
                expect(query.vm.getMapTarget).toBe('map');
                const spyAddlayer = jest.spyOn(mapWrapper.vm.map, 'addLayer');
                query.find('.sm-query__query-button').trigger('click');
                query.vm.$nextTick(() => {
                    expect(spyAddlayer).toBeCalled();
                    spyAddlayer.mockReset();
                    spyAddlayer.mockRestore();
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

    it('iPortal Data currentMapBounds', (done) => {
        mapWrapper = mount(SmMap);
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
                // query.vm.value = "currentMapBounds"
                query.setData({ value: 'currentMapBounds' });
                const spyAddlayer = jest.spyOn(mapWrapper.vm.map, "addLayer");
                const spyGetBounds = jest.spyOn(mapWrapper.vm.map, "getBounds");
                // mapWrapper.update();
                query.vm.viewModel.on("querysucceeded", () => {
                    //要先选择当前地图，才会调用 
                    expect(spyGetBounds).toBeCalled();
                    expect(spyAddlayer).toBeCalledTimes(2);
                    spyAddlayer.mockReset();
                    spyAddlayer.mockRestore();
                    spyGetBounds.mockReset();
                    spyGetBounds.mockRestore();
                    done()
                })
                query.find('.sm-query__query-button').trigger('click');
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
        mapWrapper = mount(SmMap);
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
            }
        });
        //监控loaded是为了判断微件加载完成了
        query.vm.$on("loaded", () => {
            try {
                expect(query.vm.getMapTarget).toBe('map');
                const spyAddlayer = jest.spyOn(mapWrapper.vm.map, 'addLayer');
                query.find('.sm-query__query-button').trigger('click');
                query.vm.$nextTick(() => {
                    expect(spyAddlayer).toBeCalled();
                    spyAddlayer.mockReset();
                    spyAddlayer.mockRestore();
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


it('Rest Data currentMapBounds', (done) => {
    mapWrapper = mount(SmMap);
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
        }
    });
    query.vm.$on("loaded", () => {
        try {
            expect(query.vm.getMapTarget).toBe('map');
            query.setData({ value: 'currentMapBounds' });
            const spyAddlayer = jest.spyOn(mapWrapper.vm.map, "addLayer");
            const spyGetBounds = jest.spyOn(mapWrapper.vm.map, "getBounds");

            query.vm.viewModel.on("querysucceeded", () => {
                //要先选择当前地图，才会调用 
                expect(spyGetBounds).toBeCalled();
                expect(spyAddlayer).toBeCalledTimes(2);
                spyAddlayer.mockReset();
                spyAddlayer.mockRestore();
                spyGetBounds.mockReset();
                spyGetBounds.mockRestore();
                done()
            })
            query.find('.sm-query__query-button').trigger('click');
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

it('Rest Map default', (done) => {
    mapWrapper = mount(SmMap);
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
    //监控loaded是为了判断微件加载完成了
    query.vm.$on("loaded", () => {
        try {
            expect(query.vm.getMapTarget).toBe('map');
            const spyAddlayer = jest.spyOn(mapWrapper.vm.map, 'addLayer');

            query.find('.sm-query__query-button').trigger('click');
            query.vm.$nextTick(() => {
                expect(spyAddlayer).toBeCalled();
                spyAddlayer.mockReset();
                spyAddlayer.mockRestore();
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

it('Rest Map currentMapBounds', (done) => {
    mapWrapper = mount(SmMap);
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
    query.vm.$on("loaded", () => {
        try {
            expect(query.vm.getMapTarget).toBe('map');
            query.setData({ value: 'currentMapBounds' });
            const spyAddlayer = jest.spyOn(mapWrapper.vm.map, "addLayer");
            const spyGetBounds = jest.spyOn(mapWrapper.vm.map, "getBounds");

            query.vm.viewModel.on("querysucceeded", () => {
                expect(spyGetBounds).toBeCalled();
                expect(spyAddlayer).toBeCalledTimes(2);
                spyAddlayer.mockReset();
                spyAddlayer.mockRestore();
                spyGetBounds.mockReset();
                spyGetBounds.mockRestore();
                done()
            })
            query.find('.sm-query__query-button').trigger('click');
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