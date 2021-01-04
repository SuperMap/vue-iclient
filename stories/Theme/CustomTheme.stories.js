import { withKnobs, color, number, array, select } from '@storybook/addon-knobs';
import { setTheme } from '../../src/common/_utils/style/theme/set-theme';
import { toI18n } from '../../.storybook/lang';

export default {
  title: 'Design/Custom-Theme',
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

export const CustomTheme = () => ({
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
    setCustomTheme(themeData) {
      setTheme(themeData || { ...this.$props, style: this.defaultStyle });
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
  props: {
    defaultStyle: { default: select('defaultStyle', ['light', 'dark'], 'light') },
    background: { default: color('background', '#191515') },
    backgroundLight: { default: color('backgroundLight', '#1f1a1a') },
    backgroundBase: { default: color('backgroundBase', 'rgba(25, 21, 21, 0.08)') },
    textColor: { default: color('textColor', '#fff') },
    textColorSecondary: { default: color('textColorSecondary', 'rgba(255, 255, 255, 0.45)') },
    selectedColor: { default: color('selectedColor', '#e14d5726') },
    hoverColor: { default: color('hoverColor', '#e5666f') },
    clickColor: { default: color('clickColor', '#dc333f') },
    successColor: { default: color('successColor', '#2BA250') },
    infoColor: { default: color('infoColor', '#3499E5') },
    warningColor: { default: color('warningColor', '#F0BD3E') },
    dangerColor: { default: color('dangerColor', '#DC5849') },
    iconColorHover: { default: color('iconColorHover', 'rgba(255, 255, 255, 0.75)') },
    headingColor: { default: color('headingColor', 'rgba(255, 255, 255, 0.85)') },
    disabledBgColor: { default: color('disabledBgColor', 'rgba(255, 255, 255, 0.08)') },
    disabledBorderColor: { default: color('disabledBorderColor', 'rgba(255, 255, 255, 0.08)') },
    disabledTextColor: { default: color('disabledTextColor', 'rgba(255, 255, 255, 0.25)') },
    placeholderColor: { default: color('placeholderColor', 'rgba(255, 255, 255, 0.45)') },
    borderColorSplit: { default: color('borderColorSplit', 'rgba(255, 255, 255, 0.12)') },
    borderColorBase: { default: color('borderBaseColor', 'rgba(255, 255, 255, 0.15)') },
    shadowColor: { default: color('shadowColor', 'rgba(0, 0, 0, 0.35)') },
    buttonBorderDefaultColor: { default: color('buttonBorderDefaultColor', 'rgba(255, 255, 255, 0.65)') },
    paginationBorderDefaultColor: { default: color('paginationBorderDefaultColor', 'rgba(255, 255, 255, 0.2)') },
    componentBackground: { default: color('componentBackground', 'rgba(255, 255, 255, 0.04)') },
    selectDropdownBackground: { default: color('selectDropdownBackground', '#423939') },
    selectItemHoverBg: { default: color('selectItemHoverBg', 'rgba(255, 255, 255, 0.08)') },
    switchBackground: { default: color('switchBackground', 'rgba(255, 255, 255, 0.3)') },
    switchDisabledBgColor: { default: color('switchDisabledBgColor', 'rgba(255, 255, 255, 0.15)') },
    switchDisabledAfterColor: { default: color('switchDisabledAfterColor', 'rgba(255, 255, 255, 0.15)') },
    switchDisabledOpacity: { default: number('switchDisabledOpacity', 1) },
    emptyBackground: { default: color('emptyBackground', '#333') },
    avatarBackground: { default: color('avatarBackground', '#ccc') },
    avatarTextColor: { default: color('avatarTextColor', '#fff') },
    tooltipBackground: { default: color('tooltipBackground', '#535353') },
    messageBackground: { default: color('messageBackground', '#535353') },
    modalBackground: { default: color('modalBackground', '#333') },
    radioInnerDisabledBg: { default: color('inputSuffixIconHoverColor', 'rgba(255, 255, 255, 0.12)') },
    transferItemHoverColor: { default: color('transferItemHoverColor', 'rgba(255, 255, 255, 0.08)') },
    colorGroup: { default: array('colorGroup', ['#e14d57', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad']) }
  },
  template: `<div>
    <div style="margin-bottom: 15px;">
      <sm-button type="primary" @click="setCustomTheme()">{{ $t('customizeTheme.custom') }}</sm-button>
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
  created() {
    setTimeout(() => this.setCustomTheme(), 0);
    Object.keys(this.$props).forEach(item => {
      this.$watch(item, function() {
        this.setCustomTheme();
      });
    });
  },
  beforeDestroy() {
    this.setCustomTheme('dark');
  }
});
CustomTheme.story = {
  name: toI18n('customizeTheme.custom')
};
