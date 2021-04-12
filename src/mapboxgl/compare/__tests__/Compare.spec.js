import {
  mount,
  createLocalVue
} from '@vue/test-utils';
import SmWebMap from '../../web-map/WebMap.vue';
import SmCompare from '../Compare.vue'
import mapEvent from '@types_mapboxgl/map-event';
import {
  Icon,
  Card,
  Collapse,
  Button,
  Spin
} from 'ant-design-vue';

const localVue = createLocalVue()
localVue.use(Card);
localVue.use(Collapse);
localVue.use(Icon);
localVue.use(Button);
localVue.use(Spin);

jest.mock('mapbox-gl-compare', () => require('@mocks/compare'));

describe('Copmpare.vue', () => {
  let wrapper;
  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    wrapper = null;
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
  })

  it('copmpare slot', (done) => {
    wrapper = mount({
      template: `
        <sm-compare>
          <sm-web-map
            slot="beforeMap"
            target="beforeMap"
            server-url="https://fakeiportal.supermap.io/iportal"
            :map-id="123"
          >
          </sm-web-map>
          <sm-web-map
            slot="afterMap"
            target="afterMap"
            server-url="https://fakeiportal.supermap.io/iportal"
            :map-id="123"
          >
          </sm-web-map>
        </sm-compare>`,
      components: {
        SmCompare,
        SmWebMap
      }
    })
    wrapper.vm.$children[0].$children[1].$on('load', () => {
      try {
        expect(wrapper.find('div.sm-component-compare').exists()).toBe(true);
        expect(wrapper.find('div#comparison-container').exists()).toBe(true);
        expect(wrapper.find('#beforeMap').exists()).toBe(true);
        expect(wrapper.find('#afterMap').exists()).toBe(true);
        done()
      } catch (exception) {
        console.log("'readfile'案例失败：" + exception.name + ":" + exception.message);
        expect(false).toBeTruthy();
        done();
      }
    })
  })

  it('copmpare atrributes', (done) => {
    wrapper = mount({
      template: `
        <sm-compare>
          <sm-web-map
            slot="beforeMap"
            target="beforeMap"
            server-url="https://fakeiportal.supermap.io/iportal"
            :map-id="123"
          >
          </sm-web-map>
          <sm-web-map
            slot="afterMap"
            target="afterMap"
            server-url="https://fakeiportal.supermap.io/iportal"
            :map-id="123"
          >
          </sm-web-map>
        </sm-compare>`,
      components: {
        SmCompare,
        SmWebMap
      }
    }, {
      propsData: {
        lineSize: 5,
        slideSize: 90,
        slideBackground: '#f00',
        autoresize: false,
        textProps: {
          textColor: "#fff",
          background: "rgba(0,0,0,0)",
          fontStyle: {
            fontSize: '27px',
            lineHeight: 1.5,
            fontWeight: "normal",
            justifyContent: "center",
            textIndent: 0,
            fontFamily: "微软雅黑",
          }
        }
      }
    })
    wrapper.vm.$children[0].$children[1].$on('load', () => {
      try {
        expect(wrapper.find('.sm-component-compare').attributes()).toHaveProperty('linesize', "5");
        expect(wrapper.find('.sm-component-compare').attributes()).toHaveProperty('slidebackground', "#f00");
        expect(wrapper.find('.sm-component-compare').attributes()).toHaveProperty('slidesize', "90");
        expect(wrapper.find('.sm-component-compare').attributes()).toHaveProperty('textprops');
        const spyhandleOptions = jest.spyOn(wrapper.vm.$children[0], 'handleOptionsChange')
        wrapper.vm.$children[0].resize();
        expect(spyhandleOptions).toBeCalled();
        done()
      } catch (exception) {
        console.log("'readfile'案例失败：" + exception.name + ":" + exception.message);
        expect(false).toBeTruthy();
        done();
      }
    })
  })
})