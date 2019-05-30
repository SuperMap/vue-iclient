import { mount } from '@vue/test-utils';
import SmMap from '@/view/components/Map';
import SmPan from '@/view/components/Pan.vue';
import mapEvent from '@/view/commontypes/mapEvent';

jest.mock('@libs/mapboxgl/mapbox-gl-enhance.js', () => require('@mocks/mapboxgl').mapboxgl);

describe('Pan.vue', () => {

    let wrapper;

    beforeEach(() => {
        mapEvent.firstMapTarget = null;
        mapEvent.$options.mapCache = {};
        mapEvent.$options.webMapCache = {};
        wrapper = null;
    })

    afterEach(() => {
        jest.restoreAllMocks();
        if (wrapper) {
            wrapper.destroy();
        }
    })

    it('default', (done) => {
        let wrapper2 = mount(SmMap);
        wrapper = mount(SmPan,{
            propsData: {
                mapTarget:"map"
            }
        });
   
        wrapper.vm.$on("loaded", () => {
            try {
                console.log("default")
                expect(wrapper.vm.getMapTarget).toBe('map');
                testClick(wrapper, wrapper2.vm.map);
                testMouseEvent(wrapper, '.is-left', 'sm-component-pan--west');
                testMouseEvent(wrapper, '.is-right', 'sm-component-pan--east');
                testMouseEvent(wrapper, '.is-top', 'sm-component-pan--north');
                testMouseEvent(wrapper, '.is-bottom', 'sm-component-pan--south');
                wrapper.destroy();
                wrapper2.destroy();
                done();
            } catch (exception) {
                console.log("Pan_default" + exception.name + ":" + exception.message);
                expect(false).toBeTruthy();
                wrapper.destroy();
                wrapper2.destroy();
                done();
            }
        })
    })

    /**
     * 测试平移组件包裹在map里面
     */

    //isControl
    it('isControl SmMap', (done) => {
        // const spy = jest.spyOn(SmPan, "panBy");
        wrapper = mount({
            template: `<div><sm-map><sm-pan></sm-pan></sm-map></div>`,
            components: {
                SmPan,
                SmMap
            }
        });
        wrapper.vm.$children[0].$children[0].$on("loaded", () => {
           console.log("isControl smmap")
            expect(wrapper.vm.$children[0].$children[0].getMapTarget).toBe('map');

            testClick(wrapper, wrapper.vm.$children[0].map);

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
    it('parallel single SmMap', (done) => {
        wrapper = mount({
            template: `<div><sm-map></sm-map><sm-pan></sm-pan></div>`,
            components: {
                SmPan,
                SmMap
            }
        });
        wrapper.vm.$children[1].$on("loaded", () => {
            //expect\(wrapper\.element\)\.toMatchSnapshot\(\);

            expect(wrapper.vm.$children[1].getMapTarget).toBe('map');
            testClick(wrapper, wrapper.vm.$children[0].map);

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
    it('parallel multi SmMap', (done) => {
        // const spy = jest.spyOn(SmPan, "panBy");

        wrapper = mount({
            template: `<div><sm-map target="map1"></sm-map><sm-map target="map2"></sm-map><sm-map target="map3"></sm-map><sm-pan></sm-pan><sm-map target="map4"></sm-map></div>`,
            components: {
                SmPan,
                SmMap
            }
        });
        wrapper.vm.$children[3].$on("loaded", () => {
            //expect\(wrapper\.element\)\.toMatchSnapshot\(\);
            expect(wrapper.vm.$children[3].getMapTarget).toBe('map1');
            testClick(wrapper, wrapper.vm.$children[0].map);
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
            template: `<div><sm-map target="map1"></sm-map><sm-map target="map2"></sm-map><sm-map target="map3"></sm-map><sm-pan map-target="map3"></sm-pan><sm-map target="map4"></sm-map></div>`,
            components: {
                SmPan,
                SmMap
            }
        });

        wrapper.vm.$children[3].$on("loaded", () => {
            //expect\(wrapper\.element\)\.toMatchSnapshot\(\);
            expect(wrapper.vm.$children[3].getMapTarget).toBe('map3');
            testClick(wrapper, wrapper.vm.$children[2].map);

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

        // spy.(wrapper.vm.$children[0].$children[0].map).toBe('map');
        // wrapper.findAll(SmPan).setMethods({ panBy: mockPanby,panTo:mockPanTo });
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
        expect(spyPanTo).toBeCalledWith({ "lat": 0, "lng": 0 });

    }

})