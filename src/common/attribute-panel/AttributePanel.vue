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
      <slot></slot>
      <div v-if="$scopedSlots && Object.keys($scopedSlots).length && Object.keys(attributes).length">
        <ul>
          <li v-for="(value, key, index) in attributes" :key="index" class="content">
            <div class="left ellipsis" :title="key" :style="formatStyle.keyStyle">{{ key }}</div>
            <div class="right ellipsis" :title="value" :style="formatStyle.valueStyle">
              <slot v-if="fieldsMap[key]" :name="fieldsMap[key]" :value="value"></slot>
              <span v-else>{{ value }}</span>
            </div>
          </li>
        </ul>
      </div>
      <sm-empty v-if="!$slots.default && !Object.keys(attributes).length" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import SmEmpty from 'vue-iclient/src/common/empty/Empty.vue';

@Component({
  name: 'SmAttributePanel',
  components: { SmEmpty }
})
class SmAttributePanel extends Mixins(Theme) {
  attrIndex = 0;

  @Prop({ default: false }) showIcon: Boolean;

  @Prop({ default: 0 }) currentIndex: number;

  @Prop() paginationText: String;

  @Prop() total: number;

  @Prop() title: String;

  @Prop({ default: true }) showBorder: Boolean;

  @Prop({
    default: () => {
      return {
        keyStyle: {},
        valueStyle: {}
      };
    }
  })
  attributeStyle: Object;

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

  @Watch('currentIndex')
  currentIndexChanged() {
    this.attrIndex = this.currentIndex;
  }

  get fieldsMap() {
    const attributeMap = {};
    this.fields.forEach(field => {
      // @ts-ignore
      attributeMap[field.field] = field.slotName;
    });
    return attributeMap;
  }

  get paginationContent() {
    if (this.paginationText) {
      return this.paginationText;
    }
    return `${this.attrIndex + 1}/${this.total}`;
  }

  get formatStyle() {
    let style = Object.assign({}, this.attributeStyle);
    Object.keys(style).forEach(item => {
      // @ts-ignore
      if (Object.prototype.hasOwnProperty.call(style[item], 'width')) {
        // @ts-ignore
        if (style[item].width === 0) {
          style[item].width = 'unset';
          style[item].flex = 1;
        } else {
          if (style[item].width !== 'unset') {
            style[item].width += 'px';
          }
          style[item].flex = 'unset';
        }
      }
      // @ts-ignore
      if (Object.prototype.hasOwnProperty.call(style[item], 'height')) {
        // @ts-ignore
        if (style[item].height === 0) {
          style[item].height = 'unset';
        } else {
          if (style[item].height !== 'unset') {
            style[item].height += 'px';
          }
        }
      }
    });
    return style;
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
