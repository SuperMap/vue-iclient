import { mount } from '@vue/test-utils';
import SmMap from '@/view/components/Map';
import mapEvent from '@/view/commontypes/mapEvent';
import Vue from 'vue';
import mapboxgl from "@libs/mapboxgl/mapbox-gl-enhance.js";

// import "../../../mocks/index.js"
jest.mock('@libs/mapboxgl/mapbox-gl-enhance.js', () => require('@mocks/mapboxgl').mapboxgl);

describe('Map.vue', () => {

  it('default', () => {
    const spy = jest.spyOn(mapboxgl, "Map");
    const wrapper = mount(SmMap);

    expect(spy).toBeCalled();
    expect(wrapper.element.id).toEqual('map');
    expect(wrapper.element.outerHTML).toContain("width: 100%");
    console.log(JSON.stringify(mapEvent._events));
    expect(JSON.stringify(mapEvent._events)).toContain("initMap");


  })

  it('initial_option', () => {
      const spy = jest.spyOn(mapboxgl, "Map");
    const wrapper = mount(SmMap,
       {
        propsData: {
          target:  'custom' 
        }
      }
    )

    expect(spy).toBeCalled();
    expect(wrapper.element.id).toEqual('custom');
    expect(wrapper.element.outerHTML).toContain("width: 100%");
    console.log(JSON.stringify(mapEvent._events));
    expect(JSON.stringify(mapEvent._events)).toContain("initMap");
    })
})
