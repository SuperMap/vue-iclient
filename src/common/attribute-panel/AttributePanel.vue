<template>
  <div class="sm-component-attribute-panel" :style="[getTextColorStyle, !showBorder && { border: 'none' }]">
    <div class="sm-component-attribute-panel__header">
      <div class="title">{{ title }}</div>
      <div v-show="showIcon" class="switchDataText">
        <sm-icon
          :class="['icon', 'left-icon', attrIndex === 0 && 'disabled']"
          type="caret-left"
          @click="changeIndex(-1)"
        />
        <span class="ellipsis" :title="paginationContent">{{ paginationContent }}</span>
        <sm-icon
          type="caret-right"
          :class="['icon', 'right-icon', attrIndex === total - 1 && 'disabled']"
          @click="changeIndex(1)"
        />
      </div>
    </div>
    <div class="sm-component-attribute-panel__content">
      <sm-table-popup v-bind="tablePopupProps" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import SmTablePopup from 'vue-iclient/src/common/table-popup/TablePopup.vue';

@Component({
  name: 'SmAttributePanel',
  components: { SmTablePopup }
})
class SmAttributePanel extends Mixins(Theme) {
  attrIndex = 0;

  @Prop({ default: false }) showIcon: Boolean;

  @Prop({ default: 0 }) currentIndex: number;

  @Prop() paginationText: String;

  @Prop() total: number;

  @Prop() title: String;

  @Prop({ default: true }) showHeader: Boolean;

  @Prop({ default: true }) showBorder: Boolean;

  @Prop({
    default: () => {
      return [];
    }
  })
  attributes: Array<Object>;

  @Prop({
    default: () => {
      return [];
    }
  })
  columns: Array<Object>;

  @Watch('currentIndex')
  currentIndexChanged() {
    this.attrIndex = this.currentIndex;
  }

  get paginationContent() {
    if (this.paginationText) {
      return this.paginationText;
    }
    return `${this.attrIndex + 1}/${this.total}`;
  }

  get tablePopupProps() {
    return {
      data: this.attributes,
      columns: this.columns,
      showHeader: this.showHeader,
      background: 'transparent',
      textColor: 'inherit'
    };
  }

  changeIndex(delta) {
    this.attrIndex += delta;
    if (this.attrIndex < 0) {
      this.attrIndex = 0;
    }
    this.$emit('change', this.attrIndex);
  }
}
export default SmAttributePanel;
</script>
