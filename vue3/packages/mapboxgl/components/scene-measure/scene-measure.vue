<template>
  <sm-collapse-card
    icon-class="sm-components-icon-measure"
    :icon-position="position"
    :header-name="t('sceneMeasure.measure')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-measure"
    ref="measureRef"
  >
    <sm-card class="sm-component-measure__a-card" :bordered="false">
      <div class="sm-component-measure__content">
        <div class="sm-component-measure__content-left">
          <span class="measure-title">{{ t('sceneMeasure.measureMode') }}</span>
        </div>
        <div class="sm-component-measure__content-right">
          <!-- 测量模式 -->
          <div class="row-item">
            <sm-select
              v-model:value="state.measureMode"
              :style="{ width: '100%' }"
              @change="update_mode"
            >
              <sm-select-option v-for="item in state.options" :key="item.value" :value="item.value">
                {{ item.label }}
              </sm-select-option>
            </sm-select>
          </div>
          <!-- 测量方式 - 距离、高度、面积 -->
          <div class="row-item">
            <div class="icon-measure">
              <span
                v-for="(line, index) in state.currentItemOption"
                :key="index"
                class="icon-span"
                :title="line.label"
                :class="line.isSelect ? 'selected-icon' : ''"
                @click="changleIconItem(line)"
              >
                <i class="iconfont iconSize" :class="line.iconName" style="margin-top: 0"></i>
              </span>
            </div>
          </div>
          <div class="measure-checkbox-group">
            <!-- 顶点捕捉 -->
            <div v-show="state.measureMode == 'Space'" class="btn-row-item">
              <sm-checkbox
                v-model:checked="state.pickPointEnabled"
                style="margin-bottom: 0.1rem"
                @change="openPickPoint"
              >
                {{ t('sceneMeasure.pickPoint') }}
              </sm-checkbox>
            </div>
            <!-- 等高线 -->
            <div v-show="state.currentItemIndex === 2">
              <div class="btn-row-item">
                <sm-checkbox
                  v-model:checked="state.isShowLine"
                  style="margin-bottom: 0.1rem"
                  @change="update_showDVH"
                >
                  {{ t('sceneMeasure.contour') }}
                </sm-checkbox>
              </div>
            </div>
          </div>
          <!-- 按钮 -->
          <div class="measure-btn-group btn-row-item">
            <sm-button
              class="ans-btn"
              :title="t('sceneMeasure.measureAction')"
              @click="StartMeasure"
            >
              {{ t('sceneMeasure.measureAction') }}
            </sm-button>
            <sm-button class="btn-secondary" @click="clear">
              {{ t('sceneMeasure.clear') }}
            </sm-button>
          </div>
        </div>
      </div>
    </sm-card>
  </sm-collapse-card>
</template>

<script setup lang="ts">
import { reactive, watch, useTemplateRef, onMounted, onBeforeUnmount } from 'vue'
import type { SceneMeasureProps } from './types'
import { useSceneGetter, useLocale } from '@supermapgis/common/hooks/index.common'
import { useSceneControl } from '@supermapgis/mapboxgl/hooks'
import SmCard from '@supermapgis/common/components/card/Card'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import SmSelect, { SmSelectOption } from '@supermapgis/common/components/select/Select'
import SmButton from '@supermapgis/common/components/button/Button'
import SmCheckbox from '@supermapgis/common/components/checkbox/Checkbox'
import { sceneMeasurePropsDefault } from './types'

defineOptions({
  name: 'SmSceneMeasure'
})

// Props
const props = withDefaults(defineProps<SceneMeasureProps>(), sceneMeasurePropsDefault)

const { t } = useLocale()
let viewer = null

const setViewer = (sceneViewer: any) => {
  viewer = sceneViewer
}
useSceneGetter({
  loaded: setViewer,
  removed: () => {}
})

const rootEl = useTemplateRef('measureRef')
useSceneControl(() => rootEl.value?.$el)

onMounted(() => {
  checkReady();
})

const state = reactive({
  measureMode: 'Space',
  clampMode: null,
  Ellipsoid: null,
  contourColor: '#ff7d00',
  isShowLine: true,
  pickPointEnabled: false,
  currentItemIndex: 1,
  options: [
    {
      label: t('sceneMeasure.mode_space'),
      value: 'Space'
    },
    {
      label: t('sceneMeasure.mode_ground'),
      value: 'Ground'
    },
    {
      label: 'CGCS2000',
      value: 'CGCS2000',
      chineseCoor: true
    },
    {
      label: 'XIAN80',
      value: 'XIAN80',
      chineseCoor: true
    },
    {
      label: 'WGS84',
      value: 'WGS84'
    },
    {
      label: t('sceneMeasure.mode_projection'),
      value: 'null'
    }
  ],
  itemOptions: {
    Space: [
      {
        id: 1,
        label: t('sceneMeasure.measureDistence'),
        iconName: 'sm-mapdashboard-icon-ceju',
        isSelect: true
      },
      {
        id: 2,
        label: t('sceneMeasure.measureHeight'),
        iconName: 'sm-mapdashboard-icon-cegao',
        isSelect: false
      },
      {
        id: 3,
        label: t('sceneMeasure.measureArea'),
        iconName: 'sm-mapdashboard-icon-cemian',
        isSelect: false
      }
    ],
    Ground: [
      {
        id: 1,
        label: t('sceneMeasure.measureDistence'),
        iconName: 'sm-mapdashboard-icon-yidijuli1',
        isSelect: true
      },
      {
        id: 2,
        label: t('sceneMeasure.measureHeight'),
        iconName: 'sm-mapdashboard-icon-cegao',
        isSelect: false
      },
      {
        id: 3,
        label: t('sceneMeasure.measureArea'),
        iconName: 'sm-mapdashboard-icon-yidimianji',
        isSelect: false
      }
    ],
    null: [
      {
        id: 1,
        label: t('sceneMeasure.measureDistence'),
        iconName: 'sm-mapdashboard-icon-yidijuli1',
        isSelect: true
      },
      {
        id: 2,
        label: t('sceneMeasure.measureHeight'),
        iconName: 'sm-mapdashboard-icon-cegao',
        isSelect: false
      },
      {
        id: 3,
        label: t('sceneMeasure.measureArea'),
        iconName: 'sm-mapdashboard-icon-touying',
        isSelect: false
      }
    ]
  },
  currentItemOption: [
    {
      id: 1,
      label: t('sceneMeasure.measureDistence'),
      iconName: 'sm-mapdashboard-icon-ceju',
      isSelect: true
    },
    {
      id: 2,
      label: t('sceneMeasure.measureHeight'),
      iconName: 'sm-mapdashboard-icon-cegao',
      isSelect: false
    },
    {
      id: 3,
      label: t('sceneMeasure.measureArea'),
      iconName: 'sm-mapdashboard-icon-cemian',
      isSelect: false
    }
  ]
})
let handlerDis = null
let handlerArea = null
let handlerHeight = null
let layers = null
let lineHeight = null
let setHypFlag = false
let isoline = null
let colorTable = null

watch(
  () => state.measureMode,
  (val) => {
    switch (val) {
      case 'Space':
        state.currentItemOption = state.itemOptions['Space'];
        break;
      case 'Ground':
        state.currentItemOption = state.itemOptions['Ground'];
        break;
      case 'null':
        state.currentItemOption = state.itemOptions['null'];
        break;
      default:
        state.currentItemOption = state.itemOptions['Space'];
        break;
    }
    updateIconItem();
  }
);

watch(
  () => props.sceneTarget,
  (val1, val2) => {
    if (val1 !== val2) {
      clear();
      if (isoline) {
        isoline.destroy();
      }
      initBaseSettings();
      init();
    }
  }
);

const checkReady = () => {
  if (window.SuperMap3D && viewer) {
    initBaseSettings();
    init();
  } else {
    setTimeout(checkReady, 100);
  }
};

// 初始化相关
const initBaseSettings = () => {
  state.clampMode = window.SuperMap3D.ClampMode.Space;
  layers = undefined;
  isoline = new window.SuperMap3D.HypsometricSetting();
  colorTable = new window.SuperMap3D.ColorTable();
  isoline.DisplayMode = window.SuperMap3D.HypsometricSettingEnum.DisplayMode.LINE;
  isoline._lineColor = window.SuperMap3D.Color.fromCssColorString(state.contourColor);
  isoline.ColorTable = colorTable;
  isoline.Opacity = 0.6;
  isoline.MaxVisibleValue = -100;
  isoline.MinVisibleValue = -100;
};

const init = () => {
  viewer.scene.pickPointInterval = 20;
  layers = viewer.scene.layers.layerQueue;
  viewer.scene.globe.HypsometricSetting = {
    hypsometricSetting: isoline,
    analysisMode: window.SuperMap3D.HypsometricSettingEnum.AnalysisRegionMode.ARM_ALL
  };

  handlerDis = new window.SuperMap3D.MeasureHandler(
    viewer,
    window.SuperMap3D.MeasureMode.Distance,
    state.clampMode
  );
  handlerArea = new window.SuperMap3D.MeasureHandler(
    viewer,
    window.SuperMap3D.MeasureMode.Area,
    state.clampMode
  );
  handlerHeight = new window.SuperMap3D.MeasureHandler(viewer, window.SuperMap3D.MeasureMode.DVH);

  handlerDis.activeEvt.addEventListener((isActive: boolean) => {
    if (isActive === true) {
      setMouseCursor('measureCur');
      viewer.scene.pickPointEnabled = state.pickPointEnabled;
    } else {
      setMouseCursor('normal');
      viewer.scene.pickPointEnabled = false;
    }
  });

  handlerDis.measureEvt.addEventListener((result: any) => {
    let dis = Number(result.distance);
    let mode = state.measureMode;
    if (mode === 'CGCS2000' || mode === 'XIAN80' || mode === 'WGS84') {
      dis = Number(calcClampDistance(result.positions));
    }
    let distance = dis > 1000 ? (dis / 1000).toFixed(2) + 'km' : dis.toFixed(2) + 'm';
    handlerDis.disLabel.text = t('sceneMeasure.distence_cl') + distance;
  });

  // 初始化测量面积
  handlerArea.activeEvt.addEventListener((isActive: boolean) => {
    if (isActive === true) {
      setMouseCursor('measureCur');
      viewer.scene.pickPointEnabled = state.pickPointEnabled;
    } else {
      setMouseCursor('normal');
      viewer.scene.pickPointEnabled = false;
    }
  });

  // 测量面积监听事件
  handlerArea.measureEvt.addEventListener((result: any) => {
    let mj = Number(result.area);
    let mode = state.measureMode;
    if (mode === 'CGCS2000' || mode === 'XIAN80' || mode === 'WGS84') {
      mj = Number(calcClampValue(result.positions));
    } else if (mode === '6') {
      mj = Number(calcAreaWithoutHeight(result.positions));
    }
    let area = mj > 1000000 ? (mj / 1000000).toFixed(2) + 'km²' : mj.toFixed(2) + '㎡';
    handlerArea.areaLabel.text = t('sceneMeasure.area') + area;
  });

  // 初始化测量高度
  handlerHeight.measureEvt.addEventListener((result: any) => {
    let distance = result.distance > 1000 ? (result.distance / 1000).toFixed(2) + 'km' : result.distance + 'm';
    let vHeight =
      result.verticalHeight > 1000 ? (result.verticalHeight / 1000).toFixed(2) + 'km' : result.verticalHeight + 'm';
    let hDistance =
      result.horizontalDistance > 1000
        ? (result.horizontalDistance / 1000).toFixed(2) + 'km'
        : result.horizontalDistance + 'm';
    handlerHeight.disLabel.text = t('sceneMeasure.spaceDistance') + distance;
    handlerHeight.vLabel.text = t('sceneMeasure.verticalHeight') + vHeight;
    handlerHeight.hLabel.text = t('sceneMeasure.horizontalDistance') + hDistance;
    // 实时等高线显示
    lineHeight = Number(result.endHeight);
    if (state.isShowLine) updateContourLine(lineHeight);
  });

  // 测量高度监听事件
  handlerHeight.activeEvt.addEventListener((isActive: boolean) => {
    if (isActive === true) {
      setMouseCursor('measureCur');
      viewer.scene.pickPointEnabled = state.pickPointEnabled;
    } else {
      setMouseCursor('normal');
      viewer.scene.pickPointEnabled = false;
    }
  });
};

// 椭球贴地距离
const calcClampDistance = (positions: any[]) => {
  let lonlat: number[] = [];
  for (let i = 0; i < positions.length; i++) {
    let cartographic = window.SuperMap3D.Cartographic.fromCartesian(positions[i]);
    let lon = window.SuperMap3D.Math.toDegrees(cartographic.longitude);
    let lat = window.SuperMap3D.Math.toDegrees(cartographic.latitude);
    lonlat.push(lon, lat);
  }
  let geometry = new window.SuperMap3D.PolylineGeometry({
    positions: window.SuperMap3D.Cartesian3.fromDegreesArray(lonlat)
  });
  return viewer.scene.globe.computeSurfaceDistance(geometry, state.Ellipsoid);
};

// 椭球贴地面积
const calcClampValue = (positions: any[]) => {
  let lonlat: number[] = [];
  for (let i = 0; i < positions.length; i++) {
    let cartographic = window.SuperMap3D.Cartographic.fromCartesian(positions[i]);
    let lon = window.SuperMap3D.Math.toDegrees(cartographic.longitude);
    let lat = window.SuperMap3D.Math.toDegrees(cartographic.latitude);
    lonlat.push(lon, lat);
  }
  let geometry = new window.SuperMap3D.PolygonGeometry.fromPositions({
    positions: window.SuperMap3D.Cartesian3.fromDegreesArray(lonlat)
  });
  return viewer.scene.globe.computeSurfaceArea(geometry, state.Ellipsoid);
};

// 投影面积
const calcAreaWithoutHeight = (positions: any[]) => {
  let totalLon = 0;
  for (let i = 0; i < positions.length; i++) {
    let cartographic = window.SuperMap3D.Cartographic.fromCartesian(positions[i]);
    let lon = window.SuperMap3D.Math.toDegrees(cartographic.longitude);
    totalLon += lon;
  }

  let dh = Math.round((totalLon / positions.length + 6) / 6); // 带号
  let centralMeridian = dh * 6 - 3;
  // 高斯投影
  let projection = new window.SuperMap3D.CustomProjection({
    name: 'tmerc',
    centralMeridian: centralMeridian,
    primeMeridian: 0,
    standardParallel_1: 0,
    standardParallel_2: 0,
    eastFalse: 500000.0,
    northFalse: 0.0,
    semimajorAxis: 6378137,
    inverseFlattening: 298.257222101
  });
  let cartesians: any[] = [];
  for (let i = 0; i < positions.length; i++) {
    let cartographic = window.SuperMap3D.Cartographic.fromCartesian(positions[i]);

    let cartesian = projection.project(cartographic);
    cartesians.push(cartesian);
  }

  cartesians.push(cartesians[0]); // 首尾相接
  let value = window.SuperMap3D.getPreciseArea(cartesians, 'China2000', centralMeridian, dh, 1);
  return value;
};

// 初始化设置图层等高线
const setHypsometricSetting = () => {
  if (!layers) return;
  for (let i = 0; i < layers.length; i++) {
    layers[i].hypsometricSetting = {
      hypsometricSetting: isoline,
      analysisMode: window.SuperMap3D.HypsometricSettingEnum.AnalysisRegionMode.ARM_ALL
    };
  }
  setHypFlag = true;
};

// 设置等值线
const updateContourLine = (height: number) => {
  if (!viewer.scene.globe.HypsometricSetting.hypsometricSetting) return;
  viewer.scene.globe.HypsometricSetting.hypsometricSetting.MaxVisibleValue = height;
  viewer.scene.globe.HypsometricSetting.hypsometricSetting.MinVisibleValue = height;
  if (!setHypFlag) return;
  for (let i = 0; i < (layers?.length || 0); i++) {
    if (layers[i].hypsometricSetting.hypsometricSetting) {
      layers[i].hypsometricSetting.hypsometricSetting.MaxVisibleValue = height;
      layers[i].hypsometricSetting.hypsometricSetting.MinVisibleValue = height;
    } else {
      setHypsometricSetting();
    }
  }
};

// UI相关
// 更新量算模式
const update_mode = (val: string) => {
  if (val === 'Space') {
    state.clampMode = window.SuperMap3D.ClampMode.Space;
    handlerArea.clampMode = window.SuperMap3D.ClampMode.Space;
    handlerDis.clampMode = window.SuperMap3D.ClampMode.Space;
  } else {
    state.pickPointEnabled = false;
    state.clampMode = window.SuperMap3D.ClampMode.Ground;
    handlerArea.clampMode = window.SuperMap3D.ClampMode.Ground;
    handlerDis.clampMode = window.SuperMap3D.ClampMode.Ground;
    if (val === 'XIAN80') {
      state.Ellipsoid = window.SuperMap3D.Ellipsoid.XIAN80;
    } else if (val === 'CGCS2000') {
      state.Ellipsoid = window.SuperMap3D.Ellipsoid.CGCS2000;
    } else if (val === 'WGS84') {
      state.Ellipsoid = window.SuperMap3D.Ellipsoid.WGS84;
    } else {
      state.Ellipsoid = null;
    }
  }
};

// 改变当前item索引
const changleIconItem = (item: any) => {
  state.currentItemIndex = item.id;
  for (let i = 0; i < state.currentItemOption.length; i++) {
    if (state.currentItemOption[i].id === item.id) {
      state.currentItemOption[i].isSelect = true;
    } else {
      state.currentItemOption[i].isSelect = false;
    }
  }
};

// 开启顶点捕捉
const openPickPoint = (e: any) => {
  const val = (e.target as HTMLInputElement).checked;
  state.pickPointEnabled = val;
  viewer.scene.pickPointEnabled = val;
  viewer.scene.pickPointInterval = 20;
};

// 开启等高线
const update_showDVH = (val: any) => {
  if (!val) {
    updateContourLine(-10000);
  } else {
    updateContourLine(lineHeight);
  }
};

const deactiveAll = () => {
  handlerDis && handlerDis.deactivate();
  handlerArea && handlerArea.deactivate();
  handlerHeight && handlerHeight.deactivate();
  state.Ellipsoid = null;
  lineHeight = -10000;
};

// 测量距离
const MeasureDistance = () => {
  deactiveAll();
  handlerDis && handlerDis.activate();
};

// 测量高度
const MeasureHeight = () => {
  !setHypFlag && setHypsometricSetting();
  clearLine();
  deactiveAll();
  handlerHeight && handlerHeight.activate();
};

// 测量面积
const MeasureArea = () => {
  deactiveAll();
  handlerArea && handlerArea.activate();
};

// 开始测量
const StartMeasure = () => {
  deactiveAll();
  switch (state.currentItemIndex) {
    case 1:
      MeasureDistance();
      break;
    case 2:
      MeasureHeight();
      break;
    case 3:
      MeasureArea();
      break;
    default:
      break;
  }
};

// 清除等值线
const clearLine = () => {
  updateContourLine(-10000);
};

// 清除
const clear = () => {
  removeMeasureCurClass();
  deactiveAll();
  if (handlerDis) handlerDis.clear();
  if (handlerArea) handlerArea.clear();
  if (handlerHeight) handlerHeight.clear();
  clearLine();
  viewer.scene.pickPointEnabled = false;
};

// 切换图标
const updateIconItem = () => {
  for (let i = 0; i < state.currentItemOption.length; i++) {
    if (state.currentItemOption[i].id === state.currentItemIndex) {
      state.currentItemOption[i].isSelect = true;
    } else {
      state.currentItemOption[i].isSelect = false;
    }
  }
};

const removeMeasureCurClass = () => {
  const divsWithMeasureCur = document.querySelectorAll('div.measureCur');
  divsWithMeasureCur.forEach((div) => {
    div.classList.remove('measureCur');
  });
};

const setMouseCursor = (type: string) => {
  if (!viewer) return;
  const targetDiv = document.getElementById(props.sceneTarget);
  if (type === 'normal') {
    viewer.enableCursorStyle = true;
    if (targetDiv) targetDiv.classList.remove('measureCur');
  } else if (type === 'measureCur') {
    viewer.enableCursorStyle = false;
    viewer._element.style.cursor = '';
    if (targetDiv) targetDiv.classList.add('measureCur');
  } else {
    viewer.enableCursorStyle = true;
    if (targetDiv) targetDiv.classList.remove('measureCur');
  }
};

onBeforeUnmount(() => {
  clear();
  if (isoline) {
    isoline.destroy();
  }
  layers = undefined;
});
</script>
