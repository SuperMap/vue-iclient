import {
  mount
} from '@vue/test-utils';
import SmMiniMap from '../MiniMap.vue';
import SmWebMap from '../../../WebMap.vue';

describe('MiniMap.vue', () => {
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
      <sm-web-map style="height:700px" serverUrl='https://iportal.supermap.io/iportal' mapId="1329428269">
        <sm-mini-map :collapsed="false"></sm-mini-map>
      </sm-web-map> `,
      components: {
        SmMiniMap,
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
