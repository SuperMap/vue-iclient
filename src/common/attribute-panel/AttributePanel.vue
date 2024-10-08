<template>
  <div class="sm-component-attribute-panel" :style="[getTextColorStyle]">
    <div v-if="title">{{ title }}</div>
    <div v-show="showIcon" class="sm-component-attribute-panel__header">
      <sm-icon
        :class="['icon', 'left-icon', currentIndex === 0 && 'disabled']"
        type="caret-left"
        @click="changeIndex(-1)"
      />
      <span class="ellipsis" :title="paginationContent">{{ paginationContent }}</span>
      <sm-icon
        type="caret-right"
        :class="['icon', 'right-icon', currentIndex === total - 1 && 'disabled']"
        @click="changeIndex(1)"
      />
    </div>
    <div class="sm-component-attribute-panel__content">
      <slot></slot>
      <div v-if="$scopedSlots && Object.keys($scopedSlots).length && attributes">
        <ul>
          <li v-for="(value, key, index) in attributes" :key="index" class="content">
            <div class="left ellipsis" :title="key" style="{width: 110}">{{ key }}</div>
            <div class="right ellipsis" :title="value.value || value" style="{width: 170}">
              <slot v-if="fieldsMap[key]" :name="fieldsMap[key]" :value="value"></slot>
              <span v-else>{{ value }}</span>
            </div>
          </li>
        </ul>
      </div>
      <sm-table-popup v-if="!$slots.default && !($scopedSlots && Object.keys($scopedSlots).length) && attributes" v-bind="tablePopupProps" class="sm-component-attribute-panel__self-content" />
      <sm-empty v-if="!$slots.default && !attributes" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import SmTablePopup from 'vue-iclient/src/common/table-popup/TablePopup.vue';
import SmEmpty from 'vue-iclient/src/common/empty/Empty.vue';

@Component({
  name: 'SmAttributePanel',
  components: { SmTablePopup, SmEmpty }
})
class SmAttributePanel extends Mixins(Theme) {
  currentIndex = 0;

  @Prop({ default: false }) showIcon: Boolean;

  @Prop({ default: 0 }) defaultIndex: number;

  @Prop() paginationText: String;

  @Prop() total: number;

  @Prop() title: String;

  @Prop({
    default: () => {
      return [];
    }
  })
  fields: Array<Object>;

  @Prop({
    default: () => {
      return {};
    }
  })
  attributes: Object;

  @Prop({
    default: () => {
      return [];
    }
  })
  columns: Array<Object>;

  @Watch('defaultIndex')
  defaultIndexChanged() {
    this.currentIndex = this.defaultIndex;
  }

  get fieldsMap() {
    const attributeMap = {};
    this.fields.forEach((field) => {
      // @ts-ignore
      attributeMap[field.field] = field.slotName;
    });
    return attributeMap;
  }

  get paginationContent() {
    if (this.paginationText) {
      return this.paginationText;
    }
    return `${this.currentIndex + 1}/${this.total}`;
  }

  get tablePopupProps() {
    return { data: [this.attributes], columns: this.columns };
  }

  changeIndex(val) {
    this.currentIndex += val;
    if (this.currentIndex < 0) {
      this.currentIndex = 0;
    }
    this.$emit('change', this.currentIndex);
  }
}
export default SmAttributePanel;
</script>
