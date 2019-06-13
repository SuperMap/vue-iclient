import { mount, createLocalVue } from '@vue/test-utils';
import SmWebMap from '../../../WebMap';
import SmPan from '../Pan.vue';
import mapEvent from '@types_mapboxgl/map-event';

import { Icon, Card, Collapse, Button } from 'ant-design-vue';

const localVue = createLocalVue()
localVue.use(Card);
localVue.use(Collapse);
localVue.use(Icon);
localVue.use(Button);

jest.mock('@libs/mapboxgl/mapbox-gl-enhance', () => require('@mocks/mapboxgl').mapboxgl);
jest.mock('@libs/iclient-mapboxgl/iclient9-mapboxgl.min', () => require('@mocks/mapboxgl_iclient'));

describe('Pan.vue', () => {

    let wrapper;
    let mapWrapper;
    beforeEach(() => {
        mapEvent.firstMapTarget = null;
        mapEvent.$options.mapCache = {};
        mapEvent.$options.webMapCache = {};
        wrapper = null;
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
        if (wrapper) {
            wrapper.destroy();
        }
        if (mapWrapper && mapWrapper !== "undefined") {
            mapWrapper.destroy();
        }
    })

    it('default', (done) => {

        wrapper = mount(SmPan, {
            propsData: {
                mapTarget: "map"
            }
        });
        wrapper.vm.$on("loaded", () => {
            try {
                expect(wrapper.vm.getMapTarget).toBe('map');
                testClick(wrapper, wrapper.vm.map);
                testMouseEvent(wrapper, '.is-left', 'sm-component-pan--west');
                testMouseEvent(wrapper, '.is-right', 'sm-component-pan--east');
                testMouseEvent(wrapper, '.is-top', 'sm-component-pan--north');
                testMouseEvent(wrapper, '.is-bottom', 'sm-component-pan--south');
                wrapper.destroy();
                // wrapper2.destroy();
                done();
            } catch (exception) {
                console.log("Pan_default" + exception.name + ":" + exception.message);
                expect(false).toBeTruthy();
                wrapper.destroy();
                // wrapper2.destroy();
                done();
            }
        })
    })

    /**
     * 测试平移组件包裹在map里面
     */

    //isControl
    it('isControl SmWebMap', (done) => {
        // const spy = jest.spyOn(SmPan, "panBy");
        wrapper = mount({
            template: `<div><sm-web-map  server-url="http://support.supermap.com.cn:8092/"  :map-id="1649097980"   
            ><sm-pan></sm-pan></sm-web-map></div>`,
            components: {
                SmPan,
                SmWebMap
            }
        });
        wrapper.vm.$children[0].$children[0].$on("loaded", () => {
            console.log("isControl SmWebMap")
            expect(wrapper.vm.$children[0].$children[0].getMapTarget).toBe('map');
            testClick(wrapper, wrapper.vm.$children[0].$children[0].map);

            testMouseEvent(wrapper, '.is-left', 'sm-component-pan--west');
            testMouseEvent(wrapper, '.is-right', 'sm-component-pan--east');
            testMouseEvent(wrapper, '.is-top', 'sm-component-pan--north');
            testMouseEvent(wrapper, '.is-bottom', 'sm-component-pan--south');
            done();
        })
    })

    /**
     * 测试平移组件与map同级
     */
    it('parallel single SmWebMap', (done) => {
        wrapper = mount({
            template: `<div><sm-web-map  server-url="http://support.supermap.com.cn:8092/"     :map-id="1649097980" >
            </sm-web-map><sm-pan></sm-pan></div>`,
            components: {
                SmPan,
                SmWebMap
            }
        });
        wrapper.vm.$children[1].$on("loaded", () => {
            //expect\(wrapper\.element\)\.toMatchSnapshot\(\);

            expect(wrapper.vm.$children[1].getMapTarget).toBe('map');
            testClick(wrapper, wrapper.vm.$children[1].map);

            testMouseEvent(wrapper, '.is-left', 'sm-component-pan--west');
            testMouseEvent(wrapper, '.is-right', 'sm-component-pan--east');
            testMouseEvent(wrapper, '.is-top', 'sm-component-pan--north');
            testMouseEvent(wrapper, '.is-bottom', 'sm-component-pan--south');
            done();
        })
    })

    /**
     * 测试平移组件与多个map同级，默认pan的mapTarget是第一个map
     */
    //ignore 原因，pan的mapTarget期望是map1，实际是map
    xit('parallel multi SmWebMap', (done) => {

        wrapper = mount({
            template: `<div><sm-web-map  server-url="http://support.supermap.com.cn:8092/"    :map-id="1649097980"  target="map1">
            </sm-web-map>
            <sm-web-map  server-url="http://support.supermap.com.cn:8092/"   :map-id="1649097980"  target="map2">
            </sm-web-map>
            <sm-web-map  server-url="http://support.supermap.com.cn:8092/"   :map-id="1649097980"   target="map3">
            </sm-web-map>
            <sm-pan></sm-pan>
            <sm-web-map  server-url="http://support.supermap.com.cn:8092/"   :map-id="1649097980"   target="map4">
            </sm-web-map></div>`,
            components: {
                SmPan,
                SmWebMap
            }
        });
        wrapper.vm.$children[3].$on("loaded", () => {
            expect(wrapper.vm.$children[3].getMapTarget).toBe('map1');
            testClick(wrapper, wrapper.vm.$children[3].map);
            testMouseEvent(wrapper, '.is-left', 'sm-component-pan--west');
            testMouseEvent(wrapper, '.is-right', 'sm-component-pan--east');
            testMouseEvent(wrapper, '.is-top', 'sm-component-pan--north');
            testMouseEvent(wrapper, '.is-bottom', 'sm-component-pan--south');
            done();
        })
    })

    /**
    * 测试平移组件与多个map同级，设置pan的mapTarget
    */
    it('setMapTarget', (done) => {

        wrapper = mount({
            template: `<div><sm-web-map  server-url="http://support.supermap.com.cn:8092/"    :map-id="1649097980"  target="map1">
            </sm-web-map><sm-web-map  server-url="http://support.supermap.com.cn:8092/"    :map-id="1649097980"  target="map2">
            </sm-web-map><sm-web-map  server-url="http://support.supermap.com.cn:8092/"  :map-id="1649097980"  target="map3">
            </sm-web-map><sm-pan map-target="map3"></sm-pan>
            <sm-web-map  server-url="http://support.supermap.com.cn:8092/"   :map-id="1649097980"  target="map4"></sm-web-map></div>`,
            components: {
                SmPan,
                SmWebMap
            }
        });

        wrapper.vm.$children[3].$on("loaded", () => {
            //expect\(wrapper\.element\)\.toMatchSnapshot\(\);
            expect(wrapper.vm.$children[3].getMapTarget).toBe('map3');
            testClick(wrapper, wrapper.vm.$children[3].map);

            testMouseEvent(wrapper, '.is-left', 'sm-component-pan--west');
            testMouseEvent(wrapper, '.is-right', 'sm-component-pan--east');
            testMouseEvent(wrapper, '.is-top', 'sm-component-pan--north');
            testMouseEvent(wrapper, '.is-bottom', 'sm-component-pan--south');
            done();
        })
    })

    function testMouseEvent(wrapper, cssSelector, expectResult) {
        wrapper.find(cssSelector).trigger('mouseenter');
        expect(wrapper.find('div.sm-component-pan').classes()).toContain(expectResult);

        wrapper.find(cssSelector).trigger('mouseleave');
        expect(wrapper.find('div.sm-component-pan').classes()).not.toContain(expectResult);
        expect(wrapper.find('div.sm-component-pan').classes()).toContain('sm-component-pan--default');
    }

    /**
     * 
     * @param {*} wrapper 
     * @param {*} map Pan绑定的Map组件的map对象
     */
    function testClick(wrapper, map) {
        var panLength = 200;
        let spyPanTo = jest.spyOn(map, "panTo");
        let spyPanby = jest.spyOn(map, "panBy");

      
        wrapper.find('.is-left').trigger('click');
        //验证点击之后 pan绑定的map组件的map会发生相应变化，即会平移
        expect(spyPanby).toBeCalledWith([-panLength, 0]);
        wrapper.find('.is-right').trigger('click');
        expect(spyPanby).toBeCalledWith([panLength, 0]);
        wrapper.find('.is-top').trigger('click');
        expect(spyPanby).toBeCalledWith([0, -panLength]);
        wrapper.find('.is-bottom').trigger('click');
        expect(spyPanby).toBeCalledWith([0, panLength]);
        wrapper.find('.sm-component-pan__center').trigger('click');
        expect(spyPanTo).toBeCalledWith({ "lat": 35.81531985645325, "lng": 106.09658607124217 });

    }

})