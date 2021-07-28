import {
  mount
} from '@vue/test-utils';
import SmDraw from '../Draw.vue';
import Draw from '../index';
import SmWebMap from '../../../WebMap.vue';

describe('Draw.vue', () => {
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
        <sm-draw />
      </sm-web-map>`,
      components: {
        SmDraw,
        SmWebMap
      },
      data() {
        return {}
      }
    }, {
      sync: false,
    });
  })

  it('render index correctly', () => {
    wrapper = mount(Draw);
    expect(wrapper.find('div.sm-component-draw').exists()).toBe(true);
  })

})