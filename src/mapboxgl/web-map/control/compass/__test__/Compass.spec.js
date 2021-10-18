import {
  mount
} from '@vue/test-utils';
import SmCompass from '../Compass.vue';
import Compass from '../index';
import SmWebMap from '../../../WebMap.vue';
import mapEvent from '@types_mapboxgl/map-event';
describe('Compass.vue', () => {
  let wrapper;
  let mapWrapper;
  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    mapWrapper = mount(SmWebMap, {
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    })
  });

  afterEach(() => {
    jest.resetAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  it('render default correctly', () => {
    wrapper = mount(SmCompass);
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          expect(wrapper.vm.mapTarget).toBe('map');
          done()
        } catch (exception) {
          console.log("案例失败：" + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  })

  it('render index correctly', () => {
    wrapper = mount(Compass);
  })

  it('render props correctly', () => {
    wrapper = mount({
      template: `
      <sm-web-map
        target="map222"
        style="width: 100%; height:700px" 
        mapId="123" 
        serverUrl="https://fakeiportal.supermap.io/iportal"
        :mapOptions="mapOptions"
        >
        <sm-compass :visualizePitch="true"/>
      </sm-web-map> `,
      components: {
        SmCompass,
        SmWebMap
      },
      data() {
        return {
          mapOptions: {
            bearing: -30,
            pitch: 15
          }
        }
      }
    }, {
      sync: false,
    });
  })

})