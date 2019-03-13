<template>
  <el-card class="sm-layer-list">
    <div class="sm-layer-list__content">
      <span>{{ $tc('layerList.apple',10,{ count: 20 }) }}</span>
      <el-collapse v-for="(sourceValue,sourceKey,index) in sourceList" :key="index" class='sm-layer-list__collapse'>
        <el-collapse-item v-if="typeof sourceValue.sourceLayerList === 'object'"
          class="sm-layer-list__collapseitem">
          <template slot="title">
            <i :class="['el-icon-view', sourceValue.visibility === 'visible' ? 'visible':'none']"
            @click.stop="toggleLayerGroupVisibility(sourceKey,sourceValue.visibility)"></i>
            <div>
              {{sourceKey}}
            </div>
            
          </template>
          <el-checkbox
            v-for="(sourcelayerValue,sourcelayerKey,index) in sourceValue.sourceLayerList"
            :key="index"
            @change="toggleVisibility(sourcelayerKey,sourceKey,sourcelayerValue[0].visibility)"
            :value="sourcelayerValue[0].visibility | isVisible"
          >{{sourcelayerKey}}</el-checkbox>
        </el-collapse-item>

        <el-card v-else class="sm-layer-list__elcarditem">
          <i :class="['el-icon-view', sourceValue.visibility === 'visible' ? 'visible':'none']"
          @click.stop="toggleLayerGroupVisibility(sourceKey,sourceValue.visibility)"></i>
          <div class="sm-layer-list__layergroupname">
            {{sourceKey}}
          </div>
        </el-card>
      </el-collapse>
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
      default: "smwidgets-icons-layer-style"
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
      sourceList: {}
    };
  },
  methods: {
    toggleVisibility(sourceLayer, sourceName, visibility) {
      console.log($tc('layerList.apple',10,{ count: 20 }))
      this.layerListViewModel &&
        this.layerListViewModel.changeLayerVisible(
          sourceLayer,
          sourceName,
          visibility
        );
    },
    addNewLayer() {
      this.layerListViewModel.addNewLayer();
    },
    deleteLayer() {
      this.layerListViewModel.deleteLayer();
    },
    toggleLayerGroupVisibility(sourceName, visibility) {
      console.log(this.$tc('layerList.apple',10,{ count: 20 }))
      this.layerListViewModel &&
        this.layerListViewModel.changeLayerGroupVisibility(
          sourceName,
          visibility
        );
    }
  },
  filters: {
    isVisible(visibility) {
      return visibility === "visible" ? true : false
    }
  },
  extends: Widget,
  loaded() {
    !this.parentIsWebMapOrMap && this.$el.classList.add("layer-list-container");
    
    this.layerListViewModel = new layerListViewModel(this.map);
    this.sourceList = this.layerListViewModel.getLayers();

    this.layerListViewModel.on("layersUpdated", () => {
      this.sourceList = this.layerListViewModel.getLayers();
    });
  }
};
</script>
