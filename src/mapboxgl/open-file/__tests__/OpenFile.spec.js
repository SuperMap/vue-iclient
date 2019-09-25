import { mount, createLocalVue } from '@vue/test-utils';
import SmWebMap from '../../web-map/WebMap';
import SmOpenFile from '../OpenFile.vue';
import mapEvent from '@types_mapboxgl/map-event';

jest.mock('@libs/mapboxgl/mapbox-gl-enhance', () => require('@mocks/mapboxgl').mapboxgl);
jest.mock('@libs/iclient-mapboxgl/iclient10-mapboxgl.min', () => require('@mocks/mapboxgl_iclient'));

import { message } from 'ant-design-vue';
const localVue = createLocalVue()
localVue.prototype.$message = message;

describe('OpenFile.vue', () => {

    let wrapper;
    let mapWrapper;

    let china = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "id": "81",
                    "name": "香港",
                    "cp": [
                        114.2578,
                        22.3242
                    ],
                    "childNum": 1
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                114.6094,
                                22.4121
                            ],

                            [
                                114.6094,
                                22.4121
                            ]
                        ]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "82",
                    "name": "澳门",
                    "cp": [
                        113.5547,
                        22.1484
                    ],
                    "childNum": 1
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                113.5986,
                                22.1649
                            ],

                            [
                                113.5986,
                                22.1649
                            ]
                        ]
                    ]
                }
            }
        ]
    };

    beforeEach(() => {
        mapEvent.firstMapTarget = null;
        mapEvent.$options.mapCache = {};
        mapEvent.$options.webMapCache = {};
        wrapper = null;
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
        jest.restoreAllMocks();
        if (wrapper && wrapper !== "undefined") {
            wrapper.destroy();
        }
        if (mapWrapper && mapWrapper !== "undefined") {
            mapWrapper.destroy();
        }
    })

    it('default', (done) => {

        wrapper = mount(SmOpenFile, {
            localVue
        });

        wrapper.vm.$on("loaded", () => {
            try {
                wrapper.vm.$on('open-file-succeeded', function (e) {
                    try {
                        expect(e.features.length).toBe(2);
                        done();
                    } catch (exception) {
                        console.log("'readfile'案例失败：" + exception.name + ":" + exception.message);
                        expect(false).toBeTruthy();
                        done();
                    }
                })
                var blob = new Blob([JSON.stringify(china)],
                    { type: 'application/json' });
                var name = './base/resources/china.json';
                var type = 'application/json';
                let file = new File([blob], name, {
                    type: type,
                });

                var fileEventObject = {
                    target: {
                        files: {
                            0: file
                        },
                        value: "./base/resources/china.json"
                    }
                };
                wrapper.vm.viewModel.readFile(fileEventObject);

            } catch (exception) {
                console.log("Openfile_default" + exception.name + ":" + exception.message);
                expect(false).toBeTruthy();
                done();
            }
        })
    })

    it('custom setting', (done) => {

        wrapper = mount(SmOpenFile, {
            localVue,
            mocks: {
                $t: key => key
            },
            propsData: {
                addToMap: false,
                clearLastLayer: true
            }
        });
        wrapper.vm.$on("loaded", () => {
            try {
                wrapper.vm.$on('open-file-succeeded', function (e) {
                    try {
                        expect(e.features.length).toBe(2);
                        expect(wrapper.vm.prevLayerId).toContain('layer-smopenfile');
                        done();
                    } catch (exception) {
                        console.log("'readfile'案例失败：" + exception.name + ":" + exception.message);
                        expect(false).toBeTruthy();
                        done();
                    }
                })
                var blob = new Blob([JSON.stringify(china)],
                    { type: 'application/json' });
                var name = './base/resources/china.json';
                var type = 'application/json';
                let file = new File([blob], name, {
                    type: type,
                });

                var fileEventObject = {
                    target: {
                        files: {
                            0: file
                        },
                        value: "./base/resources/china.json"
                    }
                };
                wrapper.vm.viewModel.readFile(fileEventObject);
            } catch (exception) {
                console.log("Openfile_default" + exception.name + ":" + exception.message);
                expect(false).toBeTruthy();
                done();
            }
        })
    })

    it('fail', (done) => {

        wrapper = mount(SmOpenFile, {
            localVue,
            propsData: {
                addToMap: false,
                clearLastLayer: true
            }
        });
        wrapper.vm.$on("loaded", () => {

            wrapper.vm.$on('error-file-format', function (e) {
                try {
                    expect(e.message).toBe('File format is not supported!');
                    done();
                } catch (exception) {
                    console.log("'readfile'案例失败：" + exception.name + ":" + exception.message);
                    expect(false).toBeTruthy();
                    done();
                }
            })
            var name = 'test.txt';
            var blob = new Blob(["This is my blob content"], { type: "text/plain" });
            let file = new File([blob], name, {
                type: "text/plain",
            });
            var fileEventObject = {
                target: {
                    files: {
                        0: file
                    },
                }
            };
            wrapper.vm.viewModel.readFile(fileEventObject);
        })
    })

})

