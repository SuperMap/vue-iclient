import {
  mount
} from '@vue/test-utils';
import SmLegend from '../Legend.vue';
import SmWebMap from '../../../WebMap.vue';

describe('Legend.vue', () => {
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
      <sm-web-map target="map111" style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
        <sm-legend :layerNames="['民航数据']" :collapsed="false" position="top-left" />
      </sm-web-map> `,
      components: {
        SmLegend,
        SmWebMap
      },
      data() {
        return {
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
      <sm-web-map style="height:700px" mapId="801571284" serverUrl="https://iportal.supermap.io/iportal">
        <sm-legend style="width:160px" isShowTitle isShowField mode="panel" :layerNames="['民航数据']" position="top-left" :collapsed="false" />
      </sm-web-map> `,
      components: {
        SmLegend,
        SmWebMap
      },
      data() {
        return {
        }
      }
    },
    {
      sync: false,
    }
  );
  })

})

