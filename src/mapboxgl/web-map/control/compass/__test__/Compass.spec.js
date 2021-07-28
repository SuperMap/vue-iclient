import {
  mount
} from '@vue/test-utils';
import SmCompass from '../Compass.vue';
import Compass from '../index';
import SmWebMap from '../../../WebMap.vue';

describe('Compass.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  })

  it('render default correctly', () => {
    wrapper = mount({
      template: `
      <sm-web-map style="height:700px" serverUrl="https://fakeiportal.supermap.io/iportal" mapId="123">
        <sm-compass />
      </sm-web-map> `,
      components: {
        SmCompass,
        SmWebMap
      },
      data() {
        return {}
      }
    }, {
      propsData: {
        mapOptions: {}
      },
      sync: false,
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