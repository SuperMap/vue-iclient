<template>
  <div class="sm-component-compass">
    <sm-button :style="[collapseCardHeaderBgStyle, headingTextColorStyle]" class="sm-component-compass__content" @click="reset">
      <i :class="iconClass" :style="needleStyle"></i>
    </sm-button>
  </div>
</template>
<script lang="ts">
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import Control from 'vue-iclient/src/mapboxgl/_mixin/control';
import MapGetter from 'vue-iclient/src/common/_mixin/map-getter';
import CompassViewModel from 'vue-iclient-core/controllers/mapboxgl/CompassViewModel';
import SmButton from 'vue-iclient/src/common/button/Button.vue';
import { Component, Prop, Mixins } from 'vue-property-decorator';
import VmUpdater from 'vue-iclient/src/common/_mixin/VmUpdater';

interface needleStyleParams {
  transform?: string;
}

@Component({
  name: 'SmCompass',
  components: {
    SmButton
  },
  viewModelProps: ['visualizePitch'],
  loaded() {
    this.createTransform(this.initAngle().angle, this.initAngle().pitch);
    // CompassViewModel 旋转地图，改变transform的值
    this.viewModel.rotateEventOn((angle, pitch) => {
      this.createTransform(angle, pitch);
    });
  }
})
class Compass extends Mixins(MapGetter, Control, Theme, VmUpdater) {
  needleStyle: needleStyleParams = {
    transform: ''
  };

  @Prop({ default: 'sm-components-icon-compass' }) iconClass: string;
  @Prop({ default: false }) visualizePitch: boolean;

  created() {
    this.viewModel = new CompassViewModel({ visualizePitch: this.visualizePitch });
  }

  reset() {
    return this.viewModel && (this.visualizePitch ? this.viewModel.resetNorthPitch() : this.viewModel.resetNorth());
  }

  initAngle() {
    return this.viewModel.initAngle();
  }

  createTransform(angle, pitch) {
    this.needleStyle.transform = this.visualizePitch
      ? 'scale(' +
        1 / Math.pow(Math.cos(pitch * (Math.PI / 180)), 0.5) +
        ') rotateX(' +
        pitch +
        'deg) rotateZ(' +
        angle * (180 / Math.PI) +
        'deg)'
      : 'rotate(' + angle * (180 / Math.PI) + 'deg)';
  }
}

export default Compass;
</script>
