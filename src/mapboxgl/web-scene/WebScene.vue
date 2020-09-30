<template>
  <div class="sm-component-web-scene">
    <vc-viewer
      v-if="sceneUrl"
      class="sm-component-web-scene__wrap"
      :cesiumPath="cesiumPath"
      @ready="ready"
    ></vc-viewer>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Watch, Emit } from 'vue-property-decorator';
import WebSceneViewModel from './WebSceneViewModel';

@Component({
  name: 'SmWebScene'
})
class SmWebScene extends Vue {
  WebSceneViewModel: WebSceneViewModel;

  @Prop() sceneUrl: string;

  @Prop() cesiumPath: string;

  @Prop() options: {
    withCredentials: boolean;
    position?: { x: number; y: number; z: number };
    scanEffect?: {
      status?: boolean;
      type?: 'circle' | 'noScan' | 'line';
      centerPostion?: { x: number; y: number; z: number };
      period?: number;
      speed?: number;
    };
  };

  @Watch('sceneUrl')
  sceneUrlChaned() {
    this.WebSceneViewModel && this.WebSceneViewModel.setSceneUrl(this.sceneUrl);
  }

  @Watch('options.scanEffect')
  scanEffectChaned(newVal, oldVal) {
    this.WebSceneViewModel && this.WebSceneViewModel.setScanEffect(this.options.scanEffect);
  }

  @Watch('options.position')
  positionChaned(newVal, oldVal) {
    this.WebSceneViewModel && this.WebSceneViewModel.setPosition(this.options.position);
  }

  @Emit()
  viewerPositionChanged(value) {
    return value;
  }

  @Emit()
  scanPositionChanged(value) {
    return value;
  }

  ready(cesiumInstance) {
    const { Cesium, viewer } = cesiumInstance;
    this.WebSceneViewModel = new WebSceneViewModel(Cesium, viewer, this.sceneUrl, this.options);
    this.registerEvents();
  }

  registerEvents() {
    this.WebSceneViewModel.on('viewerpositionchanged', e => {
      let position = e.position;
      this.viewerPositionChanged(position);
    });
    this.WebSceneViewModel.on('scanpositionchanged', e => {
      let position = e.position;
      this.scanPositionChanged(position);
    });
  }
}
export default SmWebScene;
</script>
