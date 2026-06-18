import AddressMatchParameter from 'vue-iclient/src/common/_types/AddressMatchParameter';
import iPortalDataParameter from 'vue-iclient/src/common/_types/iPortalDataParameter';
import RestDataParameter from 'vue-iclient/src/common/_types/RestDataParameter';
import RestMapParameter from 'vue-iclient/src/common/_types/RestMapParameter';
import iServerDataParameter from 'vue-iclient/src/common/_types/iServerDataParameter';
import iServerMapParameter from 'vue-iclient/src/common/_types/iServerMapParameter';
import RestParameter from 'vue-iclient/src/common/_types/RestParameter';
import GeoJSONParameter from 'vue-iclient/src/common/_types/GeoJSONParamter';
import CircleStyle from 'vue-iclient/src/mapboxgl/_types/CircleStyle';
import FillStyle from 'vue-iclient/src/mapboxgl/_types/FillStyle';
import LineStyle from 'vue-iclient/src/mapboxgl/_types/LineStyle';
import HeatMapStyle from 'vue-iclient/src/mapboxgl/_types/HeatMapStyle';
import SymbolStyle from 'vue-iclient/src/mapboxgl/_types/SymbolStyle';

export { AddressMatchParameter };
export { iPortalDataParameter };
export { RestDataParameter };
export { RestMapParameter };
export { iServerDataParameter };
export { iServerMapParameter };
export { RestParameter };
export { GeoJSONParameter };
export { CircleStyle };
export { FillStyle };
export { LineStyle };
export { HeatMapStyle };
export { SymbolStyle };

export const getDefaultLayerStyle = (highligtColor = '#409eff') => ({
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
  strokeLine: new LineStyle({
    'line-width': 3,
    'line-color': highligtColor,
    'line-opacity': 1
  })
});
