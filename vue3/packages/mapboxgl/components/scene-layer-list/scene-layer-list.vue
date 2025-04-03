<template>
  <sm-collapse-card
    icon-class="sm-components-icon-layer-list"
    :icon-position="position"
    :header-name="t('sceneLayerList.title')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-layer-list"
    ref="layerListRef"
  >
    <sm-card class="sm-component-layer-list__a-card" :bordered="false" :style="textColorHeadingStyle">
      <div class="sm-component-layer-list__content">
        <div>
          <sm-tree
            :class="['sm-component-layer-list__collapse', operations.draggable && 'draggable-tree']"
            blockNode
            :draggable="operations.draggable"
            :tree-data="treeData"
            @drop="dropHandler"
          >
            <template #switcherIcon><i class="sm-components-icon-right" /></template>
            <template #title="item">
              <div
                :class="{
                  'header-wrap': true,
                  'sm-component-layer-list__disabled': item.isLeaf && !item.visible
                }"
                :title="operations.draggable && item.disabled ? t('warning.treeDargTipImage') : item.title"
              >
                <div
                  class="header-text"
                  @mouseenter="() => changeIconsStatus(item.key)"
                  @mouseleave="() => changeIconsStatus('')"
                >
                  <span class="add-ellipsis">{{ item.title }}</span>
                  <div
                    v-if="item.isLeaf"
                    :class="[
                      'icon-buttons',
                      showIconsItem === item.key ? 'icon-buttons-visible' : 'icon-buttons-hidden'
                    ]"
                  >
                    <div v-if="operations.fitBounds && item.type !== 'terrain'" class="sm-component-layer-list__zoom">
                      <i
                        :class="[
                          'sm-components-icon-suofangzhituceng',
                          (item.visible || !item.disabled) && 'highlight-icon'
                        ]"
                        :style="!item.visible && { cursor: 'not-allowed' }"
                        :title="t('layerList.zoomToLayer')"
                        @click.stop="item.visible && zoomToBounds(item)"
                      />
                      
                    </div>
                    <div>
                      <i
                        :class="item.visible ? 'sm-components-icon-visible' : 'sm-components-icon-hidden'"
                        @click.stop="toggleItemVisibility(item)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </sm-tree>
        </div>
      </div>
    </sm-card>
  </sm-collapse-card>
</template>

<script setup lang="ts">
import { ref, computed, toRaw, useTemplateRef, onMounted, onBeforeUnmount, watch } from 'vue';
import type {
  SceneLayerListProps
} from './types'
import { useSceneGetter, useLocale, useTheme } from '@supermapgis/common/hooks/index.common'
import { useSceneControl } from '@supermapgis/mapboxgl/hooks'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import SmTree from '@supermapgis/common/components/tree/Tree'
import { sceneLayerListPropsDefault } from './types'
import { message } from 'ant-design-vue'
import sceneEvent from 'vue-iclient-core/types/scene-event';

// Props
const props = withDefaults(defineProps<SceneLayerListProps>(), sceneLayerListPropsDefault)

const { t } = useLocale()
const { textColorHeadingStyle } = useTheme(props)
const { viewer, layerTreeAlias } = useSceneGetter(props.sceneTarget);
const rootEl = useTemplateRef('layerListRef')

onMounted(() => {
  useSceneControl(rootEl.value.$el)
  sceneEvent.on({
    'update-layers': updateLayersListener
  });
})
onBeforeUnmount(() => {
  sceneEvent.un({
    'update-layers': updateLayersListener
  });
})

// Data
const showIconsItem = ref('');
const treeData = ref([]);
const onlineBaseLayerList = [
  {
    url: './images/baseMap/baseImage.jpg', // 影像服务链接
    name: 'LocalImage' // 国际化的名称
  },
  {
    url: '//dev.virtualearth.net/',
    name: 'BingMap'
  },
  {
    url: 'https://[subdomain].tianditu.gov.cn/img_w/wmts',
    name: 'TIANDITU'
  },
  {
    name: 'GRIDIMAGERY',
    thumbnail: './images/baseMap/grad.png'
  },
  {
    url: 'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    name: 'OSM'
  }
];
let currentTerrainProvider = null;

const layersCatalog = computed(() => {
  if (!viewer.value) {
    return null;
  }
  return {
    s3mLayer: viewer.value.scene.layers._layerQueue,
    imageryLayer: viewer.value.imageryLayers._layers,
    MVTLayer: viewer.value.scene._vectorTileMaps._layerQueue
  };
});

// Watchers
watch(() => layersCatalog, (val) => {
  if (val) {
    getTreeData();
  }
}, {deep: true});


// Methods
const getImageryLayerName = (imageryLayer) => {
  let imageUrl = imageryLayer._imageryProvider.url || imageryLayer._imageryProvider._url;
  if (!imageUrl) return t('sceneLayerList.lnglatMap');

  if (imageUrl.indexOf('earth-skin2.jpg') !== -1) {
    return t('sceneLayerList.defaultImage');
  }

  // 项目底图
  let targetItem = onlineBaseLayerList.find((item) => imageUrl.includes(item.url));
  if (targetItem) {
    return t('sceneLayerList.' + targetItem.name);
  }

  if (imageUrl && imageUrl.indexOf('realspace/datas/') !== -1) {
    let otherImageLayerName = imageUrl.split('realspace/datas/')[1].replace('/', '');
    return otherImageLayerName;
  }
  // 网络底图
  if (imageryLayer._imageryProvider.tablename) {
    let tableName = imageryLayer._imageryProvider.tablename;
    if (tableName.indexOf('http') === -1) {
      if (tableName.indexOf('/rest/maps/') !== -1) {
        let name = tableName.split('/rest/maps/')[1];
        if (name.indexOf('%') !== -1) {
          let str = decodeURIComponent(name);
          if (str.indexOf('@')) {
            let newName = str.split('@')[0];
            return newName;
          }
        } else {
          return name;
        }
      }
      if (tableName.indexOf('%') !== -1) {
        let newName = tableName.split('%')[0];
        return newName;
      }
      // 支持地图服务
      if (tableName.indexOf('/maps/') !== -1) {
        let newName = tableName.split('/maps/')[1].replace('/', '');
        return newName;
      }
      return tableName;
    } else {
      return 'Unnamed';
    }
  } else {
    return 'Unnamed';
  }
};

const getTerrainLayerName = () => {
  if (viewer.value.terrainProvider._baseUrl) {
    let baseUrl = viewer.value.terrainProvider._baseUrl;
    if (baseUrl.indexOf('3D-stk_terrain') !== -1) {
      return t('sceneLayerList.stkTerrain');
    } else {
      if (baseUrl.includes('info/data/path')) {
        // STK地形
        return baseUrl.split('/services/')[1].split('/rest/')[0];
      } else if (baseUrl.includes('/realspace/datas/')) {
        // 普通的TIN地形
        return baseUrl.split('/realspace/datas/')[1];
      } else if (baseUrl.indexOf('supermapol.com') !== -1) {
        // 之前遗留的
        return baseUrl.split('realspace/services/')[1].split('/rest/realspace')[0];
      } else if (baseUrl.indexOf('iserver/services') !== -1) {
        // 之前遗留的
        return baseUrl.split('iserver/services/')[1].split('/rest/realspace')[0];
      } else {
        return 'invisible';
      }
    }
  } else if (viewer.value.terrainProvider._urls) {
    let url0 = viewer.value.terrainProvider._urls[0];
    if (url0.indexOf('supermapol.com') !== -1) {
      return t('sceneLayerList.superMapTerrain');
    } else {
      return t('sceneLayerList.tiandituTerrain');
    }
  } else {
    return 'invisible';
  }
};

const toggleItemVisibility = (option) => {
  if (!option.key) return;
  let index = option.key.split('-')[1];
  switch (option.type) {
    case 's3m':
      viewer.value.scene.layers._layerQueue[index].visible = !option.visible;
      break;
    case 'imagery':
      viewer.value.imageryLayers._layers[index].show = !option.visible;
      break;
    case 'mvt':
      viewer.value.scene._vectorTileMaps._layerQueue[index].show = !option.visible;
      break;
    case 'terrain':
      if (!currentTerrainProvider) {
        currentTerrainProvider = viewer.value.terrainProvider;
        viewer.value.terrainProvider = new window.SuperMap3D.EllipsoidTerrainProvider();
      } else {
        viewer.value.terrainProvider = currentTerrainProvider;
        currentTerrainProvider = null;
      }
      break;
    default:
      break;
  }
  updateTreeDataVisivle(option);
};

const updateTreeDataVisivle = (item) => {
  const layerList = ['s3m', 'imagery', 'mvt', 'terrain'];
  const treeIndex = layerList.indexOf(item.type);
  const matchLayer = treeData.value[treeIndex].children.find((data) => data.key === item.key);
  matchLayer.visible = !item.visible;
};

const changeIconsStatus = (val) => {
  showIconsItem.value = val;
};

const zoomToBounds = (option) => {
  const rawViewer = toRaw(viewer.value);
  if (option.type === 's3m') {
    let s3mLayer = rawViewer.scene.layers.find(option.aliasKey);
    if (rawViewer.scene.mode === window.SuperMap3D.SceneMode.SCENE3D) {
      if (s3mLayer.lon && s3mLayer.lat) {
        // 一些特殊的坐标系，比如ISVJ-7839中的4508+平面场景，直接flyTo不行，这里参考IServer里面的预览，使用此种方式来定位
        rawViewer.scene.camera.setView({
          destination: new window.SuperMap3D.Cartesian3.fromDegrees(s3mLayer.lon, s3mLayer.lat, 500)
        });
      } else {
        rawViewer.flyTo(s3mLayer, { duration: 0 });
      }
    } else if (rawViewer.scene.mode === window.SuperMap3D.SceneMode.COLUMBUS_VIEW) {
      // 哥伦布视图下可能存在问题，比如ISVJ-7839中，用场景打开，定位就不对了
      if (s3mLayer.positionCartographic_for_colubus) {
        // 以场景形式打开时，会给图层绑定一个打开后的相机视图定位
        let positionCartographic = s3mLayer.positionCartographic_for_colubus;
        let longitude = Number(window.SuperMap3D.Math.toDegrees(positionCartographic.longitude));
        let latitude = Number(window.SuperMap3D.Math.toDegrees(positionCartographic.latitude));
        let height = Number(positionCartographic.height);
        rawViewer.scene.camera.setView({
          destination: new window.SuperMap3D.Cartesian3.fromDegrees(longitude, latitude, height)
        });
      } else if (s3mLayer.lon && s3mLayer.lat) {
        rawViewer.scene.camera.setView({
          destination: new window.SuperMap3D.Cartesian3.fromDegrees(s3mLayer.lon, s3mLayer.lat, 500)
        });
      } else {
        rawViewer.flyTo(s3mLayer, { duration: 0 });
      }
    } else {
      rawViewer.flyTo(s3mLayer, { duration: 0 });
    }
  } else if (option.type === 'mvt') {
    let index = String(option.key).split('-')[1];
    let mvtLayer = rawViewer.scene._vectorTileMaps._layerQueue[Number(index)];
    var bounds = mvtLayer.rectangle;
    rawViewer.scene.camera.flyTo({
      destination: new window.SuperMap3D.Cartesian3.fromRadians(
        (bounds.east + bounds.west) * 0.5,
        (bounds.north + bounds.south) * 0.5,
        10000
      ),
      duration: 1,
      orientation: {
        heading: 0,
        roll: 0
      }
    });
  } else if (option.type === 'imagery') {
    let index = String(option.key).split('-')[1];
    let imgLayer = rawViewer.imageryLayers._layers[Number(index)];
    console.log('viewer', viewer)
    console.log('imgLayer', imgLayer)

    if (!imgLayer.wmtsImageLayerPosition) {
      rawViewer.flyTo(imgLayer);
    } else {
      let wmtsImageLayerPosition = imgLayer.wmtsImageLayerPosition;
      rawViewer.scene.camera.flyTo({
        destination: new window.SuperMap3D.Cartesian3.fromDegrees(
          wmtsImageLayerPosition.lng,
          wmtsImageLayerPosition.lat,
          wmtsImageLayerPosition.height
        ),
        duration: 1,
        orientation: {
          heading: 0,
          roll: 0
        }
      });
    }
  }
};

const dropHandler = (info) => {
  const dropKey = info.node.eventKey;
  const dragKey = info.dragNode.eventKey;
  const dropLevel = dropKey.split('-')[0];
  const dropIndex = Number(dropKey.split('-')[1]);
  const dragLevel = dragKey.split('-')[0];
  const dragIndex = Number(dragKey.split('-')[1]);
  if (dropLevel !== dragLevel || (info.dropToGap && dropKey === '2')) {
    message.warn(t('warning.treeDargTipLevel'), 1);
    return;
  }
  changeLayerOrderByDrag(dragIndex, dropIndex);
};

const changeLayerOrderByDrag = (dragIndex, dropIndex) => {
  // 影像图层列表中index从下往上为：0 1 2 .. n,所以drag - target < 0，drag才是raise，反之则亦然
  let gap = dragIndex - dropIndex;
  let changeCount = Math.abs(gap);
  let dragImgLayer = viewer.value.imageryLayers._layers[dragIndex];
  if (gap > 0) {
    // 上 -> 下：lower
    for (let i = 0; i < changeCount; i++) {
      viewer.value.imageryLayers.lower(dragImgLayer);
    }
  } else if (gap < 0) {
    // 下 -> 上：raise
    for (let i = 0; i < changeCount; i++) {
      viewer.value.imageryLayers.raise(dragImgLayer);
    }
  } else {
    return;
  }
  getTreeData();
};

function updateLayersListener(e) {
  if (e.sceneTarget === props.sceneTarget) {
    getTreeData()
  }
}

function getTreeData() {
  const layers = layersCatalog.value;
  console.log('layers', layers);
  treeData.value = [
    {
      key: '1',
      title: t('sceneLayerList.s3mLayer'),
      isLeaf: false,
      disabled: true,
      children: []
    },
    {
      key: '2',
      title: t('sceneLayerList.imgLayer'),
      isLeaf: false,
      children: []
    },
    {
      key: '3',
      title: t('sceneLayerList.mvtLayer'),
      isLeaf: false,
      disabled: true,
      children: []
    },
    {
      key: '4',
      title: t('sceneLayerList.terrainLayer'),
      isLeaf: false,
      disabled: true,
      children: []
    }
  ];
  // S3M图层:
  layers.s3mLayer.forEach((layer, index) => {
    let title = checkLayerAlias(layer.name, 's3m');
    treeData.value[0].children.push({
      title,
      key: '1-' + String(index),
      aliasKey: layer.name,
      type: 's3m',
      visible: layer.visible,
      disabled: true
    });
  });
  // 影像图层:
  layers.imageryLayer.forEach((layer, index) => {
    let imageryLayerName = getImageryLayerName(layer);
    if (imageryLayerName === 'Unnamed') return;
    let title = checkLayerAlias(imageryLayerName, 'imagery');
    treeData.value[1].children.unshift({
      title,
      key: '2-' + String(index),
      aliasKey: imageryLayerName,
      type: 'imagery',
      visible: layer.show
    });
  });
  // MVT图层:
  layers.MVTLayer.forEach((layer, index) => {
    let title = checkLayerAlias(layer.name, 'mvt');
    treeData.value[2].children.push({
      title,
      key: '3-' + String(index),
      aliasKey: layer.name,
      type: 'mvt',
      visible: layer.show,
      disabled: true
    });
  });
  // 地形图层:
  let terrainLayerName = getTerrainLayerName();
  if (terrainLayerName !== 'invisible') {
    let title = checkLayerAlias(terrainLayerName, 'terrain');
    treeData.value[3].children.push({
      title,
      key: '4-0',
      type: 'terrain',
      visible: true,
      disabled: true
    });
  }
};

const checkLayerAlias = (name, type) => {
  let aliasResult;
  switch (type) {
    case 's3m':
      aliasResult = layerTreeAlias.value.s3mLayer[name];
      break;
    case 'imagery':
      aliasResult = layerTreeAlias.value.imgLayer[name];
      break;
    case 'mvt':
      aliasResult = layerTreeAlias.value.mvtLayer[name];
      break;
    case 'terrain':
      aliasResult = layerTreeAlias.value.terrainLayer[name];
      break;
    default:
      break;
  }
  return aliasResult !== undefined ? aliasResult : name;
}

</script>