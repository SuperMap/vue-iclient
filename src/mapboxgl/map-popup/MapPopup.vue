<template>
  <div v-show="false" class="sm-component-map-popup" ref="Popup" :style="[tablePopupBgStyle, getTextColorStyle]">
    <sm-attribute-panel
      :showIcon="showIcon"
      :title="title"
      :total="lnglats.length || data.length"
      :defaultIndex="defaultIndex"
      :contentSlot="contentSlot"
      :data="data"
      :columns="columns"
      @change="changeIndex"
    >
      <slot></slot>
    </sm-attribute-panel>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import SmAttributePanel from 'vue-iclient/src/common/attribute-panel/AttributePanel.vue';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import MapPopupViewModel from './MapPopupViewModel';
import { setPopupArrowStyle } from 'vue-iclient/src/common/_utils/util';

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

  get currentCoordinate() {
    return this.lnglats[this.currentIndex];
  }

  removePopup() {
    this.viewModel && this.viewModel.removePopup();
  }

  addPopup() {
    if (!this.currentCoordinate) return;
    this.viewModel.addPopup(this.currentCoordinate, this.$refs.Popup);
    setPopupArrowStyle(this.tablePopupBgData);
  }

  changeIndex(index) {
    this.currentIndex = index;
    this.$emit('change', index);
  }
}
export default SmMapPopup;
</script>
