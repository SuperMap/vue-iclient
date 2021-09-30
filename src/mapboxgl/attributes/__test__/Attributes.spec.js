import {
  mount
} from '@vue/test-utils';
import SmAttributes from '../Attributes.vue';
import SmWebMap from '.././../web-map/WebMap.vue';

describe('Attributes.vue', () => {
  let wrapper;
  const fieldConfigs = [
    { value: '平均最低气温_Num', visible: false },
    { value: 'SmID', visible: false },
    { value: '站台', visible: false },
    { value: '海波_Num', visible: false },
    { value: '省份', visible: false },
    { value: '海拔', visible: false },
    { value: '最高气温_Num', visible: false },
    { value: '最高气温', visible: false },
    { value: '最高七天气温_Num', visible: false },
    { value: '最高七天气温', visible: false },
    { value: '最低气温_Num', visible: false },
    { value: '最低气温', visible: false },
    { value: '年均降雨_Num', visible: false },
    { value: 'lon', visible: true, title: '经度' },
    { value: 'lat', visible: true, title: '纬度' }
  ]
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
        <sm-web-map style="height:400px" serverUrl="https://fakeiportal.supermap.io/iportal" mapId="123"></sm-web-map>
        <div style="positon:relative;height:400px;width:100%">
          <sm-attributes layerName="UNIQUE-民航数-0" :fieldConfigs="fieldConfigs"></sm-attributes>
        </div>
      </div>`,
      components: {
        SmAttributes,
        SmWebMap
      },
      data() {
        return {
          fieldConfigs: fieldConfigs
        }
      }
    }, {
      sync: false,
    });
    wrapper.vm.$on('loaded', () => {
      try {
        expect(wrapper.find('.sm-component-attributes').exists()).toBe(true);
        const liquidFillArr = wrapper.findAll('.sm-component-attributes');
        liquidFillArr.setProps({
          title: 'A属性表',
          table: {
            showBorder: false,
            showHeader: true,
            pagination: false
          }
        })
        expect(wrapper.find('.layer-name').text()).toBe('A属性表');
        const checkboxArr = wrapper.findAll('.sm-component-checkbox-input');
        done();
      } catch (exception) {
        console.log('Attributes' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        mapWrapper.destroy();
        done();
      }
    });
  })
})