import SourceModel from 'vue-iclient/src/mapboxgl/web-map/SourceModel';
import LayerModel from 'vue-iclient/src/mapboxgl/web-map/LayerModel';

class SourceListModel {
  constructor(options) {
    this.map = options.map;
    this.layers = options.layers || [];
    this.appendLayers = options.appendLayers || false;
    this.excludeSourceNames = ['tdt-search-', 'tdt-route-', 'smmeasure', 'mapbox-gl-draw'];
  }

  getLayers() {
    const detailLayers = this._initLayers();
    return this._initAppreciableLayers(detailLayers);
  }

  getSourceList() {
    const detailLayers = this._initLayers();
    return this._initSource(detailLayers);
  }

  _initLayers() {
    const layersOnMap = this.map.getStyle().layers.map(layer => this.map.getLayer(layer.id));
    const overlayLayers = Object.values(this.map.overlayLayersManager).reduce((layers, overlayLayer) => {
      if (overlayLayer.id && !layers.some(item => item.id === overlayLayer.id)) {
        let visibility = overlayLayer.visibility;
        if (!visibility && 'visible' in overlayLayer) {
          visibility = overlayLayer.visible ? 'visible' : 'none';
        }
        let source = overlayLayer.source || overlayLayer.sourceId;
        if (typeof source === 'object') {
          source = overlayLayer.id;
        }
        layers.push({
          id: overlayLayer.id,
          visibility,
          source,
          type: overlayLayer.type
        });
      }
      return layers;
    }, []);
    const renderLayers = layersOnMap
      .concat(overlayLayers)
      .filter(layer => !this.appendLayers || this.layers.some(item => layer.id === item.id));
    return renderLayers.filter(layer => !this.excludeSourceNames.includes(layer.source));
  }

  _initSource(detailLayers) {
    const datas = detailLayers.reduce((sourceList, layer) => {
      let matchItem = sourceList.find(item => item.renderSource.id === layer.source);
      if (!matchItem) {
        const sourceListItem = new SourceModel(this._createCommonFields(layer, 'source'));
        sourceList.push(sourceListItem);
        matchItem = sourceListItem;
      }
      matchItem.addLayer(new LayerModel(layer));
      return sourceList;
    }, []);
    this._updateGroupVisible(datas);
    return datas;
  }

  _initAppreciableLayers(detailLayers) {
    // dv 没有关联一个可感知图层对应对个渲染图层的关系，默认相同source的layer就是渲染图层
    return detailLayers.reduce((layers, layer) => {
      let matchLayer = layers.find(
        item =>
          item.renderSource.id === layer.source &&
          (!item.renderSource.sourceLayer || item.renderSource.sourceLayer === layer.sourceLayer)
      );
      if (!matchLayer) {
        matchLayer = this._createCommonFields(layer, 'layer');
        layers.push(matchLayer);
      }
      matchLayer.renderLayers.push(layer.id);
      return layers;
    }, []);
  }

  _createCommonFields(layer, category) {
    const layerInfo = this.layers.find(layerItem => layer.id === layerItem.id) || {};
    const {
      dataSource,
      themeSetting = {},
      name = layer.id,
      visible = layer.visibility ? layer.visibility === 'visible' : true,
      serverId
    } = layerInfo;
    const sourceOnMap = this.map.getSource(layer.source);
    const fields = {
      id: layer.source,
      title: name,
      type: layer.type,
      visible,
      renderSource: {
        id: layer.source,
        type: sourceOnMap && sourceOnMap.type
      },
      renderLayers: [],
      dataSource: dataSource || (serverId ? { serverId } : {}),
      themeSetting
    };
    if (category === 'layer' && layer.sourceLayer) {
      fields.renderSource.sourceLayer = layer.sourceLayer;
    }
    return fields;
  }

  _updateGroupVisible(sourceListDatas) {
    for (const sourceData of sourceListDatas) {
      if (sourceData.type === 'group') {
        sourceData.visible = sourceData.children.every(item => item.visible);
      }
    }
  }
}
export default SourceListModel;
