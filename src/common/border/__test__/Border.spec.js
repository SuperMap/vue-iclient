import {
  mount
} from '@vue/test-utils';
import SmBorder from '../Border.vue';
import Border from '../index';
import SmChart from '../../../mapboxgl/chart/Chart.vue';

describe('Border.vue', () => {
  let wrapper;
  const echartOptions = {
    legend: {
      data: ['2016起降架次（架次）', '2017起降架次（架次）']
    },
    tooltip: {
      formatter: "{b0}: {c0}"
    },
    grid: {
      top: 30,
      bottom: 60,
      left: 60,
      right: 30
    }
  };
  const datasetOptions = [{
      seriesType: "bar",
      isStastic: true,
      isStack: true,
      xField: "机场",
      yField: "2016起降架次（架次）"
    },
    {
      seriesType: "bar",
      isStastic: true,
      isStack: true,
      xField: "机场",
      yField: "2017起降架次（架次）",
    }
  ];
  const iportalDataSet = {
    type: "iPortal", //iServer iPortal
    url: "https://fakeiportal.supermap.io/iportal/web/datas/123",
    queryInfo: {
      maxFeatures: 20
    }
  };
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
      <sm-border style="width:600px; height:400px" type="border1"></sm-border>`,
      components: {
        SmBorder
      }
    }, {
      propsData: {
        data: {}
      }
    })
    const BorderDom = wrapper.find('.sm-component-border');
    expect(BorderDom.exists()).toBe(true);
    expect(BorderDom.element.style.width).toBe('600px');
    expect(BorderDom.element.style.height).toBe('400px');
  })

  it('render index correctly', () => {
    wrapper = mount(Border, {
      propsData: {
        type: 'border1'
      }
    })
    expect(wrapper.find('.sm-component-border').exists()).toBe(true);
  })

  it('custom border', () => {
    wrapper = mount({
      template: `
      <sm-border style="width:600px; height:400px" :customBorder="custom"></sm-border>`,
      components: {
        SmBorder
      },
      data() {
        return {
          custom: {
            src: 'https://test.png',
            borderWidth: [12, 12, 12, 12],
            borderEdge: {
              top: 12,
              left: 12,
              right: 12,
              bottom: 12
            }
          }
        };
      },
    })
    const BorderDom = wrapper.find('.sm-component-border');
    expect(BorderDom.exists()).toBe(true);
    expect(BorderDom.element.style.width).toBe('600px');
    expect(BorderDom.element.style.height).toBe('400px');
    expect(BorderDom.element.style.borderImage).toBe('url(https://test.png) 12 12 12 12 fill / 1 / 0 stretch');
  })

  it('render chart in border correctly', () => {
    wrapper = mount({
      template: `
      <sm-border type="border1" style="width: 460px; height: 260px;">
        <sm-chart
          :colorGroup="['red', 'blue']"
          :options="echartOption"
          :dataset="dataset"
          :datasetOptions="datasetOptions"
        />
      </sm-border>`,
      components: {
        SmBorder,
        SmChart
      },
      data() {
        return {
          echartOption: echartOptions,
          dataset: iportalDataSet,
          datasetOptions: datasetOptions
        }
      }
    })
    expect(wrapper.find('.sm-component-border').exists()).toBe(true);
    const Chart = wrapper.findAll(SmChart);
    expect(Chart.exists()).toBe(true);
    expect(Chart.length).toBe(1);
  })
})