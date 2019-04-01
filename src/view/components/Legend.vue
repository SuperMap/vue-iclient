<template>
<sm-card
   :style="[getBackgroundStyle,noBorder]"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    class="sm-legend"
    v-show="isShow"
  >
  <el-card>
    <el-collapse
      class="sm-legend__table"
      v-model="activeLegend"
      v-if="(mode === 'panel' || (layerNames.length > 1 && mode !== 'simple'))"
    >
      <el-collapse-item
        v-for="(layerValue,layerKey,index) in legendList"
        :key="index"
        :name="index+1"
      >
        <template slot="title">
          <div class="sm-legend__title" :style="[getColorStyle(0)]">{{layerValue.layerId}}</div>
        </template>
        <div
          v-if="isShowField"
          class="sm-legend__themefield add-ellipsis"
          :style="[getColorStyle(0)]"
        >{{$t("legend.themeField")}}:{{layerValue.themeField}}</div>
        <div v-if="layerValue.layerType === 'UNIQUE'">
          <ul class="sm-legend__point">
            <li v-for="(item,index) in layerValue.styleGroup" :key="index" class="sm-legend__item">
              <i :class="layerValue.featureType | selectLayerType" :style="{color:item.color}"></i>
              <span class="sm-legend__field-value">{{item.value}}</span>
            </li>
          </ul>
        </div>

        <div v-if="layerValue.layerType === 'HEAT'">
          <!-- <div
            class="sm-legend__themefield add-ellipsis"
          >{{$t("legend.themeField")}}：{{layerValue.themeField}}</div>-->
          <div
            class="sm-legend__heat"
            :style="{background:`linear-gradient(to top,${layerValue.styleGroup.join(',')})`}"
          >
            <span class="sm-legend__top">
              <i class="el-icon-caret-left"></i>
              {{$t("legend.top")}}
            </span>
            <span class="sm-legend__bottom">
              <i class="el-icon-caret-left"></i>
              {{$t("legend.bottom")}}
            </span>
          </div>
        </div>

        <div v-if="layerValue.layerType === 'RANGE'">
          <!-- <div
            class="sm-legend__themefield add-ellipsis"
          >{{$t("legend.themeField")}}:{{layerValue.themeField}}</div>-->
          <div class="sm-legend__range">
            <div
              v-for="(item,index) in layerValue.styleGroup"
              :key="index"
              :style="{background:item.color}"
              class="sm-legend__range-item"
            >
              <span class="add-ellipsis">
                <i class="el-icon-caret-left"></i>
                {{item.start}}-{{item.end}}
              </span>
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
    <div
      v-else-if="mode === 'simple' || layerNames.length === 1"
      v-for="(layerValue,layerKey,index) in legendList"
      :key="index"
      class="sm-legend__noBorder"
    >
      <div
        v-if="isShowTitle"
        class="sm-legend__title"
        :style="[getColorStyle(0)]"
      >{{layerValue.layerId}}</div>
      <div
        v-if="isShowField"
        class="sm-legend__themefield add-ellipsis"
        :style="[getColorStyle(0)]"
      >{{$t("legend.themeField")}}:{{layerValue.themeField}}</div>

      <div v-if="layerValue.layerType === 'UNIQUE'">
        <ul class="sm-legend__point">
          <li v-for="(item,index) in layerValue.styleGroup" :key="index" class="sm-legend__item">
            <i :class="layerValue.featureType | selectLayerType" :style="{color:item.color}"></i>
            <span class="sm-legend__field-value">{{item.value}}</span>
          </li>
        </ul>
      </div>

      <div v-if="layerValue.layerType === 'HEAT'">
        <!-- <div
            class="sm-legend__themefield add-ellipsis"
        >{{$t("legend.themeField")}}：{{layerValue.themeField}}</div>-->
        <div
          class="sm-legend__heat"
          :style="{background:`linear-gradient(to top,${layerValue.styleGroup.join(',')})`}"
        >
          <span class="sm-legend__top">
            <i class="el-icon-caret-left"></i>
            {{$t("legend.top")}}
          </span>
          <span class="sm-legend__bottom">
            <i class="el-icon-caret-left"></i>
            {{$t("legend.bottom")}}
          </span>
        </div>
      </div>

      <div v-if="layerValue.layerType === 'RANGE'">
        <!-- <div
            class="sm-legend__themefield add-ellipsis"
        >{{$t("legend.themeField")}}:{{layerValue.themeField}}</div>-->
        <div class="sm-legend__range">
          <div
            v-for="(item,index) in layerValue.styleGroup"
            :key="index"
            :style="{background:item.color}"
            class="sm-legend__range-item"
          >
            <span class="add-ellipsis">
              <i class="el-icon-caret-left"></i>
              {{item.start}}-{{item.end}}
            </span>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</sm-card>
</template>

<script>
import Theme from "../mixin/Theme";
import Widget from "./Widget";
import LegendViewModel from "../../viewmodel/LegendViewModel";
export default {
  name: "SmLegend",
  mixins: [Theme],
  relativeMap:true,
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
    },
    layerNames: {
      type: Array,
      required: true
    },
    isShowTitle: {
      type: Boolean,
      default: false
    },
    isShowField: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      validator(mode) {
        return ["simple", "panel"].includes(mode);
      }
    }
  },
  data() {
    return {
      legendList: {},
      //控制第一个图例默认展开
      activeLegend: [1],

      themeStyle: {}
    };
  },
  methods: {},
  loaded() {
    //show用来控制图例列表的显示
    const legendViewModel = new LegendViewModel(this.webmap);

    this.layerNames.forEach(layer => {
      let style = legendViewModel.getStyle(layer);

      if (!style) {
        throw new Error(this.$t("legend.noMatchLayer"));
      }
      if (!this.legendList[layer]) {
        this.$set(this.legendList, layer, style);
      }
    });
  },
  filters: {
    selectLayerType(featureType) {
      return {
        POLYGON: "smwidgets-icons-polygon-layer",
        POINT: "smwidgets-icons-point-layer",
        LINE: "smwidgets-icons-line-layer"
      }[featureType];
    }
  },
  computed: {
    getTitleColor() {
      return { color: this["colorGroupsData"][1] };
    },
    noBorder() {
      if (this.mode === "simple") {
        return {
          "background": "transparent",
          "box-shadow": "none"
        };
      }
    }
  },
  extends: Widget
};
</script>


