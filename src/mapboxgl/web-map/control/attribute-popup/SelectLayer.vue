<template>
  <div v-show="isShow" :title="$t('attributePopup.selectLayer')" class="sm-component-popup__select-layer">
    <div class="sm-component-popup__select-layer-header">
      <span class="title">{{ $t('attributePopup.selectLayer') }}</span>
      <i class="sm-components-icon-close" @click="handleClose()"></i>
    </div>
    <div class="sm-component-popup__select-layer-content">
      <div
        v-for="item in layerInfos"
        :key="item.id"
        class="sm-component-popup__select-layer-item"
        @click="handleSelect(item.id)"
      >
        <i :class="['sm-component-layer-type', getTypeIcon(item.type)]" />
        <div class="sm-component-layer-name ellipsis">{{ item.name }}</div>
        <i class="sm-components-icon-arrow-right" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SmSelectLayer',
  props: {
    show: {
      type: Boolean,
      default: true
    },
    layerInfos: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isShow: this.show
    };
  },
  watch: {
    show(newVal) {
      this.isShow = newVal;
    }
  },
  methods: {
    getTypeIcon(type) {
      switch (type) {
        case 'symbol':
        case 'circle':
        case 'point-extrusion':
          return 'sm-components-icon-multi-point';
        case 'fill':
        case 'fill-extrusion':
          return 'sm-components-icon-ploygon';
        case 'line':
        case 'line-extrusion':
          return 'sm-components-icon-line';
        default:
          return '';
      }
    },
    handleClose() {
      this.$emit('close');
    },
    handleSelect(id) {
      this.$emit('select', id);
    }
  }
};
</script>
