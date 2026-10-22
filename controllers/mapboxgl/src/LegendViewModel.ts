import type mapboxglTypes from 'mapbox-gl';
import mapboxgl from 'mapbox-gl';
import WebMapViewModel from 'vue-iclient-controllers-mapboxgl/src/WebMapViewModel';

// 轮廓相关的图例样式字段。这些字段被数据驱动时，旧版 iClient 不会额外产出「面」的图例项，
// 导致「面 + 轮廓色/轮廓宽度专题图」的图例只剩下轮廓相关分组
const OUTLINE_STYLE_FIELDS = ['outlineColor', 'outlineWidth', 'outlineOpacity', 'outlineSymbolsContent'];

/**
 * @class LegendViewModel
 * @description Legend viewModel.
 * @param {Object} webmap - webmap实例对象。
 * @fires layersupdated - 图例信息更新
 * @extends mapboxgl.Evented
 */
class LegendViewModel extends mapboxgl.Evented {
  webmap: InstanceType<typeof WebMapViewModel>;
  updateFn: (e?: mapboxglTypes.MapMouseEvent) => void;

  _layersUpdatedHandler() {
    this.fire('layersupdated');
  }

  setMap(mapInfo) {
    const { webmap } = mapInfo;
    this.webmap = webmap;
    this.updateFn = this._layersUpdatedHandler.bind(this);
    this.webmap.on({
      layerupdatechanged: this.updateFn
    });
  }

  getStyle(layerName, webMapViewModel = this.webmap) {
    const appreciableLayers = webMapViewModel?.getAppreciableLayers() || [];
    const legendInfo = webMapViewModel?.getLegendInfo() || [];
    const styles = legendInfo.filter(info => {
      return (
        info.layerId === layerName &&
        info.styleGroup.length > 0 &&
        appreciableLayers.some(layer => layer.id === info.layerId && layer.visible)
      );
    });
    // 没有 styleField 的项就是「面」自身的图例项，已存在时无需再补
    if (!styles.length || styles.some(style => !style.styleField)) {
      return styles;
    }
    const fillStyle = this.getOutlineFillStyle(styles);
    return fillStyle ? [fillStyle, ...styles] : styles;
  }

  /**
   * 兼容旧版 iClient：当图例分组全部来自轮廓相关字段时，iClient 不会产出「面」的图例项，
   * 这里从已有分组上取出面底色/轮廓信息，补一条「面」的图例，保证「面 + 轮廓专题图」两者都显示
   */
  getOutlineFillStyle(styles) {
    const isOnlyOutlineDriven = styles.every(style => OUTLINE_STYLE_FIELDS.includes(style.styleField));
    if (!isOnlyOutlineDriven) {
      return null;
    }
    const matchGroup = styles
      .reduce((groups, style) => groups.concat(style.styleGroup || []), [])
      .find((item: any) => item && item.style && item.style.backgroundColor);
    if (!matchGroup) {
      return null;
    }
    const { style } = matchGroup;
    const first = styles[0];
    return {
      layerId: first.layerId,
      layerTitle: first.layerTitle,
      themeField: undefined,
      styleGroup: [
        {
          fieldValue: first.layerTitle || first.layerId,
          style: {
            type: style.type || 'style',
            shape: style.shape || 'RECTANGLE',
            backgroundColor: style.backgroundColor,
            opacity: style.opacity,
            outlineStyle: style.outlineStyle,
            outlineColor: style.outlineColor,
            outlineWidth: style.outlineWidth,
            width: style.width,
            height: style.height
          }
        }
      ]
    };
  }

  getLayerNamesFromWebmap(webMapViewModel = this.webmap) {
    const legendInfos = webMapViewModel?.getLegendInfos?.() || [];
    return legendInfos.filter(item => item.showLegend).map(info => info.id);
  }

  removed() {
    this.webmap.un({
      layerupdatechanged: this.updateFn
    });
  }
}
export default LegendViewModel;
