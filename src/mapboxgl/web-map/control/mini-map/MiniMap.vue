
<template>
  <sm-card
    :id="(!iconClass&&!headerName)&&'miniMap'"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
  >
    <div :id="(iconClass||headerName)&&'miniMap'"></div>
  </sm-card>
</template>

<script>
import MiniMapViewModel from './MiniMapViewModel';
import Control from '../../../_mixin/control';
import MapGetter from '../../../_mixin/map-getter';
import Card from '../../../../common/_mixin/card';

export default {
  name: 'SmMiniMap',
  mixins: [MapGetter, Control, Card],
  props: {
    iconClass: {
      type: String,
      default: 'sm-components-icons-return'
    },
    autoRotate: {
      type: Boolean,
      default: true
    }
  },
  mounted() {
    this.icon = this.$el.children[0];
    this.iconClass && this.icon && (this.icon.style.visibility = 'hidden');
  },
  loaded() {
    this.$el.classList.add('sm-component-minimap');
    this.viewModel = new MiniMapViewModel(this.$el.querySelector('#miniMap') || this.$el, this.map);
    this.iconClass && this.icon && this.viewModel.on('minimapinitialized', () => {
      this.icon.style.visibility = 'visible';
    });
  }
};
</script>
