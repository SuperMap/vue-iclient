import { mount, config } from '@vue/test-utils';
import SmWebMap from '../../web-map/WebMap.vue';
import SmCompare from '../Compare.vue';
import Compare from '../index';
import mapLoaded from 'vue-iclient/test/unit/mapLoaded.js';

jest.mock('mapbox-gl-compare', () => require('@mocks/compare'));

describe('Copmpare.vue', () => {
  let wrapper;
  const mapInfo = {
    extent: {
      leftBottom: { x: 0, y: 0 },
      rightTop: { x: 0, y: 0 }
    },
    level: 5,
    center: { x: 0, y: 0 },
    baseLayer: {
      layerType: 'TILE',
      name: 'China',
      url: 'http://test'
    },
    layers: [],
    description: '',
    projection: 'EPSG:3857',
    title: 'testMap',
    version: '1.0'
  };

  beforeEach(() => {
    config.mapLoad = false;
    wrapper = null;
  });

  afterEach(() => {
    config.mapLoad = true;
    jest.restoreAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render default correctly', () => {
    wrapper = mount(Compare);
    expect(wrapper.find('div.sm-component-compare').exists()).toBe(true);
  });

  it('copmpare slot', async done => {
    wrapper = mount({
      template: ` 
        <sm-compare>
          <sm-web-map slot="beforeMap" target="beforeMap" :mapId="mapInfo" />
          <sm-web-map slot="afterMap" target="afterMap" :mapId="mapInfo" />
        </sm-compare>`,
      components: {
        SmCompare,
        SmWebMap
      },
      data() {
        return {
          mapInfo: mapInfo
        };
      }
    });
    await mapLoaded(wrapper.vm.$children[0].$children[0]);
    await mapLoaded(wrapper.vm.$children[0].$children[1]);
    expect(wrapper.find('div.sm-component-compare').exists()).toBe(true);
    expect(wrapper.find('div#comparison-container').exists()).toBe(true);
    expect(wrapper.find('#beforeMap').exists()).toBe(true);
    expect(wrapper.find('#afterMap').exists()).toBe(true);
    done();
  });

  it('copmpare atrributes', async done => {
    wrapper = mount(
      {
        template: ` 
        <sm-compare>
          <sm-web-map slot="beforeMap" target="beforeMap" :mapId="mapInfo" />
          <sm-web-map slot="afterMap" target="afterMap" :mapId="mapInfo" />
        </sm-compare>`,
        components: {
          SmCompare,
          SmWebMap
        }
      },
      {
        propsData: {
          lineSize: 5,
          slideSize: 90,
          slideBackground: '#f00',
          autoresize: false,
          textProps: {
            textColor: '#fff',
            background: 'rgba(0,0,0,0)',
            fontStyle: {
              fontSize: '27px',
              lineHeight: 1.5,
              fontWeight: 'normal',
              justifyContent: 'center',
              textIndent: 0,
              fontFamily: '微软雅黑'
            }
          }
        },
        data() {
          return {
            mapInfo: mapInfo
          };
        }
      }
    );
    await mapLoaded(wrapper.vm.$children[0].$children[0]);
    await mapLoaded(wrapper.vm.$children[0].$children[1]);
    expect(wrapper.find('.sm-component-compare').attributes()).toHaveProperty('linesize', '5');
    expect(wrapper.find('.sm-component-compare').attributes()).toHaveProperty('slidebackground', '#f00');
    expect(wrapper.find('.sm-component-compare').attributes()).toHaveProperty('slidesize', '90');
    expect(wrapper.find('.sm-component-compare').attributes()).toHaveProperty('textprops');
    const spyhandleOptions = jest.spyOn(wrapper.vm.$children[0], 'handleOptionsChange');
    wrapper.vm.$children[0].resize();
    expect(spyhandleOptions).toBeCalled();
    done();
  });

  it('methods refreshRect', () => {
    wrapper = mount(Compare, {
      components: {
        SmCompare,
        SmWebMap
      },
      propsData: {
        beforeMapOptions: {
          mapId: 123,
          serviceUrl: 'http://fakeiportal'
        },
        afterMapOptions: {
          mapId: 234,
          serviceUrl: 'http://fakeiportal'
        }
      }
    });
    expect(wrapper.vm).not.toBeUndefined();
    expect(() => {
      wrapper.vm.refreshRect();
    }).not.toThrow();
  })
});
