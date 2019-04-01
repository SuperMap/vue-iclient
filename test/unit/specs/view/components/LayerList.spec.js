import { mount, createLocalVue } from '@vue/test-utils';
import SmMap from '@/view/components/Map';
import SmLayerList from '@/view/components/LayerList.vue';
import mapEvent from '@/view/commontypes/mapEvent';
import { config } from '@vue/test-utils';
import ElementUI from 'element-ui'
import { Loading } from "element-ui";

config.stubs.transition = false
const localVue = createLocalVue()
localVue.use(ElementUI)
localVue.prototype.$loading = Loading;

jest.mock('@libs/mapboxgl/mapbox-gl-enhance.js', () => require('@mocks/mapboxgl').mapboxgl);

describe('LayerList.vue', () => {

    let wrapper;
    let mapWrapper;
    let host = "test";

    beforeEach(() => {
        mapEvent.firstMapTarget = null;
        mapEvent.$options.mapCache = {};
        mapEvent.$options.webMapCache = {};
        wrapper = null;
        mapWrapper = null;
    })

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
        if (mapWrapper) {
            mapWrapper.destroy();
        }
    })

    it('layerGroupVisibility tile', (done) => {
        mapWrapper = mount(SmMap,
            {
                propsData: {
                    mapOptions:
                    {
                        style: {
                            version: 8,
                            sources: {
                                "raster-tiles": {
                                    type: "raster",
                                    tiles: [
                                        host +
                                        "/iserver/services/map-china400/rest/maps/China/zxyTileImage.png?z={z}&x={x}&y={y}"
                                    ],
                                    tileSize: 256
                                }
                            },
                            layers: [
                                {
                                    id: "simple-tiles",
                                    type: "raster",
                                    source: "raster-tiles"
                                }
                            ]
                        }
                    }
                }
            });

        let spyProperty = jest.spyOn(mapWrapper.vm.map, "setLayoutProperty");
        wrapper = mount(SmLayerList, {
            localVue,
            propsData: {
                mapTarget: "map"
            }
        });

        wrapper.vm.$on("loaded", () => {
            try {
                expect(wrapper.vm.getMapTarget).toBe('map');
                wrapper.find('i.el-icon-view').trigger('click')
                expect(spyProperty).toHaveBeenCalledTimes(1);
                mapWrapper.destroy();
                done();
            } catch (exception) {
                console.log("LayerList_default" + exception.name + ":" + exception.message);
                expect(false).toBeTruthy();
                mapWrapper.destroy();
                done();
            }
        })
    });

    it('layerGroupVisibility vector-tile', (done) => {
        mapWrapper = mount(SmMap,
            {
                // attachToDocument: true,
                propsData: {
                    mapOptions:
                    {
                        container: "map",
                        style:
                        {
                            version: 8,
                            sources: {
                                "vector-tiles": {
                                    "type": "vector",
                                    "tiles": [host + "/iserver/services/map-beijing/rest/maps/beijingMap/tileFeature.mvt?returnAttributes=true&compressTolerance=-1&width=512&height=512&viewBounds={bbox-epsg-3857}&expands=0:0_2,132_128,138_64,141_32,143_16,145_8,147_4"]
                                },
                            },
                            layers:
                                [
                                    {
                                        "id": "三级道路L@北京",
                                        "type": "line",
                                        "source": "vector-tiles",
                                        "source-layer": "三级道路L@北京",

                                    },
                                    {
                                        "id": "二级道路L@北京"
                                    }
                                ]
                        }
                    }
                }
            });


        let spyProperty = jest.spyOn(mapWrapper.vm.map, "setLayoutProperty");
        wrapper = mount(SmLayerList, {
            localVue,
            propsData: {
                mapTarget: "map"
            }
        });

        wrapper.vm.$on("loaded", () => {
            try {
                expect(wrapper.vm.getMapTarget).toBe('map');
                wrapper.find('i.el-icon-view').trigger('click');
                expect(spyProperty).toHaveBeenNthCalledWith(1, "三级道路L@北京", 'visibility',"none");
                expect(spyProperty).toHaveBeenNthCalledWith(2, "二级道路L@北京", 'visibility', "none");
                expect(spyProperty).toHaveBeenNthCalledWith(3, "二级道路L@北京1", 'visibility', "none");
                wrapper.find('i.el-collapse-item__arrow').trigger('click');
                let checkInput = wrapper.findAll('input[type="checkbox"]').at(1)
                checkInput.setChecked();
                checkInput.trigger('change');
                expect(spyProperty).toHaveBeenNthCalledWith(4, "二级道路L@北京", 'visibility', expect.any(String));
                expect(spyProperty).toHaveBeenNthCalledWith(5, "二级道路L@北京1", 'visibility', expect.any(String));
        
                mapWrapper.destroy();
                done();
            } catch (exception) {
                console.log("LayerList_default" + exception.name + ":" + exception.message);
                expect(false).toBeTruthy();
                mapWrapper.destroy();
                done();
            }
        })
    })
})