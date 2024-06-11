<template>
  <div v-show="false" class="sm-component-map-popup" ref="Popup" :style="[tablePopupBgStyle, getTextColorStyle]">
    <div v-show="showIcon || title" class="sm-component-map-popup__header">
      <sm-icon
        v-show="showIcon"
        :class="['icon', 'left-icon', currentIndex === 0 && 'disabled']"
        type="caret-left"
        @click="changeIndex(-1)"
      />
      <span class="ellipsis" :title="headerTitle">{{ headerTitle }}</span>
      <sm-icon
        v-show="showIcon"
        type="caret-right"
        :class="['icon', 'right-icon', currentIndex === lnglats.length - 1 && 'disabled']"
        @click="changeIndex(1)"
      />
    </div>
    <div class="sm-component-map-popup__content">
      <slot v-if="contentSlot" :name="contentSlot"></slot>
      <sm-table-popup v-else v-bind="tablePopupProps" class="sm-component-map-popup__self-content" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import SmTablePopup from 'vue-iclient/src/common/table-popup/TablePopup.vue';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import MapPopupViewModel from './MapPopupViewModel';
import { setPopupArrowStyle } from 'vue-iclient/src/common/_utils/util';

@Component({
  name: 'SmMapPopup',
  components: { SmTablePopup },
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

  get currentCoordinate() {
    return this.lnglats[this.currentIndex];
  }

  get tablePopupProps() {
    return { data: this.data[this.currentIndex], columns: this.columns };
  }

  get headerTitle() {
    if (this.title) {
      return this.title;
    }
    return `${this.currentIndex + 1}/${this.lnglats.length}`;
  }

  removePopup() {
    this.viewModel && this.viewModel.removePopup();
  }

  addPopup() {
    if (!this.currentCoordinate) return;
    this.viewModel.addPopup(this.currentCoordinate, this.$refs.Popup);
    setPopupArrowStyle(this.tablePopupBgData);
  }

  changeIndex(val) {
    this.currentIndex += val;
    if (this.currentIndex < 0) {
      this.currentIndex = 0;
    }
    this.$emit('change', this.currentIndex);
  }
}
export default SmMapPopup;
</script>
