import {
  toI18n
} from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';
import enUS from 'ant-design-vue/es/locale/en_US';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';

export default {
  title: `${toI18n('basicComponent.title')}/${toI18n('basicComponent.configProvider.title')}`,
  id: 'BasicComponents/configProvider'
};

export const BasicConfigProvider = () => ({
  mixins: [theme],
  data() {
    return {
      columns: [
        {
          title: 'Name',
          dataIndex: 'name',
          filters: [{
            text: 'filter1',
            value: 'filter1'
          }]
        },
        {
          title: 'Age',
          dataIndex: 'age'
        }
      ],
      visible: false,
      locale: zhCN,
      moment,
      enUS,
      zhCN
    };
  },
  methods: {
    changeLocale(e) {
      const localeValue = e.target.value;
      this.locale = localeValue;
      if (!localeValue) {
        moment.locale('en');
      } else {
        moment.locale('zh-cn');
      }
    },
    info() {
      this.$info({
        title: 'some info',
        content: 'some info'
      });
    },
    confirm() {
      this.$confirm({
        title: 'some info',
        content: 'some info'
      });
    }
  },
  template: `
  <div>
    <div class="change-locale">
        <span style="margin-right: 16px">Change locale of components: </span>
        <sm-radio-group :value="locale" v-on:change="changeLocale">
          <sm-radio-button key="cn" :value="zhCN">
              中文
          </sm-radio-button>
          <sm-radio-button key="en" :value="enUS">
              English
          </sm-radio-button>
        </sm-radio-group>
    </div>
    <sm-config-provider :locale="locale">
        <div :key="locale ? locale.locale : 'en'" class="locale-components">
        <div style="margin: 20px">
            <sm-pagination :default-current="1" :total="50" show-size-changer />
        </div>
        <div >
            <sm-date-picker />
            <sm-range-picker style="width: 200px" />
        </div>
        <div style="margin: 20px">
            <sm-button type="primary" v-on:click="visible = true">
            Show Modal
            </sm-button>
            <sm-button v-on:click="info">
            Show info
            </sm-button>
            <sm-button v-on:click="confirm">
            Show confirm
            </sm-button>
        </div>
        <div >
            <sm-transfer
            :data-source="[]"
            show-search
            :target-keys="[]"
            :render="item => item.title"
            />
        </div>
        <div style="margin: 20px">
            <sm-table :data-source="[]" :columns="columns" />
        </div>
        <sm-modal v-model="visible" title="Locale Modal">
            <p>Locale Modal</p>
        </sm-modal>
        </div>
    </sm-config-provider>
  </div>`
});
BasicConfigProvider.story = {
  name: toI18n('basicComponent.basic')
};
