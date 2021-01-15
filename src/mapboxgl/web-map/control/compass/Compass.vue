<template>
  <div class="sm-component-compass" :style="[collapseCardHeaderBgStyle, getTextColorStyle]">
    <sm-button
      class="sm-component-compass__content"
      @click="reset"
    >
      <i :class="iconClass" :style="needleStyle"></i>
    </sm-button>
  </div>
</template>
<script>
import Theme from '../../../../common/_mixin/Theme';
import Control from '../../../_mixin/control';
import MapGetter from '../../../_mixin/map-getter';
import CompassViewModel from './CompassViewModel';
import SmButton from '../../../../common/button/Button.vue';

export default {
  name: 'SmCompass',
  components: {
    SmButton
  },
  mixins: [MapGetter, Control, Theme],
  props: {
    iconClass: {
      type: String,
      default: 'sm-components-icon-compass'
    },
    visualizePitch: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      transform: ''
    };
  },
  computed: {
    needleStyle() {
      return {
        transform: this.transform
      };
    }
  },
  created() {
    this.viewModel = new CompassViewModel();
  },
  methods: {
    reset() {
      return this.visualizePitch ? this.viewModel.resetNorthPitch() : this.viewModel.resetNorth();
    },
    initAngle() {
      return this.viewModel.initAngle();
    },
    createTransform(angle, pitch) {
      this.transform = this.visualizePitch
        ? 'scale(' +
          1 / Math.pow(Math.cos(pitch * (Math.PI / 180)), 0.5) +
          ') rotateX(' +
          pitch +
          'deg) rotateZ(' +
          angle * (180 / Math.PI) +
          'deg)'
        : 'rotate(' + angle * (180 / Math.PI) + 'deg)';
    }
  },
  loaded() {
    this.createTransform(this.initAngle().angle, this.initAngle().pitch);
    // CompassViewModel 旋转地图，改变transform的值
    this.viewModel.rotateEventOn((angle, pitch) => {
      this.createTransform(angle, pitch);
    });
  }
};
</script>
