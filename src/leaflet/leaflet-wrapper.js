import L from 'leaflet';

// @property lastId: Number
// Last unique ID used by [`stamp()`](#util-stamp)
var lastId = 0;

// @function stamp(obj: Object): Number
// Returns the unique ID of an object, assigning it one if it doesn't have it.
function stamp(obj) {
  /*eslint-disable */
  obj._leaflet_id = obj._leaflet_id || ++lastId;
  return obj._leaflet_id;
  /* eslint-enable */
}
L.Map.prototype.addLayer = function(layer, name) {
  if (!layer._layerAdd) {
    throw new Error('The provided object is not a Layer.');
  }
  var id = stamp(layer);
  // 如果layer已存在，返回this
  if (this._layers[id] || this._layers[name]) {
    return this;
  }
  // 如果用户没有传入name，就生成一个name
  if (!name) {
    name = 'sm-custom' + id;
  }
  // 如果该name已存在，就生成新的name
  if (this._layers[name]) {
    this.fire('addLayerFailed', 'layer name重复,请输入唯一的name');
    return this;
  }

  // 将layer和name添加到layersOnMap
  layer.name = name;
  // 不要将featureLayer加入layersOnMap
  // let _layersId = {};
  // for (let key in this._layers) {
  //   if (this._layers[key]._layers) {
  //     _layersId[key] = [];
  //     for (let key2 in this._layers[key]._layers) {
  //       _layersId[key].push(key2);
  //     }
  //   }
  // }
  // let layersOnMapFlag = true;
  // for (let key in _layersId) {
  //   if (_layersId[key].indexOf(id + '') > -1) {
  //     layersOnMapFlag = false;
  //   }
  // }
  if (!this.layersOnMap) {
    this.layersOnMap = [];
  }
  this.layersOnMap.push({ name, layer });
  // if (layersOnMapFlag) {
  //   this.layersOnMap.push({ name, layer });
  // }

  this._layers[id] = layer;
  layer._mapToAdd = this;
  if (layer.beforeAdd) {
    layer.beforeAdd(this);
  }
  this.whenReady(layer._layerAdd, layer);
  return this;
};
L.Map.prototype.removeLayer = function(layer, name) {
  // 重新构造layersOnMap
  this.layersOnMap = this.layersOnMap.filter(l => l.name !== (layer.name || name));
  // 如果是传入图层，就用图层id; 如果传入name,通过name去获取图层id
  var id = stamp(layer) || this._layers[name].id;

  if (!this._layers[id]) {
    return this;
  }

  if (this._loaded) {
    layer.onRemove(this);
  }

  if (layer.getAttribution && this.attributionControl) {
    this.attributionControl.removeAttribution(layer.getAttribution());
  }

  delete this._layers[id];

  if (this._loaded) {
    this.fire('layerremove', { layer, name });
    layer.fire('remove');
  }

  layer._map = layer._mapToAdd = null;

  return this;
};

L.Map.include({
  getLayersOnMap() {
    return this.layersOnMap;
  },
  getLayerById(id) {
    return this._layers[id];
  },
  getLayerByName(name) {
    for (let key in this._layers) {
      if (name === this._layers[key].name) {
        return this._layers[key];
      }
    }
  },
  getAllLayers() {
    return this._layers;
  }
});
export default L;
