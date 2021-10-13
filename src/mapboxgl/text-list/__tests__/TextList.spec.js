import { mount } from '@vue/test-utils';
import SmTextList from '../TextList.vue';
import TextList from '../index';

describe('TextList.vue', () => {
  const content = [
    {
      站台: '漠河',
      省份: '黑龙江1',
      海拔: '296',
      平均最低气温: '-47',
      最热七天气温: '29'
    },
    {
      站台: '塔河',
      省份: '黑龙江2',
      海拔: '357.4',
      平均最低气温: '-42',
      最热七天气温: '29'
    },
    {
      站台: '呼玛',
      省份: '黑龙江3',
      海拔: '177.4',
      平均最低气温: '-42',
      最热七天气温: '30'
    },
    {
      站台: '额尔古纳右旗',
      省份: '内蒙古1',
      海拔: '581.4',
      平均最低气温: '-42',
      最热七天气温: '29'
    },
    {
      站台: '图里河',
      省份: '内蒙古2',
      海拔: '732.6',
      平均最低气温: '-46',
      最热七天气温: '27'
    },
    {
      站台: '黑河',
      省份: '黑龙江4',
      海拔: '166.4',
      平均最低气温: '-37',
      最热七天气温: '30'
    },
    {
      站台: '满洲里',
      省份: '内蒙古3',
      海拔: '661.7',
      平均最低气温: '-37',
      最热七天气温: '30'
    },
    {
      站台: '海拉尔',
      省份: '内蒙古4',
      海拔: '610',
      平均最低气温: '-40',
      最热七天气温: '30'
    },
    {
      站台: '小二沟',
      省份: '内蒙古5',
      海拔: '286',
      平均最低气温: '-42',
      最热七天气温: '30'
    },
    {
      站台: '嫩江',
      省份: '黑龙江5',
      海拔: '242.2',
      平均最低气温: '-40',
      最热七天气温: '30'
    }
  ];
  const dataset = {
    type: 'geoJSON',
    maxFeatures: 500,
    geoJSON: {
      type: 'FeatureCollection',
      features: [
        {
          geometry: {
            type: 'Point',
            coordinates: [116.36331703990744, 39.89942692791154]
          },
          properties: {
            SmID: '1',
            SmX: '1.295350519989875E7',
            SmY: '4851338.019912067',
            SmLibTileID: '1',
            SmUserID: '0',
            SmGeometrySize: '20',
            SmGeoPosition: '393216',
            标准名称: '长椿街站',
            index: 0
          },
          type: 'Feature'
        },
        {
          geometry: {
            type: 'Point',
            coordinates: [116.37438913096268, 39.89976329032906]
          },
          properties: {
            SmID: '2',
            SmX: '1.2954737739437036E7',
            SmY: '4851386.827488521',
            SmLibTileID: '1',
            SmUserID: '0',
            SmGeometrySize: '20',
            SmGeoPosition: '393236',
            标准名称: '宣武门站',
            index: 1
          },
          type: 'Feature'
        },
        {
          geometry: {
            type: 'Point',
            coordinates: [116.38141290077355, 39.9767738835847]
          },
          properties: {
            SmID: '3',
            SmX: '1.2955519621915832E7',
            SmY: '4862567.697366403',
            SmLibTileID: '1',
            SmUserID: '0',
            SmGeometrySize: '20',
            SmGeoPosition: '393256',
            标准名称: '健德门站',
            index: 2
          },
          type: 'Feature'
        },
        {
          geometry: {
            type: 'Point',
            coordinates: [116.38435616441622, 39.9000638944286]
          },
          properties: {
            SmID: '4',
            SmX: '1.2955847264525805E7',
            SmY: '4851430.446588028',
            SmLibTileID: '1',
            SmUserID: '0',
            SmGeometrySize: '20',
            SmGeoPosition: '393276',
            标准名称: '和平门站',
            index: 3
          },
          type: 'Feature'
        },
        {
          geometry: {
            type: 'Point',
            coordinates: [116.3926263104885, 40.00990206655463]
          },
          properties: {
            SmID: '5',
            SmX: '1.2956767892975355E7',
            SmY: '4867381.325181259',
            SmLibTileID: '1',
            SmUserID: '0',
            SmGeometrySize: '20',
            SmGeoPosition: '393296',
            标准名称: '森林公园南门站',
            index: 4
          },
          type: 'Feature'
        }
      ]
    }
  };
  const header = ['站台', '省份', '海拔', '平均最低气温', '最热七天气温'];
  const fields = ['站台', '省份', '海拔', '平均最低气温', '最热七天气温'];
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render default correctly', (done) => {
    wrapper = mount(SmTextList, {
      propsData: {
        content: content,
        header: header,
        fields: fields
      }
    });
    wrapper.vm.$nextTick();
    expect(wrapper.find('.sm-component-text-list').exists()).toBe(true);
    done();
  });

  it('render index correctly', (done) => {
    wrapper = mount(TextList, {
      propsData: {
        content: content,
        header: header,
        fields: fields
      }
    });
    wrapper.vm.$nextTick();
    expect(wrapper.find('.sm-component-text-list').exists()).toBe(true);
    expect(wrapper.vm.content[0].站台).toBe('漠河');
    expect(wrapper.vm.header.length).toBe(5);
    expect(wrapper.vm.fields.length).toBe(5);
    done();
  });

  it('change contents', () => {
    const newContent = [
      {
        站台: '漠河',
        省份: '黑龙江1',
        海拔: '296',
        平均最低气温: '-47',
        最热七天气温: '29'
      },
      {
        站台: '塔河',
        省份: '黑龙江2',
        海拔: '357.4',
        平均最低气温: '-42',
        最热七天气温: '29'
      },
      {
        站台: '呼玛',
        省份: '黑龙江3',
        海拔: '177.4',
        平均最低气温: '-42',
        最热七天气温: '30'
      },
      {
        站台: '额尔古纳右旗',
        省份: '内蒙古1',
        海拔: '581.4',
        平均最低气温: '-42',
        最热七天气温: '29'
      }
    ];
    wrapper = mount(TextList, {
      propsData: {
        content: content,
        header: header,
        fields: fields,
        autoRolling: false
      }
    });
    wrapper.vm.$nextTick();
    wrapper.setProps({
      rows: 3,
      content: newContent,
      columns: [
        {
          sort: true,
          width: 200
        },
        {
          sort: false,
          width: 100
        },
        {
          sort: false,
          width: 100
        },
        {
          sort: false,
          width: 100
        },
        {
          sort: false,
          width: 100
        }
      ],
      autoRolling: true
    });
  });

  it('change dataset', () => {
    const newDataset = {
      type: 'geoJSON',
      maxFeatures: 100,
      geoJSON: {
        type: 'FeatureCollection',
        features: [
          {
            geometry: {
              type: 'Point',
              coordinates: [116.36331703990744, 39.89942692791154]
            },
            properties: {
              SmID: '1',
              SmX: '1.295350519989875E7',
              SmY: '4851338.019912067',
              SmLibTileID: '1',
              SmUserID: '0',
              SmGeometrySize: '20',
              SmGeoPosition: '393216',
              标准名称: '长椿街站',
              index: 0
            },
            type: 'Feature'
          }
        ]
      }
    };
    wrapper = mount(TextList, {
      propsData: {
        dataset: dataset,
        columns: [
          {
            header: 'SmID',
            field: 'SmID',
            slotConfig: {
              type: 'text',
              linkTitle: '',
              linkTarget: '_blank',
              imageRepeat: 'center'
            },
            sort: false,
            defaultSortType: 'descend',
            fixInfo: {
              prefix: '',
              suffix: ''
            },
            width: 0
          },
          {
            header: 'SmY',
            field: '标准名称',
            slotConfig: {
              type: 'text',
              linkTitle: '',
              linkTarget: '_blank',
              imageRepeat: 'center'
            },
            defaultSortType: 'none',
            fixInfo: {
              prefix: '',
              suffix: ''
            },
            width: 0
          },
          {
            header: 'SmY',
            field: 'SmY',
            sort: false,
            slotConfig: {
              type: 'text',
              linkTitle: '',
              linkTarget: '_blank',
              imageRepeat: 'center'
            },
            defaultSortType: 'none',
            fixInfo: {
              prefix: '',
              suffix: ''
            },
            width: 0
          }
        ],
        autoRolling: false
      }
    });
    wrapper.vm.$nextTick();
    wrapper.setProps({
      dataset: newDataset,
      autoRolling: true
    });
  });
});
