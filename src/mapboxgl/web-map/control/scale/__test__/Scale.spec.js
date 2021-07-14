import {
  mount
} from '@vue/test-utils';
import SmScale from '../Scale.vue';
import SmWebMap from '../../../WebMap.vue';

describe('Scale.vue', () => {
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
      <sm-web-map
        target="map222"
        style="width: 100%; height:700px" 
        mapId="1329428269" 
        serverUrl="https://iportal.supermap.io/iportal"
        :mapOptions="mapOptions"
        >
        <sm-scale />
      </sm-web-map> `,
      components: {
        SmScale,
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
    },
    {
      sync: false,
    }
  );
  })

  it('render correctly', () => {
    wrapper = mount({
      template: `
      <sm-web-map
        target="map222"
        style="width: 100%; height:700px" 
        mapId="1329428269" 
        serverUrl="https://iportal.supermap.io/iportal"
        :mapOptions="mapOptions"
        >
        <sm-Scale :visualizePitch="true"/>
      </sm-web-map> `,
      components: {
        SmScale,
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
    },
    {
      sync: false,
    }
  );
  })

})

