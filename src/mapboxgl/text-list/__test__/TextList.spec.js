import {
  mount
} from '@vue/test-utils';
import SmTextList from '../TextList.vue';
import TextList from '../index';

describe('TextList.vue', () => {
  const content = [{
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
  })

  it('render default correctly', () => {
    wrapper = mount({
      template: `
      <sm-text-list
        style="width: 700px;margin: 0 auto"
        :content="content"
        :header="header"
        :fields="fields"
        :rows="6"
        :autoResize="true"
        >
      </sm-text-list>`,
      components: {
        SmTextList
      },
      data() {
        return {
          content: content,
          header: header,
          fields: fields
        }
      }
    }, {
      sync: false,
    })
    expect(wrapper.find('.sm-component-text-list').exists()).toBe(true);
    expect(wrapper.vm.content[0].站台).toBe('漠河');
    expect(wrapper.vm.header.length).toBe(5);
    expect(wrapper.vm.fields.length).toBe(5);
  })


  it('render index correctly', () => {
    wrapper = mount(TextList, {
      sync: false,
      propsData: {
        content: content,
        header: header,
        fields: fields
      }
    })
    expect(wrapper.find('.sm-component-text-list').exists()).toBe(true);
  })

  it('render props correctly', () => {
    const content = [{
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
    const header = ['站台', '省份', '海拔', '平均最低气温', '最热七天气温'];
    const fields = ['站台', '省份', '海拔', '平均最低气温', '最热七天气温'];
    wrapper = mount({
      template: `
      <sm-text-list
        style="width: 700px;margin: 0 auto"
        :content="content"
        :header="header"
        :fields="fields"
        :rows="6"
        :autoResize="true"
        >
      </sm-text-list>`,
      components: {
        SmTextList
      },
      data() {
        return {
          content: content,
          header: header,
          fields: fields
        }
      }
    }, {
      sync: false,
    })
  })
})