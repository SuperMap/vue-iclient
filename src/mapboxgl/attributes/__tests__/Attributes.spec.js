import { mount, config } from '@vue/test-utils';
import SmAttributes from '../Attributes.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded';

describe('Attributes.vue', () => {
  let wrapper;
  let mapWrapper;
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

  beforeAll(() => {
    wrapper = null;
    config.mapLoad = false;
  });

  beforeEach(() => {
    wrapper = null;
    mapWrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    config.mapLoad = false;
    if (wrapper) {
      wrapper.destroy();
    }
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  afterAll(() => {
    config.mapLoad = true;
  });

  it('render default correctly', async done => {
    mapWrapper = await createEmptyMap();
    wrapper = mount(SmAttributes, {
      propsData: {
        layerName: "UNIQUE-民航数-0",
        fieldConfigs: fieldConfigs
      }
    });
    await mapSubComponentLoaded(wrapper);
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
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.layer-name').text()).toBe('A属性表');
    done();
  });

  it('selection', async done => {
    wrapper = mount(SmAttributes, {
      propsData: {
        dataset: testData,
        fieldConfigs: testDataConfigs
      }
    });
    wrapper.vm.getPopupContainerFn();
    const selectEle = wrapper.find('.sm-component-checkbox-input');
    expect(selectEle.exists()).toBe(true);
    await selectEle.trigger('click');
    done();
  });

  it('associate map', async done => {
    mapWrapper = await createEmptyMap();
    wrapper = mount(SmAttributes, {
      propsData: {
        layerName: "UNIQUE-民航数-0",
        fieldConfigs: fieldConfigs
      }
    });
    await mapSubComponentLoaded(wrapper);
    let e = {
      point: {
        x: 0,
        y: 1
      }
    };
    wrapper.vm.viewModel.map.fire('click', e);
    const spy = jest.spyOn(wrapper.vm.viewModel, 'zoomToFeatures');
    // TODO 具名插槽 overlay 的节点找不到？
    wrapper.vm.setZoomToFeature();
    await wrapper.vm.$nextTick();
    expect(spy).toHaveBeenCalled();
    done();
  });

  // TODO 具名插槽 overlay 的节点找不到？
  it('hidden columns', async done => {
    wrapper = mount(SmAttributes, {
      propsData: {
        fieldConfigs: fieldConfigs,
        dataset: testData
      }
    });
    const column = {
      dataIndex: 'lon',
      title: '经度',
      visible: true
    };
    // TODO 具名插槽 overlay 的节点找不到？
    wrapper.vm.handleColumnVisible(column);
    expect(wrapper.vm.fieldInfo[13].title).toBe('经度');
    expect(wrapper.vm.fieldInfo[13].visible).toBe(false);
    done();
  });

  // TODO 具名插槽 overlay 的节点找不到？
  it('search Data', async done => {
    wrapper = mount(SmAttributes, {
      propsData: {
        fieldConfigs: fieldConfigs,
        dataset: testData
      }
    });
    await wrapper.vm.$nextTick();
    const confirm = () => jest.fn();
    const clearFilters = () => jest.fn();
    wrapper.vm.handleSearch(['漠河'], confirm, '站台');
    expect(wrapper.vm.searchedColumn).toBe('站台');
    expect(wrapper.vm.searchText).toBe('漠河');
    wrapper.vm.handleSearchReset(clearFilters);
    expect(wrapper.vm.searchText).toBe('');
    done();
  });
  it('handleChange', async done => {
    wrapper = mount(SmAttributes, {
      propsData: {
        fieldConfigs: fieldConfigs,
        dataset: testData
      }
    });
    await wrapper.vm.$nextTick();
    await wrapper.find('.sm-component-table-thead').find('.sm-component-checkbox-input').setChecked();
    expect(wrapper.vm.allCount).toBe(10)
    expect(wrapper.vm.selectedRowLength).toBe(10)
    const pagination = {
      "pageSize": 10,
      "defaultCurrent": 1,
      "current": 1
    }
    const filters = {"站台": ["漠河"]}
    const currentDataSource = [
      {
          "index": 1,
          "站台": "漠河",
          "省份": "黑龙江1",
          "海拔": "296",
          "平均最低气温": "-47",
          "最热七天气温": "29",
          "key": 1
      }
    ]
    wrapper.vm.handleChange(pagination,filters,{},{currentDataSource});
    expect(wrapper.vm.allCount).toBe(1)
    expect(wrapper.vm.selectedRowLength).toBe(1)
    done();
  });

  it('Switch from page 1 to page 2 and refresh data', async done => {
    wrapper = mount(SmAttributes, {
      propsData: {
        dataset: testData,
        fieldConfigs: testDataConfigs,
        table: {
          showHeader: true,
          showBorder: true,
          pagination: {
            pageSize: 5,
            defaultCurrent: 1
          }
        }
      }
    });
    await wrapper.vm.$nextTick();
    const changeCb = jest.fn();
    wrapper.vm.$on('change', changeCb);
    expect(wrapper.findAll('.sm-component-pagination-item').length).toBe(2);
    wrapper.find('.sm-component-pagination-next').trigger('click');
    expect(changeCb.mock.called).toBeTruthy;
    expect(wrapper.vm.paginationOptions.current).toBe(2);
    // TODO 具名插槽 overlay 的节点找不到？
    wrapper.vm.refreshData();
    expect(wrapper.vm.paginationOptions.current).toBe(1);
    done();
  });

  it('select all dataset', async done => {
    wrapper = mount(SmAttributes, {
      propsData: {
        dataset: testData,
        fieldConfigs: testDataConfigs
      }
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.sm-component-table-row-selected').length).toBe(0);
    await wrapper.find('.sm-component-table-thead').find('.sm-component-checkbox-input').setChecked();
    expect(wrapper.findAll('.sm-component-table-row-selected').length).toBe(10);
    done();
  });

  it('no selection', async done => {
    wrapper = mount(SmAttributes, {
      propsData: {
        dataset: testData,
        fieldConfigs: testDataConfigs,
        table: {
          showRowSelection: false,
        }
      }
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.sm-component-table-selection-column').length).toBe(0);
    done();
  });

  it('map select feature should change total number', async done => {
    wrapper = mount(SmAttributes, {
      propsData: {
        dataset: testData,
        fieldConfigs: testDataConfigs,
        table: {
          showRowSelection: false,
        }
      }
    });
    await wrapper.vm.$nextTick();
    wrapper.vm.handleMapSelectedFeature({
      "type": "Feature",
      "properties": {
        "index": 1
      },
      "geometry": {
        "coordinates": [
          103.24498334165708,
          60.681735579909144
        ],
        "type": "Point"
      }
    });
    expect(wrapper.vm.selectedRowLength).toBe(1);
    wrapper.vm.handleMapSelectedFeature({
      "type": "Feature",
      "properties": {
        "index": 2
      },
      "geometry": {
        "coordinates": [
          103.24498334165708,
          60.681735579909144
        ],
        "type": "Point"
      }
    });
    expect(wrapper.vm.selectedRowLength).toBe(2);
    done();
  });

  describe('xScrollWidth', () => {
    const scrollTestData = {
      type: 'geoJSON',
      geoJSON: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [122.36, 53.47] },
            properties: { index: 1, 站台: '漠河', 省份: '黑龙江', 海拔: '296' }
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [124.72, 52.32] },
            properties: { index: 2, 站台: '塔河', 省份: '黑龙江', 海拔: '357' }
          }
        ]
      }
    };

    const emptyTestData = {
      type: 'geoJSON',
      geoJSON: { type: 'FeatureCollection', features: [] }
    };

    const mountAttributes = async propsData => {
      wrapper = mount(SmAttributes, { propsData });
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      return wrapper;
    };

    it('列未配置宽度时按 128 计算，并计入选择列的 60', async () => {
      await mountAttributes({ dataset: scrollTestData });
      expect(wrapper.vm.columns.length).toBe(5);
      expect(wrapper.vm.xScrollWidth).toBe(5 * 128 + 60);
      const tableStyle = wrapper
        .findAll('table')
        .wrappers.map(item => item.attributes('style') || '')
        .join(' ');
      expect(tableStyle).toContain(`${5 * 128 + 60}px`);
    });

    it('隐藏某列后不再计入该列宽度', async () => {
      await mountAttributes({ dataset: scrollTestData });
      wrapper.vm.handleColumnVisible(wrapper.vm.columns[0]);
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.columns.filter(column => column.visible).length).toBe(4);
      expect(wrapper.vm.xScrollWidth).toBe(4 * 128 + 60);
    });

    it('支持数字宽度、数字字符串宽度，非法或非正数按 128 兜底', async () => {
      await mountAttributes({
        dataset: scrollTestData,
        fieldConfigs: [
          { value: '站台', visible: true, width: 100 },
          { value: '省份', visible: true, width: '200' },
          { value: '海拔', visible: true, width: 'auto' },
          { value: 'index', visible: true, width: 0 }
        ]
      });
      expect(wrapper.vm.columns.length).toBe(4);
      expect(wrapper.vm.xScrollWidth).toBe(100 + 200 + 128 + 128 + 60);
    });

    it('关闭行选择时不额外计入 60', async () => {
      await mountAttributes({
        dataset: scrollTestData,
        table: { showRowSelection: false }
      });
      expect(wrapper.vm.xScrollWidth).toBe(5 * 128);
    });

    it('数据未渲染时用 fieldConfigs 估算，且跳过不可见列', async () => {
      await mountAttributes({
        fieldConfigs: [
          { value: '站台', visible: true },
          { value: '省份', visible: false },
          { value: '海拔', visible: true, width: 200 }
        ]
      });
      expect(wrapper.vm.columns.length).toBe(0);
      expect(wrapper.vm.xScrollWidth).toBe(128 + 200 + 60);
    });

    it('没有列也没有 fieldConfigs 时返回 0', async () => {
      await mountAttributes({ dataset: emptyTestData });
      expect(wrapper.vm.xScrollWidth).toBe(0);
    });

    it('fieldConfigs 显式传 null 时返回 0', async () => {
      await mountAttributes({ dataset: emptyTestData, fieldConfigs: null });
      expect(wrapper.vm.xScrollWidth).toBe(0);
    });
  });
});
