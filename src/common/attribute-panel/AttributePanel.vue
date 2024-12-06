<template>
  <div class="sm-component-attribute-panel" :style="[getTextColorStyle, !showBorder && { border: 'none' }]">
    <div class="sm-component-attribute-panel__header">
      <div v-if="!$slots.header && title !== undefined" class="title ellipsis" :title="title">{{ title }}</div>
      <slot name="header" />
    </div>
    <div class="sm-component-attribute-panel__content">
      <sm-table-popup v-bind="tablePopupProps" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import SmTablePopup from 'vue-iclient/src/common/table-popup/TablePopup.vue';

@Component({
  name: 'SmAttributePanel',
  components: { SmTablePopup }
})
class SmAttributePanel extends Mixins(Theme) {
  @Prop() title: String;

  @Prop({ default: true }) showBorder: Boolean;

  @Prop() titleRender: Function;

  @Prop() valueRender: Function;

  @Prop({
    default: () => {
      return [];
    }
  })
  attributes: Array<Object>;

  get tablePopupProps() {
    return {
      data: this.attributes,
      columns: [
        {
          dataIndex: 'title',
          customRender: this.titleRender
        },
        {
          dataIndex: 'value',
          customRender: this.valueRender
        }
      ],
      showHeader: false,
      background: 'transparent',
      textColor: this.textColor
    };
  }
}
export default SmAttributePanel;
</script>
