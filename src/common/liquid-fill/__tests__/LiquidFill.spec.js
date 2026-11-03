import { mount } from '@vue/test-utils';
import SmLiquidFill from '../LiquidFill.vue';
import LiquidFill from '../index';
import { setTheme } from '../../_utils/style/theme/set-theme';

describe('LiquidFill.vue', () => {
  let wrapper;
  let previousDirection;

  beforeEach(() => {
    wrapper = null;
    previousDirection = document.documentElement.getAttribute('dir');
    document.documentElement.setAttribute('dir', 'ltr');
  });

  afterEach(() => {
    if (previousDirection === null) {
      document.documentElement.removeAttribute('dir');
    } else {
      document.documentElement.setAttribute('dir', previousDirection);
    }
    // TODO, removeListener报错
    // if (wrapper) {
    //   wrapper.destroy();
    // }
  });

  it('render default correctly', () => {
    wrapper = mount(
      {
        template: `
      <div style="width:100px;height:100px">
         <sm-liquid-fill style="width:200px; height:200px" value="0.5"></sm-liquid-fill>
      </div>`,
        components: {
          SmLiquidFill
        }
      },
      {
        sync: false
      }
    );
  });

  it('render index correctly', () => {
    wrapper = mount(LiquidFill);
    expect(wrapper.find('.sm-component-liquidfill').exists()).toBe(true);
  });

  it('render waveAnimation', () => {
    wrapper = mount(
      {
        template: `
        <sm-liquid-fill 
          style="width:200px; height:200px" 
          :waveCount="2"
          :waveAnimation="true"
          value="0.5">
        </sm-liquid-fill>`,
        components: {
          SmLiquidFill
        }
      },
      {
        sync: false
      }
    );
  });

  it('render watch props correctly', async () => {
    wrapper = mount(SmLiquidFill);
    const liquidFillArr = wrapper.findAll(SmLiquidFill);
    liquidFillArr.setProps({
      waveColor: 'blue',
      borderColor: 'red',
      labelColor: '#626c91',
      waveCount: 2,
      backgroundColor: '#626c91',
      insideLabelColor: '#fff',
      waveAnimation: true
    });
    await expect(liquidFillArr.at(0).vm.waveColor).toBe('blue');
  });

  it('converts a custom label formatter result in rtl', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const chart = { setOption: jest.fn() };

    SmLiquidFill.methods.updateChart.call({
      chart,
      waveColorData: '#000',
      waveAnimation: false,
      calcData: [0.125],
      fontSize: 18,
      labelColorData: '#111',
      insideLabelColorData: '#fff',
      backgroundColorData: '',
      borderColorData: '#000',
      formatter: ({ value }) => `${(value * 100).toFixed(1)}%`
    });

    const formatter = chart.setOption.mock.calls[0][0].series[0].label.formatter;
    expect(formatter({ value: 0.125 })).toBe('١٢.٥%');
  });

  it('converts the default liquid fill label in rtl', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const chart = { setOption: jest.fn() };

    SmLiquidFill.methods.updateChart.call({
      chart,
      waveColorData: '#000',
      waveAnimation: false,
      calcData: [0.12],
      fontSize: 18,
      labelColorData: '#111',
      insideLabelColorData: '#fff',
      backgroundColorData: '',
      borderColorData: '#000',
      formatter: undefined
    });

    const formatter = chart.setOption.mock.calls[0][0].series[0].label.formatter;
    expect(formatter({ value: 0.12 })).toBe('١٢%');
  });

  it('set theme change liquidFill', () => {
    wrapper = mount(LiquidFill);
    setTheme('dark');
    expect(wrapper.find('.sm-component-liquidfill').exists()).toBe(true);
  });
});
