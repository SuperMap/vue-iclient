import { mount } from '@vue/test-utils';
import SmMap from '@/view/components/Map';
import mapboxgl from "@libs/mapboxgl/mapbox-gl-enhance.js";
jest.mock('@libs/mapboxgl/mapbox-gl-enhance.js', () => require('@mocks/mapboxgl').mapboxgl);

describe('Map.vue', () => {

  it('default', () => {
    const spy = jest.spyOn(mapboxgl, "Map");
    const wrapper = mount(SmMap);

    wrapper.vm.$on("loaded", () => {
      try {
        expect(spy).toBeCalled();
        expect(wrapper.element.id).toEqual('map');
        done()
      }
      catch (exception) {
        console.log("query" + exception.name + ":" + exception.message);
        expect(false).toBeTruthy();
        spyAddlayer.mockReset();
        spyAddlayer.mockRestore();
        done()
      }
    })
  })

  it('initial_option', () => {
    const spy = jest.spyOn(mapboxgl, "Map");
    const wrapper = mount(SmMap,
      {
        propsData: {
          target: 'custom'
        }
      }
    )
    wrapper.vm.$on("loaded", () => {
      try {
        expect(spy).toBeCalled();
        expect(wrapper.element.id).toEqual('custom');
        done()
      }
      catch (exception) {
        console.log("query" + exception.name + ":" + exception.message);
        expect(false).toBeTruthy();
        spyAddlayer.mockReset();
        spyAddlayer.mockRestore();
        done()
      }
    })
  })
})
