import {
    toI18n
  } from '../../.storybook/lang';
  import theme from '../setThemeMixin/setTheme';
  
  export default {
    title: `${toI18n('basicComponent.title')}/${toI18n('basicComponent.textList.title')}`,
    id: 'BasicComponents/textList'
  };
  
  export const BasicTextList = () => ({
    mixins: [theme],
    data() {
      return {
        content: [
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
        ],
        header: ['站台', '省份', '海拔', '平均最低气温', '最热七天气温'],
        fields: ['站台', '省份', '海拔', '平均最低气温', '最热七天气温']
      };
    },
    template: `
      <sm-text-list
        style="width: 700px;margin: 0 auto"
       :content="content"
       :header="header"
       :fields="fields"
       :rows="6"
       :autoResize="true"
      >
      </sm-text-list>
      `
  });
  BasicTextList.story = {
    name: toI18n('basicComponent.basic')
  };
  
  export const ScrollOneByOneTextList = () => ({
    mixins: [theme],
    data() {
      return {
        content: [
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
        ],
        header: ['站台', '省份', '海拔', '平均最低气温', '最热七天气温'],
        fields: ['站台', '省份', '海拔', '平均最低气温', '最热七天气温']
      };
    },
    template: `
        <sm-text-list
         style="width: 700px;margin: 0 auto"
         :content="content"
         :header="header"
         :fields="fields"
         :autoRolling="true"
         :rows="6"
         :autoResize="true"
        >
        </sm-text-list>
        `
  });
  ScrollOneByOneTextList.story = {
    name: toI18n('basicComponent.textList.scrollOneByOne')
  };
  
  export const CustomCellTextList = () => ({
    mixins: [theme],
    data() {
      return {
        content: [
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
        ],
        columns: [
          {
            header: '站台',
            field: '站台',
            slots: {
              customRender: 'customCell'
            }
          },
          {
            header: '省份',
            field: '省份'
          },
          {
            header: '海拔',
            field: '海拔'
          },
          {
            header: '平均最低气温',
            field: '平均最低气温'
          },
          {
            header: '最热七天气温555',
            field: '最热七天气温'
          }
        ],
        header: ['站台', '省份', '海拔', '平均最低气温', '最热七天气温'],
        fields: ['站台', '省份', '海拔', '平均最低气温', '最热七天气温']
      };
    },
    template: `
          <sm-text-list
           style="width: 700px;margin: 0 auto"
           :content="content"
           :columns="columns"
           :header="header"
           :fields="fields"
           :rows="6"
           :autoResize="true"
          >
            <div slot="customCell" slot-scope="{ text }">
              <a :href="'https://www.baidu.com/s?wd=' + text" target="_blank">{{ text }}</a>
            </div>
          </sm-text-list>
          `
  });
  CustomCellTextList.story = {
    name: toI18n('basicComponent.textList.customCell')
  };
  