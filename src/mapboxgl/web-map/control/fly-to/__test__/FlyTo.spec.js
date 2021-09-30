import {
  mount
} from '@vue/test-utils';
import SmFlyTo from '../FlyTo.vue';
import FlyTo from '../index';
import SmWebMap from '../../../WebMap.vue';

describe('FlyTo.vue', () => {
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
      <sm-web-map target="map1" style="height:700px" mapId="567946816" serverUrl="https://fakeiportal.supermap.io/iportal" tianditu-key="123">
        <sm-fly-to position="top-right" :data="data" :fly-options="flyOptions" :collapsed="false" />
      </sm-web-map>`,
      components: {
        SmFlyTo,
        SmWebMap
      },
      data() {
        return {
          data: [
            [103.93303602365336, 33.04646925591396],
            [103.90771770744831, 33.163703206300525],
            [103.93169934861643, 33.25624201104978]
          ],
          flyOptions: {
            duration: 1500,
            zoom: 15,
            pitch: 60
          }
        };
      }
    }, {
      sync: false,
    });
  })

  it('render index correctly', () => {
    wrapper = mount(FlyTo, {
      propsData: {
        data: [
          [103.93303602365336, 33.04646925591396],
          [103.90771770744831, 33.163703206300525],
          [103.93169934861643, 33.25624201104978]
        ],
        flyOptions: {
          duration: 1500,
          zoom: 15,
          pitch: 60
        }
      }
    });
  })

  it('render correctly', () => {
    wrapper = mount({
      template: `
      <sm-web-map target="map2" style="height:700px" mapId="123" serverUrl="https://fakeiportal.supermap.io/iportal" tianditu-key="123">
        <sm-fly-to position="top-right" :data="data" :fly-options="flyOptions" :collapsed="false" :autoplay="false" :loop="false" />
      </sm-web-map> `,
      components: {
        SmFlyTo,
        SmWebMap
      },
      data() {
        return {
          data: [
            [103.93303602365336, 33.04646925591396],
            [103.90771770744831, 33.163703206300525],
            [103.93169934861643, 33.25624201104978]
          ],
          flyOptions: {
            duration: 1500,
            zoom: 15,
            pitch: 60
          }
        }
      }
    }, {
      sync: false,
    });
  })

  it('render correctly', () => {
    wrapper = mount({
      template: `
      <sm-web-map target="map2" style="height:700px" mapId="123" serverUrl="https://fakeiportal.supermap.io/iportal" tianditu-key="123">
        <sm-fly-to position="top-right" :data="data" :fly-options="flyOptions" :collapsed="false" :autoplay="false" :loop="false" />
      </sm-web-map> `,
      components: {
        SmFlyTo,
        SmWebMap
      },
      data() {
        return {
          data: [
            [103.93303602365336, 33.04646925591396],
            [103.90771770744831, 33.163703206300525],
            [103.93169934861643, 33.25624201104978]
          ],
          flyOptions: {
            duration: 1500,
            zoom: 15,
            pitch: 60
          }
        }
      }
    }, {
      sync: false,
    });
  })
})