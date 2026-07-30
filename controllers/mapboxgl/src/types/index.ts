import CircleStyle from 'vue-iclient-controllers-mapboxgl/src/types/CircleStyle';
import LineStyle from 'vue-iclient-controllers-mapboxgl/src/types/LineStyle';
import FillStyle from 'vue-iclient-controllers-mapboxgl/src/types/FillStyle';

/**
 * 点选/查询/属性表等高亮图层的默认样式。
 * 同时提供 strokeLine 与历史拼写 stokeLine，便于各组件兼容读取。
 */
export const getDefaultLayerStyle = (highligtColor = '#409eff') => {
  const strokeLine = new LineStyle({
    'line-width': 3,
    'line-color': highligtColor,
    'line-opacity': 1
  });
  return {
    line: new LineStyle({
      'line-width': 3,
      'line-color': highligtColor,
      'line-opacity': 1
    }),
    circle: new CircleStyle({
      'circle-color': highligtColor,
      'circle-opacity': 0.6,
      'circle-radius': 8,
      'circle-stroke-width': 2,
      'circle-stroke-color': highligtColor,
      'circle-stroke-opacity': 1
    }),
    fill: new FillStyle({
      'fill-color': highligtColor,
      'fill-opacity': 0.6,
      'fill-outline-color': highligtColor
    }),
    strokeLine,
    /** @deprecated 历史拼写，等同 strokeLine */
    stokeLine: strokeLine
  };
};
