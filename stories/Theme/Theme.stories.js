import { withKnobs } from '@storybook/addon-knobs';
import { setTheme } from '../../src/common/_utils/style/theme/set-theme';
import { toI18n } from '../../.storybook/lang';

export default {
  title: 'Design/Theme',
  decorators: [withKnobs],
  parameters: {
    viewMode: 'story',
    previewTabs: {
      canvas: {
        hidden: false
      }
    }
  }
};

export const DefaultTheme = () => ({
  data() {
    const mockData = [];
    for (let i = 0; i < 20; i++) {
      mockData.push({
        key: i.toString(),
        title: `content${i + 1}`,
        description: `description of content${i + 1}`,
        disabled: i % 3 < 1
      });
    }

    const oriTargetKeys = mockData.filter(item => +item.key % 3 > 1).map(item => item.key);
    return {
      theme: 'dark',
      inputValue: 3,
      switch1: true,
      checked1: true,
      select1: 'lucy',
      time1: null,
      radio1: 'd',
      modalVisible: false,
      mockData,
      targetKeys: oriTargetKeys,
      selectedKeys: ['1', '4']
    };
  },
  methods: {
    setDefaultTheme(theme) {
      this.theme = theme;
      setTheme(theme);
    },
    success() {
      this.$message.success('This is a success message');
    },
    error() {
      this.$message.error('This is an error message');
    },
    warning() {
      this.$message.warning('This is a warning message');
    },
    info() {
      this.$message.info('This is a info message');
    },
    showModal() {
      this.modalVisible = true;
    },
    hideModal() {
      this.modalVisible = false;
    },
    confirm() {
      this.$confirm({
        title: 'Confirm',
        content: 'Bla bla ...',
        okText: 'confirm',
        cancelText: 'cancel'
      });
    },
    handleTransferChange(nextTargetKeys) {
      this.targetKeys = nextTargetKeys;
    },
    handleSelectChange(sourceSelectedKeys, targetSelectedKeys) {
      this.selectedKeys = [...sourceSelectedKeys, ...targetSelectedKeys];
    }
  },
  template: `
  <div>
    <div style="margin-bottom: 15px;">
      <sm-button :type="theme === 'dark' ? 'primary' : 'default'" @click="setDefaultTheme('dark')">{{ $t('customizeTheme.dark') }}</sm-button>
      <sm-button :type="theme === 'light' ? 'primary' : 'default'" @click="setDefaultTheme('light')">{{ $t('customizeTheme.light') }}</sm-button>
    </div>
    <div style="display: flex;flex-direction: column; margin-bottom: 15px;">
      <div style="display: flex; align-items: center; margin-bottom: 15px;"><label style="width: 35%; text-align: right; padding-right: 8px;">{{ $t('basicComponent.avatar.title') }}：</label><sm-avatar icon="user" /></div>
      <div style="display: flex; align-items: center; margin-bottom: 15px;"><label style="width: 35%; text-align: right; padding-right: 8px;">{{ $t('basicComponent.input.title') }}：</label><sm-input-search placeholder="input search text" enter-button style="width: 240px;" /></div>
      <div style="display: flex; align-items: center; margin-bottom: 15px;"><label style="width: 35%; text-align: right; padding-right: 8px;">{{ $t('basicComponent.inputNumber.title') }}：</label><sm-input-number v-model="inputValue" style="margin-right: 3px;"/>台机器 <sm-button type="link">链接文字</sm-button></div>
      <div style="display: flex; align-items: center; margin-bottom: 15px;"><label style="width: 35%; text-align: right; padding-right: 8px;">{{ $t('basicComponent.switch.title') }}：</label><sm-switch v-model="switch1" /> <sm-checkbox v-model="checked1" style="margin-left: 25px;">Checkbox</sm-checkbox></div>
      <div style="display: flex; align-items: center; margin-bottom: 15px;"><label style="width: 35%; text-align: right; padding-right: 8px;">{{ $t('basicComponent.select.title') }}：</label><sm-select allowClear v-model="select1" style="width: 240px;">
          <sm-select-option value="jack1">
            Jack
          </sm-select-option>
          <sm-select-option value="lucy1">
            Lucy
          </sm-select-option>
          <sm-select-option value="disabled" disabled>
            Disabled
          </sm-select-option>
          <sm-select-option value="Yiminghe1">
            yiminghe
          </sm-select-option>
        </sm-select>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 15px;"><label style="width: 35%; text-align: right; padding-right: 8px;">{{ $t('basicComponent.empty.title') }}：</label><sm-empty /></div>
      <div style="display: flex; align-items: center; margin-bottom: 15px;"><label style="width: 35%; text-align: right; padding-right: 8px;">{{ $t('basicComponent.datePicker.title') }}：</label><sm-date-picker placeholder="Select Date" v-model="time1" /></div>
      <div style="display: flex; align-items: center; margin-bottom: 15px;"><label style="width: 35%; text-align: right; padding-right: 8px;">{{ $t('basicComponent.radio.title') }}：</label><sm-radio-group v-model="radio1">
          <sm-radio-button value="a">
            Hangzhou
          </sm-radio-button>
          <sm-radio-button value="b" disabled>
            Shanghai
          </sm-radio-button>
          <sm-radio-button value="c">
            Beijing
          </sm-radio-button>
          <sm-radio-button value="d">
            Chengdu
          </sm-radio-button>
        </sm-radio-group>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 15px;"><label style="width: 35%; text-align: right; padding-right: 8px;">{{ $t('basicComponent.transfer.title') }}：</label><sm-transfer :data-source="mockData" :titles="['Source', 'Target']" :target-keys="targetKeys" :selected-keys="selectedKeys" :render="item => item.title" @change="handleTransferChange" @selectChange="handleSelectChange" /></div>
      <div style="display: flex; align-items: center; margin-bottom: 15px;"><label style="width: 35%; text-align: right; padding-right: 8px;">{{ $t('basicComponent.tooltip.title') }}：</label><sm-tooltip placement="topLeft" title="Prompt Text"><sm-button>Align edge / 边缘对齐</sm-button></sm-tooltip><sm-tooltip placement="topLeft" title="Prompt Text" arrow-point-at-center><sm-button style="margin-left: 10px;">Arrow points to center / 箭头指向中心</sm-button></sm-tooltip></div>
      <div style="display: flex; align-items: center; margin-bottom: 15px;"><label style="width: 35%; text-align: right; padding-right: 8px;">{{ $t('basicComponent.message.title') }}：</label><sm-button @click="success">Success</sm-button><sm-button style="margin-left: 10px;" @click="error">Error</sm-button><sm-button style="margin-left: 10px;" @click="warning">Warning</sm-button><sm-button style="margin-left: 10px;" @click="info">Info</sm-button></div>
      <div style="display: flex; align-items: center; margin-bottom: 15px;"><label style="width: 35%; text-align: right; padding-right: 8px;">{{ $t('basicComponent.modal.title') }}：</label><sm-button type="primary" @click="showModal">Modal</sm-button><sm-button style="margin-left: 10px;" @click="confirm">Confirm</sm-button><sm-modal v-model="modalVisible" title="Modal" ok-text="confirm" cancel-text="cancel" @ok="hideModal">
          <p>Bla bla ...</p>
          <p>Bla bla ...</p>
          <p>Bla bla ...</p>
        </sm-modal>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 15px; padding-left: 8px"><sm-button type="primary" shape="round" style="margin-left: 35%; margin-right: 15px;">{{ $t('basicComponent.button.confirm') }}</sm-button><sm-button type="default" shape="round">{{ $t('basicComponent.button.cancel') }}</sm-button></div>
    </div>
  </div>`,
  beforeDestroy() {
    if (this.theme !== 'dark') {
      this.setDefaultTheme('dark');
    }
  }
});
DefaultTheme.story = {
  name: toI18n('customizeTheme.default')
};
