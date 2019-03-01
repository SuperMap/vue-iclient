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
  loaded() {
    this.layerListViewModel = new layerListViewModel(this.map);
    this.layerListViewModel.on("layersUpdated", () => {
      this.layerList = this.layerListViewModel.getLayers();
    });
  }
};
</script>

<style lang='scss'>
.layer-control {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10000;
  background: #fff;
  box-shadow: 0 0px 5px rgba(0, 0, 0, 0.2);
  max-height: 400px;
  border-radius: 2px;
  .layers-content {
    width: 100%;
    height: 100%;
    ul {
      padding: 0;
      li {
        list-style: none;

        .el-checkbox {
            .el-checkbox__input{
                vertical-align: inherit;
            }
          .el-checkbox__label {
            width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            line-height: 15px !important;
          }
        }
      }
    }
  }
  .el-card__body{
      padding-top: 10px !important;
  }
}
</style>
