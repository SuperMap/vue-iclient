<template>
  <el-card class="layer-control">
    <div slot="header" class="clearfix">
      <span>图层控制</span>
    </div>
    <div class="layers-content">
      <ul>
        <li v-for="(item,index) in layerList" :key="index">
          <el-checkbox
            @change="toggleShowAndHide(item.id,item.visibility)"
            :checked="item.visibility | isVisible"
          >{{item.id}}</el-checkbox>
        </li>
      </ul>
    </div>
  </el-card>
</template>

<script>
import Widget from "./Widget";
import layerListViewModel from "../../viewmodel/layerListViewModel";
export default {
  name: "SmLayerList",
  props: {
    iconClass: {
      type: String,
      default: "el-icon-tickets"
    },
    autoRotate: {
      type: Boolean,
      default: false
    },
    collapsed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      layerList: []
    };
  },
  methods: {
    toggleShowAndHide(sourceLayer, visibility) {
      visibility = visibility === "visible" ? "none" : "visible";
      this.layerListViewModel &&
        (this.layerList = this.layerListViewModel.setVisibleStatus(
          sourceLayer,
          visibility
        ));
    }
  },
  filters: {
    isVisible(visibility) {
      if (visibility === "visible") {
        return true;
      } else {
        return false;
      }
    }
  },
  extends: Widget,
  loaded(map) {
    !this.parentIsWebMapOrMap && this.$el.classList.add("layer-list-container");
    this.layerListViewModel = new layerListViewModel(map);
    this.layerListViewModel.on("layersUpdated", () => {
      this.layerList = this.layerListViewModel.getLayers();
    });
  }
};
</script>

