<template>
  <div :id="target" class="sm-widget-map">
    <slot></slot>
    <Pan v-if="panControl" :position="panPosition"/>
    <Scale v-if="scaleControl" :position="scalePosition"/>
    <Zoom v-if="zoomControl" :show-zoom-slider="zoomWithSlide" :position="zoomPosition"/>
  </div>
</template>

<script>
import WebMapViewModel from "../../viewmodel/WebMapViewModel";
import mapEvent from "../commontypes/mapEvent";
import VmUpdater from "../mixin/vm-updater";
import Pan from "./Pan";
import Scale from "./Scale";
import Zoom from "./Zoom";
export default {
  name: "SmWebMap",
  relativeMap: true,
  viewModelProps: ["mapId", "webMapOptions", "mapOptions"],
  mixins: [VmUpdater],
  components: {
    Pan,
    Scale,
    Zoom
  },
  props: {
    mapId: {
      type: String,
      required: true
    },
    target: {
      type: String,
      default: "map"
    },
    webMapOptions: {
      type: Object,
      default() {
        return {};
      }
    },
    mapOptions: {
      type: Object,
      default() {
        return {};
      }
    },
    panControl: {
      type: Boolean,
      default: false
    },
    scaleControl: {
      type: Boolean,
      default: false
    },
    zoomControl: {
      type: Boolean,
      default: false
    },
    zoomWithSlide: {
      type: Boolean,
      default: false
    },
    panPosition: {
      type: String,
      default: "top-left"
    },
    scalePosition: {
      type: String,
      default: "bottom-left"
    },
    zoomPosition: {
      type: String,
      default: "top-left"
    }
  },
  computed: {
    getMapTarget() {
      return this.target;
    }
  },
  created() {
    if (!mapEvent.firstMapTarget) {
      mapEvent.firstMapTarget = this.target;
    }
  },
  mounted() {
    this.initializeWebMap();
    this.registerEvents();
  },
  methods: {
    initializeWebMap() {
      this.webMapOptions.target = this.target;
      this.viewModel = new WebMapViewModel(this.mapId, this.webMapOptions);
    },
    registerEvents() {
      this.viewModel.on("addlayerssucceeded", e => {
        mapEvent.$emit(`initMap-${this.target}`, e.map, this.viewModel);
        this.$children.forEach(children => {
          children.isLayer = ["smrasterlayer", "smvectortilelayer"].includes(
            children.$options.name && children.$options.name.toLowerCase()
          );
          if (!children.isLayer) {
            children.addControl(e.map);
            children.$el && children.filterDelayLoad && (children.isShow = true);
            children.$el && children.filterDelayLoad && children.$el.style && (children.$el.style.display = "block");
            if(children.$options.name.toLowerCase() === 'smchart'){
              children.viewModel.resize();
            }
          }
        });
      });
    }
  }
};
</script>



