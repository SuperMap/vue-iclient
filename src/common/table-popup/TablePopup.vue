<template>
  <div class="sm-component-table-popup" :style="[backgroundStyle, getTextColorStyle]">
    <div class="sm-component-table-popup__close">x</div>
    <a-table
      class="sm-component-table-popup__table"
      :data-source="data"
      :columns="columns"
      :rowKey="(record, index) => index"
      :pagination="false"
      :style="backgroundStyle"
    ></a-table>
  </div>
</template>
<script>
import Theme from '../_mixin/Theme';
import { getColorWithOpacity } from '../_utils/util';

export default {
  name: 'SmTablePopup',
  mixins: [Theme],
  props: {
    data: {
      type: Array,
      default() {
        return [];
      }
    },
    columns: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  computed: {
    backgroundStyle() {
      return { background: this.getBackground && getColorWithOpacity(this.getBackground, 0.5) };
    }
  }
};
</script>
