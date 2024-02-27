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
  viewFn: any;
  scanFn: any;
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
  scanEffectChaned() {
    this.WebSceneViewModel && this.WebSceneViewModel.setScanEffect(this.options.scanEffect);
  }

  @Watch('options.position')
  positionChaned() {
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

  @Emit()
  cesiumInstanceDidLoad(instance) {
    return instance;
  }

  ready(cesiumInstance) {
    const { Cesium, viewer } = cesiumInstance;
    this.cesiumInstanceDidLoad(cesiumInstance);
    this.WebSceneViewModel = new WebSceneViewModel(Cesium, viewer, this.sceneUrl, this.options);
    this.registerEvents();
  }

  registerEvents() {
    this.viewFn = e => {
      let position = e.position;
      this.viewerPositionChanged(position);
    };
    this.scanFn = e => {
      let position = e.position;
      this.scanPositionChanged(position);
    };
    this.WebSceneViewModel.on('viewerpositionchanged', this.viewFn);
    this.WebSceneViewModel.on('scanpositionchanged', this.scanFn);
  }

  beforeDestory() {
    this.WebSceneViewModel.off('viewerpositionchanged', this.viewFn);
    this.WebSceneViewModel.off('scanpositionchanged', this.scanFn);
    this.WebSceneViewModel.removeInputAction();
    this.WebSceneViewModel = null;
  }
}
export default SmWebScene;
</script>
