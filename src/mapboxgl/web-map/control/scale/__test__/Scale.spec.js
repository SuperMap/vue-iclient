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
        style="width: 100%; height:700px" 
        mapId="123" 
        serverUrl="https://fakeiportal.supermap.io/iportal"
        >
        <sm-scale />
      </sm-web-map> `,
      components: {
        SmScale,
        SmWebMap
      }
    }, {
      sync: false,
    });
    wrapper.vm.$on("load", () => {
      try {
        expect(wrapper.find('.sm-component-scale')).toBe(true);
        done()
      } catch (exception) {
        console.log('scale' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        mapWrapper.destroy();
        done();
      }
    })
  })

  it('render correctly', () => {
    wrapper = mount({
      template: `
      <sm-web-map
        target="map222"
        style="width: 100%; height:700px" 
        mapId="123" 
        serverUrl="https://fakeiportal.supermap.io/iportal"
        >
        <sm-scale :visualizePitch="true"/>
      </sm-web-map> `,
      components: {
        SmScale,
        SmWebMap
      }
    }, {
      sync: false,
    });
    wrapper.vm.$on("load", () => {
      try {
        expect(wrapper.find('.sm-component-scale')).toBe(true);
        done()
      } catch (exception) {
        console.log('scale' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        mapWrapper.destroy();
        done();
      }
    })
  })
})