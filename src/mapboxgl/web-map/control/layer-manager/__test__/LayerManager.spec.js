import {
  mount
} from '@vue/test-utils';
import SmLayerManager from '../LayerManager.vue';
import SmWebMap from '../../../WebMap.vue';

describe('LayerManager.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  })

  it('rrender default correctly', () => {
    wrapper = mount({
      template: `
      <sm-web-map style="height:700px" serverUrl='https://iportal.supermap.io/iportal' mapId="1329428269">
        <sm-layer-manager :collapsed="false" :defaultExpandAll="true" :layers="[{mapInfo: {serverUrl: 'https://iportal.supermap.io/iportal', mapId:'801571284'}, title: '民航数据-单值' }]"></sm-layer-manager>
      </sm-web-map>`,
      components: {
        SmLayerManager,
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

