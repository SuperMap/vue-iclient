
// /**
//  * @jest-environment node
//  */


import { config } from '@vue/test-utils';
import SmMap from '@/view/components/Map';
import SmMeasure from '@/view/components/Measure';
import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import mapEvent from '@/view/commontypes/mapEvent';
import ElementUI from 'element-ui'

config.stubs.transition = false
const localVue = createLocalVue()

localVue.use(ElementUI);
// import ElementLocale from 'element-ui/lib/locale';

// import VueI18n from 'vue-i18n';
// import zhLocale from '../../../../../src/lang/zh.js'
// import enLocale from '../../../../../src/lang/en.js'

// localVue.use(VueI18n);

// const messages = {
//   en: {
//     ...enLocale
//   },
//   zh: {
//     ...zhLocale
//   }
// }
// const i18n =
//   new VueI18n({
//     locale: "zh",
//     fallbackLocale: "zh",
//     messages
//   })
// Object.defineProperty(localVue.prototype, '$i18n', {
//     get: function get() {
//       return i18n
//     }
//   });

jest.mock('@libs/mapboxgl/mapbox-gl-enhance.js', () => require('@mocks/mapboxgl').mapboxgl);
jest.mock('@mapbox/mapbox-gl-draw', () => require('@mocks/mapboxgl_draw').MapboxDraw);


describe('mesure', () => {
    let mapWrapper;
    let measureWrapper;

    beforeEach(() => {
        mapEvent.firstMapTarget = null;
        mapEvent.$options.mapCache = {};
        mapEvent.$options.webMapCache = {};
        measureWrapper = null;
        mapWrapper = null;
        jest.restoreAllMocks();

    })

    afterEach(() => {
        jest.restoreAllMocks();
        if (measureWrapper && measureWrapper !== "undefined") {
            measureWrapper.destroy();
        }
        if (mapWrapper && measureWrapper !== "undefined") {
            mapWrapper.destroy();
        }

    })

    it('line default', (done) => {
        mapWrapper = mount(SmMap);
        measureWrapper = shallowMount(SmMeasure, {
            localVue,
            propsData: {
                mapTarget: "map"
            },
            // i18n,
            // sync: false
        });

        measureWrapper.vm.$on("loaded", () => {
            try {
                expect(measureWrapper.vm.getMapTarget).toBe('map');
                const spyDeleteAll = jest.spyOn(measureWrapper.vm.viewModel.draw, 'deleteAll');
                const spychangeMode = jest.spyOn(measureWrapper.vm.viewModel.draw, 'changeMode');
                measureWrapper.find('i.sm-components-icons-line-layer').trigger('click');

                measureWrapper.vm.$nextTick(() => {
                    expect(spyDeleteAll).toBeCalled();
                    expect(spychangeMode).toBeCalled();
                    measureWrapper.vm.viewModel.on("measure-finished", (measureResult) => {
                        expect(measureResult.result).toBe("1388.1809");
                        done()
                    })
                    var data = {
                        lngLat: { lng: 137.92559401751038, lat: 39.972407560141534 }
                    }
                    mapWrapper.vm.map.fire('mousedown', data)
                    // measureWrapper.vm.map.fire('mousedown',data)
                    expect(measureWrapper.vm.viewModel.tipNodes.length).toBe(1);
                    data = {
                        lngLat: { lng: 147.92559401751038, lat: 42.972407560141534 }
                    };
                    mapWrapper.vm.map.fire('mousemove', data),
                        expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe("896.7302 千米");

                    var e = {
                        "features": [{ "id": "786c3dc0b07c96d1ac0d1b72614a3697", "type": "Feature", "properties": {}, "geometry": { "coordinates": [[142.93535964243574, 51.313036821416745], [154.00957839243767, 41.405163546980134]], "type": "LineString" } }]
                    }
                    mapWrapper.vm.map.fire('draw.create', e)
                })
            } catch (exception) {
                console.log("measure" + exception.name + ":" + exception.message);
                expect(false).toBeTruthy();
                done()
            }
        })
    })

    //ignore 改变prop后，期望得到的默认单位会变成修改后的即meters,但是得到的还是原来的即kilometers
    xit('line change defaultUnit', (done) => {
        mapWrapper = mount(SmMap);
        measureWrapper = shallowMount(SmMeasure, {
            localVue,
            propsData: {
                mapTarget: "map",
                // distanceDefaultUnit:"meters"
            },
            // i18n,
            sync: false
        });
        measureWrapper.setProps({ distanceDefaultUnit: 'meters' });
        measureWrapper.vm.$on("loaded", () => {
            try {
                expect(measureWrapper.vm.getMapTarget).toBe('map');
                const spyDeleteAll = jest.spyOn(measureWrapper.vm.viewModel.draw, 'deleteAll');
                const spychangeMode = jest.spyOn(measureWrapper.vm.viewModel.draw, 'changeMode');
                measureWrapper.find('i.sm-components-icons-line-layer').trigger('click');

                measureWrapper.vm.$nextTick(() => {
                    expect(spyDeleteAll).toBeCalled();
                    expect(spychangeMode).toBeCalled();
                    expect(measureWrapper.find(".sm-component-measure__unit.sm-component-measure__default").text()).toBe("米");
                    measureWrapper.vm.viewModel.on("measure-finished", (measureResult) => {
                        expect(measureResult.result).toBe("1388.1809");
                        done()
                    })
                    var data = {
                        lngLat: { lng: 137.92559401751038, lat: 39.972407560141534 }
                    }
                    mapWrapper.vm.map.fire('mousedown', data)
                    expect(measureWrapper.vm.viewModel.tipNodes.length).toBe(1);
                    data = {
                        lngLat: { lng: 147.92559401751038, lat: 42.972407560141534 }
                    };
                    mapWrapper.vm.map.fire('mousemove', data),
                        expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe("896.7302 千米");

                    var e = {
                        "features": [{ "id": "786c3dc0b07c96d1ac0d1b72614a3697", "type": "Feature", "properties": {}, "geometry": { "coordinates": [[142.93535964243574, 51.313036821416745], [154.00957839243767, 41.405163546980134]], "type": "LineString" } }]
                    }
                    mapWrapper.vm.map.fire('draw.create', e)
                })
            } catch (exception) {
                console.log("measure" + exception.name + ":" + exception.message);
                expect(false).toBeTruthy();
                done()
            }
        })
    })


    it('line mile', (done) => {
        mapWrapper = mount(SmMap);
        measureWrapper = mount(SmMeasure, {
            localVue,
            propsData: {
                mapTarget: "map"
            },
            sync: false
        });
        measureWrapper.vm.$on("loaded", () => {
            try {
                expect(measureWrapper.vm.getMapTarget).toBe('map');
                const spyDeleteAll = jest.spyOn(measureWrapper.vm.viewModel.draw, 'deleteAll');
                const spychangeMode = jest.spyOn(measureWrapper.vm.viewModel.draw, 'changeMode');
                measureWrapper.find('i.sm-components-icons-line-layer').trigger('click');

                measureWrapper.vm.$nextTick(() => {
                    expect(spyDeleteAll).toBeCalled();
                    expect(spychangeMode).toBeCalled();
                    measureWrapper.find('.el-input__suffix').trigger("click");
                    measureWrapper.findAll('li.el-select-dropdown__item').at(1).trigger("click");

                    measureWrapper.vm.viewModel.on("measure-finished", (measureResult) => {
                        expect(measureResult.result).toBe("862.5756");
                        done()
                    })
                    var data = {
                        lngLat: { lng: 137.92559401751038, lat: 39.972407560141534 }
                    }
                    mapWrapper.vm.map.fire('mousedown', data)
                    expect(measureWrapper.vm.viewModel.tipNodes.length).toBe(1);
                    data = {
                        lngLat: { lng: 147.92559401751038, lat: 42.972407560141534 }
                    };
                    mapWrapper.vm.map.fire('mousemove', data),
                        expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe("557.2023 英里");

                    var e = {
                        "features": [{ "id": "786c3dc0b07c96d1ac0d1b72614a3697", "type": "Feature", "properties": {}, "geometry": { "coordinates": [[142.93535964243574, 51.313036821416745], [154.00957839243767, 41.405163546980134]], "type": "LineString" } }]
                    }
                    mapWrapper.vm.map.fire('draw.create', e)
                })
            } catch (exception) {
                console.log("measure" + exception.name + ":" + exception.message);
                expect(false).toBeTruthy();
                done()
            }
        })
    })

    it('area mile', (done) => {
        mapWrapper = mount(SmMap);
        measureWrapper = mount(SmMeasure, {
            localVue,
            propsData: {
                mapTarget: "map"
            },
            sync: false
        });
        measureWrapper.vm.$on("loaded", () => {
            try {
                expect(measureWrapper.vm.getMapTarget).toBe('map');
                const spyDeleteAll = jest.spyOn(measureWrapper.vm.viewModel.draw, 'deleteAll');
                const spychangeMode = jest.spyOn(measureWrapper.vm.viewModel.draw, 'changeMode');
                measureWrapper.find('i.sm-components-icons-polygon-layer').trigger('click');

                measureWrapper.vm.$nextTick(() => {
                    expect(spyDeleteAll).toBeCalled();
                    expect(spychangeMode).toBeCalled();
                    measureWrapper.find('.el-input__suffix').trigger("click");
                    measureWrapper.findAll('li.el-select-dropdown__item').at(1).trigger("click");

                    measureWrapper.vm.viewModel.on("measure-finished", (measureResult) => {
                        expect(measureResult.result).toBe("568818.3610");
                        measureWrapper.find('.el-input__suffix').trigger("click");
                        measureWrapper.findAll('li.el-select-dropdown__item').at(0).trigger("click");
                        measureWrapper.vm.$nextTick(() => {
                            expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe("568818.3610 平方英里");
                            done()
                        })
                       
                    })
                    var data = {
                        lngLat: { lng: 137.92559401751038, lat: 39.972407560141534 }
                    }
                    mapWrapper.vm.map.fire('mousedown', data);
                    expect(measureWrapper.vm.viewModel.measureNodes.length).toBe(1);
                    data = {
                        lngLat: { lng: 147.92559401751038, lat: 42.972407560141534 }
                    };
                    mapWrapper.vm.map.fire('mousemove', data);
                    expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe("0.0000 平方英里");
                    mapWrapper.vm.map.fire('mousedown', data);
                    data = {
                        lngLat: { lng: 149, lat: 48 }
                    };
                    mapWrapper.vm.map.fire('mousemove', data);
                    expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe("78497.6528 平方英里");

                    var e = {
                        "features": [{ "id": "df9c85399f1f77b19df769345b98f6dd", "type": "Feature", "properties": {}, "geometry": { "coordinates": [[[87.38848464248667, 48.80281323462705], [126.93926589247138, 36.451689761316274], [101.62676589247422, 53.169433033115894], [101.62676589247422, 53.169433033115894], [87.38848464248667, 48.80281323462705]]], "type": "Polygon" } }]
                    }
                    mapWrapper.vm.map.fire('draw.create', e)
                })
            } catch (exception) {
                console.log("measure" + exception.name + ":" + exception.message);
                expect(false).toBeTruthy();
                done()
            }
        })
    })

    it('area default', (done) => {
        mapWrapper = mount(SmMap);
        measureWrapper = shallowMount(SmMeasure, {
            localVue,
            propsData: {
                mapTarget: "map"
            },
            sync: false
        });
        measureWrapper.vm.$on("loaded", () => {
            try {
                expect(measureWrapper.vm.getMapTarget).toBe('map');
                const spyDeleteAll = jest.spyOn(measureWrapper.vm.viewModel.draw, 'deleteAll');
                const spychangeMode = jest.spyOn(measureWrapper.vm.viewModel.draw, 'changeMode');
                measureWrapper.find('i.sm-components-icons-polygon-layer').trigger('click');

                measureWrapper.vm.$nextTick(() => {
                    expect(spyDeleteAll).toBeCalled();
                    expect(spychangeMode).toBeCalled();
                    measureWrapper.vm.viewModel.on("measure-finished", (measureResult) => {
                        expect(measureResult.result).toBe("1473622.6970");
                        done()
                    })
                    var data = {
                        lngLat: { lng: 137.92559401751038, lat: 39.972407560141534 }
                    }
                    mapWrapper.vm.map.fire('mousedown', data);
                    expect(measureWrapper.vm.viewModel.measureNodes.length).toBe(1);
                    data = {
                        lngLat: { lng: 147.92559401751038, lat: 42.972407560141534 }
                    };
                    mapWrapper.vm.map.fire('mousemove', data);
                    expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe("0.0000 平方千米");
                    mapWrapper.vm.map.fire('mousedown', data);
                    data = {
                        lngLat: { lng: 149, lat: 48 }
                    };
                    mapWrapper.vm.map.fire('mousemove', data);
                    expect(measureWrapper.vm.viewModel.tipHoverDiv.text).toBe("203361.7948 平方千米");
                    var e = {
                        "features": [{ "id": "df9c85399f1f77b19df769345b98f6dd", "type": "Feature", "properties": {}, "geometry": { "coordinates": [[[87.38848464248667, 48.80281323462705], [126.93926589247138, 36.451689761316274], [101.62676589247422, 53.169433033115894], [101.62676589247422, 53.169433033115894], [87.38848464248667, 48.80281323462705]]], "type": "Polygon" } }]
                    }
                    mapWrapper.vm.map.fire('draw.create', e)
                })
            } catch (exception) {
                console.log("measure" + exception.name + ":" + exception.message);
                expect(false).toBeTruthy();
                done()
            }
        })
    })
})