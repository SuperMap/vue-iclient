import { mount } from '@vue/test-utils';
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
  ];

  const testDataConfigs = [
    {
      title: '站台',
      fieldCaption: '站台',
      visible: true,
      value: '站台',
      align: 'left',
      width: '',
      search: true
    },
    {
      title: '省份',
      fieldCaption: '省份',
      visible: true,
      value: '省份',
      align: 'left',
      width: '',
      search: true
    },
    {
      title: '海拔',
      fieldCaption: '海拔',
      visible: true,
      value: '海拔',
      align: 'left',
      width: '',
      sorter: true
    },
    {
      title: '平均最低气温',
      fieldCaption: '平均最低气温',
      visible: true,
      value: '平均最低气温',
      align: 'left',
      width: '',
      sorter: true
    },
    {
      title: '最热七天气温',
      fieldCaption: '最热七天气温',
      visible: true,
      value: '最热七天气温',
      align: 'left',
      width: '',
      sorter: true
    }
  ];

  const testData = {
    type: 'geoJSON',
    geoJSON: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            coordinates: [122.36999999999999, 53.47],
            type: 'Point'
          },
          properties: {
            index: 1,
            站台: '漠河',
            省份: '黑龙江1',
            海拔: '296',
            平均最低气温: '-47',
            最热七天气温: '29'
          }
        },
        {
          type: 'Feature',
          geometry: {
            coordinates: [124.72, 52.31999999999999],
            type: 'Point'
          },
          properties: {
            index: 2,
            站台: '塔河',
            省份: '黑龙江2',
            海拔: '357.4',
            平均最低气温: '-42',
            最热七天气温: '29'
          }
        },
        {
          type: 'Feature',
          geometry: {
            coordinates: [126.65, 51.719999999999985],
            type: 'Point'
          },
          properties: {
            index: 3,
            站台: '呼玛',
            省份: '黑龙江3',
            海拔: '177.4',
            平均最低气温: '-42',
            最热七天气温: '30'
          }
        },
        {
          type: 'Feature',
          geometry: {
            coordinates: [120.18, 50.24999999999999],
            type: 'Point'
          },
          properties: {
            index: 4,
            站台: '额尔古纳右旗',
            省份: '内蒙古1',
            海拔: '581.4',
            平均最低气温: '-42',
            最热七天气温: '29'
          }
        },
        {
          type: 'Feature',
          geometry: {
            coordinates: [121.68, 50.47999999999998],
            type: 'Point'
          },
          properties: {
            index: 5,
            站台: '图里河',
            省份: '内蒙古2',
            海拔: '732.6',
            平均最低气温: '-46',
            最热七天气温: '27'
          }
        },
        {
          type: 'Feature',
          geometry: {
            coordinates: [127.45000000000002, 50.24999999999999],
            type: 'Point'
          },
          properties: {
            index: 6,
            站台: '黑河',
            省份: '黑龙江4',
            海拔: '166.4',
            平均最低气温: '-37',
            最热七天气温: '30'
          }
        },
        {
          type: 'Feature',
          geometry: {
            coordinates: [117.42999999999999, 49.56999999999999],
            type: 'Point'
          },
          properties: {
            index: 7,
            站台: '满洲里',
            省份: '内蒙古3',
            海拔: '661.7',
            平均最低气温: '-37',
            最热七天气温: '30'
          }
        },
        {
          type: 'Feature',
          geometry: {
            coordinates: [119.75, 49.219999999999985],
            type: 'Point'
          },
          properties: {
            index: 8,
            站台: '海拉尔',
            省份: '内蒙古4',
            海拔: '610',
            平均最低气温: '-40',
            最热七天气温: '30'
          }
        },
        {
          type: 'Feature',
          geometry: {
            coordinates: [123.71999999999998, 49.19999999999999],
            type: 'Point'
          },
          properties: {
            index: 9,
            站台: '小二沟',
            省份: '内蒙古5',
            海拔: '286',
            平均最低气温: '-42',
            最热七天气温: '30'
          }
        },
        {
          type: 'Feature',
          geometry: {
            coordinates: [125.22999999999999, 49.16999999999998],
            type: 'Point'
          },
          properties: {
            index: 10,
            站台: '嫩江',
            省份: '黑龙江5',
            海拔: '242.2',
            平均最低气温: '-40',
            最热七天气温: '30'
          }
        }
      ]
    }
  };
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render default correctly', () => {
    wrapper = mount(
      {
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
          };
        }
      },
      {
        sync: false
      }
    );
    wrapper.vm.$on('loaded', () => {
      try {
        expect(wrapper.find('.sm-component-attributes').exists()).toBe(true);
        const attributes = wrapper.findAll('.sm-component-attributes');
        attributes.setProps({
          title: 'A属性表',
          table: {
            showBorder: false,
            showHeader: true,
            pagination: false
          }
        });
        expect(wrapper.find('.layer-name').text()).toBe('A属性表');
        const checkboxArr = wrapper.findAll('.sm-component-checkbox-input');
        done();
      } catch (exception) {
        console.log('Attributes' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        done();
      }
    });
  });

  it('selection', async () => {
    wrapper = mount(SmAttributes, {
      propsData: {
        dataset: testData,
        fieldConfigs: testDataConfigs
      }
    });
    const selectEle = wrapper.find('.sm-component-checkbox-input');
    expect(selectEle.exists()).toBe(true);
    await selectEle.trigger('click');
    setTimeout(() => {
      expect(wrapper.vm.selectedRowKeys.length).toBe(10);
      expect(wrapper.emitted().change).toBeTruthy();
      done();
    }, 100);
  });
});
