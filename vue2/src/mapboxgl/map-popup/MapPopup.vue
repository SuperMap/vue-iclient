<template>
  <div v-show="false" class="sm-component-map-popup" ref="Popup" :style="[tablePopupBgStyle, getTextColorStyle]">
    <sm-attribute-panel
      :title="title"
      :showBorder="false"
      :textColor="textColor"
      :attributes="filterData[defaultIndex]"
      :titleRender="titleRender"
      :valueRender="valueRender"
      :showHeader="showHeader"
    >
      <template slot="header">
        <div class="title ellipsis" :title="title">{{ title }}</div>
        <div v-show="showIcon" class="switchDataText">
          <sm-icon
            :class="['icon', 'left-icon', currentIndex === 0 && 'disabled']"
            type="caret-left"
            @click="changeIndex(-1)"
          />
          <span :title="paginationContent">{{ paginationContent }}</span>
          <sm-icon
            type="caret-right"
            :class="['icon', 'right-icon', currentIndex === (lnglats.length || data.length) - 1 && 'disabled']"
            @click="changeIndex(1)"
          />
        </div>
      </template>
    </sm-attribute-panel>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import SmAttributePanel from 'vue-iclient/src/common/attribute-panel/AttributePanel.vue';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import MapPopupViewModel from './MapPopupViewModel';
import { setPopupArrowStyle } from 'vue-iclient-core/utils/util';
import cloneDeep from 'lodash/cloneDeep';

@Component({
  name: 'SmMapPopup',
  components: { SmAttributePanel },
  loaded() {
    this.viewModel = new MapPopupViewModel(this.map);
  },
  beforeDestroy() {
    this.viewModel && this.viewModel.removed();
  }
})
class SmMapPopup extends Mixins(MapGetter, Theme) {
  currentIndex = 0;
  @Prop({
    default: () => {
      return [];
    }
  })
  lnglats: Array<Array<number>>;

  @Prop({ default: false }) showIcon: Boolean;

  @Prop({ default: 0 }) defaultIndex: number;

  @Prop() title: String;

  @Prop() contentSlot: String;

  @Prop({
    default: () => {
      return [];
    }
  })
  data: Array<Array<Object>>;

  @Prop({
    default: () => {
      return [];
    }
  })
  columns: Array<Object>;

  @Prop() titleRender: Function;

  @Prop() valueRender: Function;

  @Prop({ default: true }) showHeader: Boolean;

  @Watch('currentCoordinate')
  currentCoordinatesChanged() {
    this.addPopup();
  }

  @Watch('defaultIndex')
  defaultIndexChanged() {
    this.currentIndex = this.defaultIndex;
  }

  @Watch('tablePopupBgData')
  tablePopupBgDataChanged() {
    setPopupArrowStyle(this.tablePopupBgData);
  }

  @Watch('data')
  dataChanged() {
    if (!this.data.length) {
      this.removePopup();
    }
  }

  get currentCoordinate() {
    return this.lnglats[this.currentIndex];
  }

  get filterData() {
    return cloneDeep(this.data).map(propertyList => {
      return propertyList.map(item => {
        // @ts-ignore
        delete item.slotName;
        return item;
      });
    });
  }

  get paginationContent() {
    return `${this.currentIndex + 1}/${this.lnglats.length || this.data.length}`;
  }

  removePopup() {
    this.viewModel && this.viewModel.removePopup();
  }

  addPopup() {
    if (!this.currentCoordinate) return;
    this.viewModel.addPopup(this.currentCoordinate, this.$refs.Popup);
    setPopupArrowStyle(this.tablePopupBgData);
  }

  changeIndex(delta) {
    this.currentIndex += delta;
    if (this.currentIndex < 0) {
      this.currentIndex = 0;
    }
    this.$emit('change', this.currentIndex);
  }
}
export default SmMapPopup;
</script>
