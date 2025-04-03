<template>
  <div :id="target" class="sm-component-web-scene"><slot></slot></div>
</template>

<script>
import WebSceneViewModel from 'vue-iclient-core/controllers/mapboxgl/WebSceneViewModel';
import isEqual from 'lodash.isequal';
import sceneEvent from 'vue-iclient-core/types/scene-event';

export default {
  name: 'SmWebScene',
  props: {
    sceneUrl: {
      type: String
    },
    widgetsPath: {
      type: String
    },
    cesiumPath: {
      type: String
    },
    options: {
      type: Object
    },
    target: {
      type: String,
      default: 'scene'
    },
    flyAnimation: {
      type: Boolean
    }
  },
  watch: {
    sceneUrl() {
      this.webSceneViewModel && this.webSceneViewModel.setSceneUrl(this.sceneUrl);
    },
    'options.scanEffect'(scanEffect) {
      this.webSceneViewModel && this.webSceneViewModel.setScanEffect(scanEffect);
    },
    'options.position'(newVal, oldVal) {
      if (this.webSceneViewModel) {
        let position = null;
        if (this.webSceneViewModel.viewer) {
          const destination = this.webSceneViewModel.getPosition();
          const orientation = this.webSceneViewModel.getOrientation();
          position = { orientation, destination };
        }
        if (!isEqual(newVal, oldVal) && !isEqual(newVal, position)) {
          this.webSceneViewModel.setPosition(newVal, this.flyAnimation);
        }
      }
    },
    'options.tiandituOptions'(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.webSceneViewModel && this.webSceneViewModel.setTiandituOption(newVal);
      }
    }
  },
  mounted() {
    sceneEvent.setScene(this.target, {});
    this.webSceneViewModel = new WebSceneViewModel(this.target, this.sceneUrl, this.options, this.widgetsPath, this.cesiumPath);
    this.registerEvents();
  },
  methods: {
    registerEvents() {
      this.webSceneViewModel.on('viewerpositionchanged', this.changeViewerPositionFn);
      this.webSceneViewModel.on('scanpositionchanged', this.changeScanPositionFn);
      this.webSceneViewModel.on('instancedidload', this.instanceDidLoadFn);
    },
    changeViewerPositionFn(e) {
      this.$emit('viewerPositionChanged', e.position);
    },
    changeScanPositionFn(e) {
      this.$emit('scanpositionchanged', e.centerPosition);
    },
    instanceDidLoadFn(e) {
      this.$emit('cesiumInstanceDidLoad', e.instance);
    }
  },
  beforeDestory() {
    this.webSceneViewModel.off('viewerpositionchanged', this.changeViewerPositionFn);
    this.webSceneViewModel.off('scanpositionchanged', this.changeScanPositionFn);
    this.webSceneViewModel.off('instancedidload', this.instanceDidLoad);
    this.webSceneViewModel.removeInputAction();
    this.webSceneViewModel = null;
    sceneEvent.$options.deleteScene(this.target);
  }
};
</script>
