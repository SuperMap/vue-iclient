import {
  mount
} from '@vue/test-utils';
import SmTdtMapSwitcher from '../TdtMapSwitcher.vue';
import TdtMapSwitcher from '../index';
import SmWebMap from '../../../web-map/WebMap.vue';

describe('TdtMapSwitcher.vue', () => {
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
        <div>
          <sm-web-map style="height:400px" serverUrl="https://fakeiportal.supermap.io/iportal" mapId="123">
            <sm-tdt-map-switcher position="top-left" :data="mapSwitcherData" />
          </sm-web-map>
        </div>`,
      components: {
        SmTdtMapSwitcher,
        SmWebMap
      },
      data() {
        return {
          mapSwitcherData: {
            select: '',
            label: false,
            tk: '1d109683f4d84198e37a38c442d68311'
          },
        }
      }
    });
  })

  it('render index correctly', () => {
    wrapper = mount(TdtMapSwitcher, {
      propsData: {
        data: {
          select: '',
          label: false,
          tk: '1d109683f4d84198e37a38c442d68311'
        }
      }
    });
  })
})