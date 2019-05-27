import WidgetViewModel from '../../../_types/WidgetViewModel';
import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import length from '@turf/length';
import area from '@turf/area';
import center from '@turf/center';
import { convertLength, convertArea } from '@turf/helpers';
import formatterUtil from '../../../_utils/formatter';
import i18n from '../../../../common/_lang';

/**
 * @class MeasureViewModel
 * @description 量算 viewModel.
 * @param {Object} webmap - webmap实例对象。
 * @extends WidgetViewModel
 */
class MeasureViewModel extends WidgetViewModel {
  constructor(options) {
    super();
    this.tipNodes = []; // 收集测算长度实时生成的popup，以方便后面销毁
    this.cacheLengthUnitList = []; // 缓存量算长度每个节点的值跟单位，在修改单位时使用
    this.cachePolygonUnit = {};
    this.mode = null;
    this.result = '';
    this.activeMode = '';
    this.map = options.map;
    this._addDrawControl();
    this.isEditing = true;
  }

  // 开启绘制
  openDraw(mode, activeUnit) {
    this._initDraw();
    this._resetEvent();
    this.mode = mode;
    this.activeMode = mode;
    this.activeUnit = activeUnit;
    this.isEditing = true;
    // 绘画线或面
    this.draw.changeMode(mode);
    this.measureNodeDistanceBind = this._measureNodeDistance.bind(this);
    this.map.on('mousedown', this.measureNodeDistanceBind);
  }

  closeDraw() {
    this.isEditing = false;
    this.ids = null;
    this._initDraw();
    this._resetEvent();
    this.activeMode = null;
    this.draw.trash();
    this.map.off('mousedown', this.continueDrawBind);
  }

  updateUnit(unit) {
    if (this.tipNodes.length !== 0) {
      for (let i = 1; i < this.tipNodes.length; i++) {
        let transValue = convertLength(
          this.cacheLengthUnitList[i - 1].value,
          this.cacheLengthUnitList[i - 1].unit,
          unit
        );
        transValue = this._getFormatResult(transValue);
        this.cacheLengthUnitList[i - 1].value = transValue;
        this.cacheLengthUnitList[i - 1].unit = unit;
        if (this.activeMode === 'draw_line_string') {
          let uniti18n = i18n.t(`measure.${unit}`);
          this.tipNodes[i] && this.tipNodes[i].setText(`${transValue} ${uniti18n}`);
        }
      }
      this.result && (this.result = convertLength(this.result, this.activeUnit, unit));
    } else if (this.cachePolygonUnit.value && this.cachePolygonUnit.unit) {
      let transValue = convertArea(this.cachePolygonUnit.value, this.cachePolygonUnit.unit, unit);
      let uniti18n = i18n.t(`measure.square${unit}`);
      this.tipHoverDiv && this.tipHoverDiv.setText(`${transValue} ${uniti18n}`);
      this.result && (this.result = convertArea(this.result, this.activeUnit, unit));
    }

    this.result && this.fire('update-unit', { result: this._getFormatResult(this.result) });
    this.activeUnit = unit;
  }

  _addDrawControl() {
    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
        trash: false
      },
      styles: [
        // line stroke
        {
          id: 'gl-draw-line',
          type: 'line',
          filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#D20C0C',
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        },
        // polygon fill
        {
          id: 'gl-draw-polygon-fill',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: {
            'fill-color': '#D20C0C',
            'fill-outline-color': '#D20C0C',
            'fill-opacity': 0.1
          }
        },
        // polygon outline stroke
        // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
        {
          id: 'gl-draw-polygon-stroke-active',
          type: 'line',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#D20C0C',
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        },
        // vertex point halos
        {
          id: 'gl-draw-polygon-and-line-vertex-halo-active',
          type: 'circle',
          filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
          paint: {
            'circle-radius': 5,
            'circle-color': '#FFF'
          }
        },
        // vertex points
        {
          id: 'gl-draw-polygon-and-line-vertex-active',
          type: 'circle',
          filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
          paint: {
            'circle-radius': 3,
            'circle-color': '#D20C0C'
          }
        },
        // INACTIVE (static, already drawn)
        // line stroke
        {
          id: 'gl-draw-line-static',
          type: 'line',
          filter: ['all', ['==', '$type', 'LineString'], ['==', 'mode', 'static']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#000',
            'line-width': 3
          }
        },
        // polygon fill
        {
          id: 'gl-draw-polygon-fill-static',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
          paint: {
            'fill-color': '#000',
            'fill-outline-color': '#000',
            'fill-opacity': 0.1
          }
        },
        // polygon outline
        {
          id: 'gl-draw-polygon-stroke-static',
          type: 'line',
          filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#000',
            'line-width': 3
          }
        }
      ]
    });
    this.map.addLayer(this.draw);
    this.map.on('draw.create', this._finishDraw.bind(this));
    this.map.on('draw.modechange', this._resetDraw.bind(this));
  }

  _resetDraw(e) {
    if (this.isEditing) {
      this.map.off('mousemove', this.popupFollowMouseBind);
      this.ids = this.draw.getSelectedIds();
      this.draw.changeMode(this.mode);
      this.continueDrawBind = this._continueDraw.bind(this);
      this.map.on('mousedown', this.continueDrawBind);
      this.measureNodeDistanceBind = this._measureNodeDistance.bind(this);
      this.map.on('mousedown', this.measureNodeDistanceBind);
      this.fire('measure-finished', { result: this._getFormatResult(this.result) });
    }
  }

  _initDraw() {
    // 根据ids只删除上一次量算的数据
    this.ids ? this.draw.delete(this.ids) : this.draw.deleteAll();
    this.measureNodes = []; // 收集测算长度生成每个点的feature数据, 方便后面计算总长度
    this.tipNodes.length && this.tipNodes.map(tipNode => tipNode.remove());
    this.tipNodes = [];
    this.cacheLengthUnitList = [];
    this.result = 0;
    this.fire('measure-start', { result: this._getFormatResult(this.result) });
  }

  _continueDraw(e) {
    this._initDraw();
    this._resetEvent(false);

    this.map.off('mousedown', this.continueDrawBind);
  }

  // 绘画结束后计算最后的结果
  _finishDraw(e) {
    this.time = null;
    this.map.off('mousedown', this.measureNodeDistanceBind);
    switch (this.activeMode) {
      case 'draw_line_string':
        let tempLength = length(e.features[0], 'kilometers');
        this.result = convertLength(tempLength, 'kilometers', this.activeUnit);
        this._resetEvent();
        break;
      case 'draw_polygon':
        let tempArea = area(e.features[0]);
        this.result = convertArea(tempArea, 'meters', this.activeUnit);
        this._resetEvent(true, false, this.result, e.features[0]);
        break;
    }
    this.fire('measure-finished', { result: this._getFormatResult(this.result) });
  }

  // 绘画每个点显示tip，同时监听鼠标move事件
  _measureNodeDistance(e) {
    const {
      lngLat: { lng, lat }
    } = e;
    const to = [lng, lat];

    if (this.isOpenMoveEvent) {
      this.popupFollowMouseBind = this._popupFollowMouse.bind(this);
      this.map.on('mousemove', this.popupFollowMouseBind);
      this.isOpenMoveEvent = false;
    }
    this.measureNodes.push(to);
    if (this.activeMode === 'draw_line_string') {
      this._renderPopupTip(e);
    }
    const { features } = this.draw.getAll();
    if (!features.length) {
      this._resetEvent();
      this.activeMode = null;
    }
  }

  _popupFollowMouse(e) {
    const {
      // point,
      // originalEvent,
      lngLat: { lng, lat }
    } = e;
    const lastPointPos = [lng, lat];
    let popup = this.tipHoverDiv;
    // 实时显示popup只需要一个，如果没有再生成新popup
    if (!popup) {
      popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });
    }
    popup.setLngLat(lastPointPos);
    let measureNodeList = [].concat(this.measureNodes, [lastPointPos]);
    let feature = {
      type: 'Feature',
      geometry: {
        type: `${this.activeMode === 'draw_line_string' ? 'LineString' : 'Polygon'}`,
        coordinates: this.activeMode === 'draw_line_string' ? measureNodeList : [measureNodeList]
      }
    };
    switch (this.activeMode) {
      case 'draw_line_string':
        let tempLength = length(feature, 'kilometers');
        this.result = convertLength(tempLength, 'kilometers', this.activeUnit);
        break;
      case 'draw_polygon':
        let tempArea = area(feature);
        this.result = convertArea(tempArea, 'meters', this.activeUnit);
        break;
    }
    let uniti18n;
    if (this.activeMode === 'draw_line_string') {
      uniti18n = i18n.t(`measure.${this.activeUnit}`);
    } else if (this.activeMode === 'draw_polygon') {
      uniti18n = i18n.t(`measure.square${this.activeUnit}`);
    }
    popup.setText(`${this._getFormatResult(this.result)} ${uniti18n}`);
    popup.addTo(this.map);
    this.cachePolygonUnit['value'] = this.result;
    this.cachePolygonUnit['unit'] = this.activeUnit;
    this.tipHoverDiv = popup;
  }

  _renderPopupTip(e) {
    const {
      // point,
      // originalEvent,
      lngLat: { lng, lat }
    } = e;
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });
    popup.setLngLat([lng, lat]);
    if (this.measureNodes.length > 1) {
      let line = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: this.measureNodes
        }
      };
      // 修改单位！！！！
      let tempLength = length(line, 'kilometers');
      let calcValue = convertLength(tempLength, 'kilometers', this.activeUnit);

      let uniti18n;
      if (this.activeMode === 'draw_line_string') {
        uniti18n = i18n.t(`measure.${this.activeUnit}`);
      } else if (this.activeMode === 'draw_polygon') {
        uniti18n = i18n.t(`measure.square${this.activeUnit}`);
      }
      let renderText = `${this._getFormatResult(calcValue)} ${uniti18n}`;

      this.cacheLengthUnitList.push({ value: this._getFormatResult(calcValue), unit: this.activeUnit });
      popup.setText(renderText);
    } else {
      popup.setText('起点');
    }
    popup && popup.addTo(this.map);

    this.tipNodes.push(popup);
  }

  _resetEvent(isOffEvent = true, isResetHoverTip = true, result, feature) {
    this.isOpenMoveEvent = true;
    this.map.off('mousemove', this.popupFollowMouseBind);
    isOffEvent && this.map.off('mousedown', this.measureNodeDistanceBind);
    if (isResetHoverTip) {
      // 如果是测量长度，销毁实时计算生成的popup
      this.tipHoverDiv && this.tipHoverDiv.remove();
      this.tipHoverDiv = null;
    } else {
      // 如果是测量面积，直接利用实时计算生成的popup显示最后结果
      const centerResult = center(feature);
      let uniti18n = i18n.t(`measure.square${this.activeUnit}`);
      result = this._getFormatResult(result);
      this.tipHoverDiv.setLngLat(centerResult.geometry.coordinates).setText(`${result} ${uniti18n}`);
    }
  }

  _getFormatResult(result) {
    return formatterUtil.reservedDecimal(result || this.result, 4);
  }
}
export default MeasureViewModel;
