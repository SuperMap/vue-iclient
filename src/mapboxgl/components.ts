import { registerProjection } from 'vue-iclient/src/common/_utils/epsg-define';
import { lang, setLocale, initi18n } from 'vue-iclient/src/common/_lang/index';
import * as commontypes from 'vue-iclient/src/mapboxgl/_types/index';
import * as utils from 'vue-iclient/src/mapboxgl/_utils/index';
import { setTheme } from 'vue-iclient/src/common/_utils/style/theme/set-theme';

import { default as Avatar } from 'vue-iclient/src/common/avatar/index.js';
import { default as Border } from 'vue-iclient/src/common/border/index.js';
import { default as Breadcrumb } from 'vue-iclient/src/common/breadcrumb/index.js';
import { default as Button } from 'vue-iclient/src/common/button/index.js';
import { default as Card } from 'vue-iclient/src/common/card/index.js';
import { default as Checkbox } from 'vue-iclient/src/common/checkbox/index.js';
import { default as Collapse } from 'vue-iclient/src/common/collapse/index.js';
import { default as CollapseCard } from 'vue-iclient/src/common/collapse-card/index.js';
import { default as ColorPicker } from 'vue-iclient/src/common/color-picker/index.js';
import { default as DatePicker } from 'vue-iclient/src/common/date-picker/index.js';
import { default as Dropdown } from 'vue-iclient/src/common/dropdown/index.js';
import { default as Empty } from 'vue-iclient/src/common/empty/index.js';
import { default as Icon } from 'vue-iclient/src/common/icon/index.js';
import { default as Iframe } from 'vue-iclient/src/common/iframe/index.js';
import { default as Image } from 'vue-iclient/src/common/image/index.js';
import { default as Indicator } from 'vue-iclient/src/common/indicator/index.js';
import { default as Input } from 'vue-iclient/src/common/input/index.js';
import { default as InputNumber } from 'vue-iclient/src/common/input-number/index.js';
import { default as LayerSelect } from 'vue-iclient/src/common/layer-select/index.js';
import { default as Layout } from 'vue-iclient/src/common/layout/index.js';
import { default as LiquidFill } from 'vue-iclient/src/common/liquid-fill/index.js';
import { default as Menu } from 'vue-iclient/src/common/menu/index.js';
import { default as Message } from 'vue-iclient/src/common/message/index.js';
import { default as Modal } from 'vue-iclient/src/common/modal/index.js';
import { default as Notification } from 'vue-iclient/src/common/notification/index.js';
import { default as Pagination } from 'vue-iclient/src/common/pagination/index.js';
import { default as Progress } from 'vue-iclient/src/common/progress/index.js';
import { default as Radio } from 'vue-iclient/src/common/radio/index.js';
import { default as Select } from 'vue-iclient/src/common/select/index.js';
import { default as Slider } from 'vue-iclient/src/common/slider/index.js';
import { default as Slideshow } from 'vue-iclient/src/common/slideshow/index.js';
import { default as Spin } from 'vue-iclient/src/common/spin/index.js';
import { default as Steps } from 'vue-iclient/src/common/steps/index.js';
import { default as Switch } from 'vue-iclient/src/common/switch/index.js';
import { default as Table } from 'vue-iclient/src/common/table/index.js';
import { default as TablePopup } from 'vue-iclient/src/common/table-popup/index.js';
import { default as Tabs } from 'vue-iclient/src/common/tabs/index.js';
import { default as Text } from 'vue-iclient/src/common/text/index.js';
import { default as TimeLine } from 'vue-iclient/src/common/time-line/index.js';
import { default as TimeRange } from 'vue-iclient/src/common/time-range/index.js';
import { default as TimeSlider } from 'vue-iclient/src/common/time-slider/index.js';
import { default as TimeText } from 'vue-iclient/src/common/time-text/index.js';
import { default as Tooltip } from 'vue-iclient/src/common/tooltip/index.js';
import { default as Transfer } from 'vue-iclient/src/common/transfer/index.js';
import { default as Tree } from 'vue-iclient/src/common/tree/index.js';
import { default as TreeSelect } from 'vue-iclient/src/common/tree-select/index.js';
import { default as VideoPlayer } from 'vue-iclient/src/common/video-player/index.js';

/** layer */
import { default as AnimateMarkerLayer } from 'vue-iclient/src/mapboxgl/web-map/layer/animate-marker/index.js';
import { default as ClusterLayer } from 'vue-iclient/src/mapboxgl/web-map/layer/cluster/index.js';
import { default as DataFlowLayer } from 'vue-iclient/src/mapboxgl/web-map/layer/data-flow/index.js';
import { default as DeckglLayer } from 'vue-iclient/src/mapboxgl/web-map/layer/deckgl/index.js';
import { default as EchartsLayer } from 'vue-iclient/src/mapboxgl/web-map/layer/echarts/index.js';
import { default as FireLayer } from 'vue-iclient/src/mapboxgl/web-map/layer/fire/index.js';
import { default as GeojsonLayer } from 'vue-iclient/src/mapboxgl/web-map/layer/geojson/index.js';
import { default as GraphThemeLayer } from 'vue-iclient/src/mapboxgl/web-map/layer/graph-theme/index.js';
import { default as HeatmapLayer } from 'vue-iclient/src/mapboxgl/web-map/layer/heatmap/index.js';
import { default as LabelThemeLayer } from 'vue-iclient/src/mapboxgl/web-map/layer/label-theme/index.js';
import { default as MapvLayer } from 'vue-iclient/src/mapboxgl/web-map/layer/mapv/index.js';
import { default as RangeThemeLayer } from 'vue-iclient/src/mapboxgl/web-map/layer/range-theme/index.js';
import { default as RanksymbolThemeLayer } from 'vue-iclient/src/mapboxgl/web-map/layer/ranksymbol-theme/index.js';
import { default as RasterTileLayer } from 'vue-iclient/src/mapboxgl/web-map/layer/raster-tile/index.js';
import { default as TrackLayer } from 'vue-iclient/src/mapboxgl/web-map/layer/track/index.js';
import { default as UniqueThemeLayer } from 'vue-iclient/src/mapboxgl/web-map/layer/unique-theme/index.js';
import { default as VectorTileLayer } from 'vue-iclient/src/mapboxgl/web-map/layer/vector-tile/index.js';

/** control */
import { default as Compass } from 'vue-iclient/src/mapboxgl/web-map/control/compass/index.js';
import { default as CoordinateConversion } from 'vue-iclient/src/mapboxgl/web-map/control/coordinate-conversion/index.js';
import { default as Draw } from 'vue-iclient/src/mapboxgl/web-map/control/draw/index.js';
import { default as FlyTo } from 'vue-iclient/src/mapboxgl/web-map/control/fly-to/index.js';
import { default as Identify } from 'vue-iclient/src/mapboxgl/web-map/control/identify/index.js';
import { default as LayerColor } from 'vue-iclient/src/mapboxgl/web-map/control/layer-color/index.js';
import { default as LayerList } from 'vue-iclient/src/mapboxgl/web-map/control/layer-list/index.js';
import { default as LayerManager } from 'vue-iclient/src/mapboxgl/web-map/control/layer-manager/index.js';
import { default as Legend } from 'vue-iclient/src/mapboxgl/web-map/control/legend/index.js';
import { default as Measure } from 'vue-iclient/src/mapboxgl/web-map/control/measure/index.js';
import { default as MiniMap } from 'vue-iclient/src/mapboxgl/web-map/control/mini-map/index.js';
import { default as Pan } from 'vue-iclient/src/mapboxgl/web-map/control/pan/index.js';
import { default as Scale } from 'vue-iclient/src/mapboxgl/web-map/control/scale/index.js';
import { default as Zoom } from 'vue-iclient/src/mapboxgl/web-map/control/zoom/index.js';

import { default as TdtMapSwitcher } from 'vue-iclient/src/mapboxgl/tdt/map-switcher/index.js';
import { default as TdtRoute } from 'vue-iclient/src/mapboxgl/tdt/route/index.js';
import { default as TdtSearch } from 'vue-iclient/src/mapboxgl/tdt/search/index.js';

import { default as Attributes } from 'vue-iclient/src/mapboxgl/attributes/index.js';
import { default as Chart } from 'vue-iclient/src/mapboxgl/chart/index.js';
import { default as Compare } from 'vue-iclient/src/mapboxgl/compare/index.js';
import { default as NcpMap } from 'vue-iclient/src/mapboxgl/ncp-map/index.js';
import { default as OpenFile } from 'vue-iclient/src/mapboxgl/open-file/index.js';
import { default as Query } from 'vue-iclient/src/mapboxgl/query/index.js';
import { default as Search } from 'vue-iclient/src/mapboxgl/search/index.js';
import { default as TextList } from 'vue-iclient/src/mapboxgl/text-list/index.js';
import { default as WebMap } from 'vue-iclient/src/mapboxgl/web-map/index.js';
import { default as WebScene } from 'vue-iclient/src/mapboxgl/web-scene/index.js';
import { default as VideoMap } from 'vue-iclient/src/mapboxgl/video-map/index.js';
import { default as VideoMapGeojsonLayer } from 'vue-iclient/src/mapboxgl/video-map/layer/geojson/index.js';
import { default as VideoMapDraw } from 'vue-iclient/src/mapboxgl/video-map/control/draw/index.js';
import { default as VideoMapPopup } from 'vue-iclient/src/mapboxgl/video-map/ui/popup/index.js';
import { default as VideoMapMarker } from 'vue-iclient/src/mapboxgl/video-map/ui/marker/index.js';

const components = {
  Avatar,
  Border,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Collapse,
  CollapseCard,
  ColorPicker,
  DatePicker,
  Dropdown,
  Empty,
  Icon,
  Iframe,
  Image,
  Indicator,
  Input,
  InputNumber,
  LayerSelect,
  Layout,
  LiquidFill,
  Menu,
  Message,
  Modal,
  Notification,
  Pagination,
  Progress,
  Radio,
  Select,
  Slider,
  Slideshow,
  Spin,
  Steps,
  Switch,
  Table,
  TablePopup,
  Tabs,
  Text,
  TimeLine,
  TimeRange,
  TimeSlider,
  TimeText,
  Tooltip,
  Transfer,
  Tree,
  TreeSelect,
  VideoPlayer,
  Attributes,
  Chart,
  Compare,
  NcpMap,
  OpenFile,
  Query,
  Search,
  TextList,
  WebMap,
  WebScene,
  AnimateMarkerLayer,
  ClusterLayer,
  DataFlowLayer,
  DeckglLayer,
  EchartsLayer,
  FireLayer,
  GeojsonLayer,
  GraphThemeLayer,
  HeatmapLayer,
  LabelThemeLayer,
  MapvLayer,
  RangeThemeLayer,
  RanksymbolThemeLayer,
  RasterTileLayer,
  TrackLayer,
  UniqueThemeLayer,
  VectorTileLayer,
  Compass,
  CoordinateConversion,
  Draw,
  FlyTo,
  Identify,
  LayerColor,
  LayerList,
  LayerManager,
  Legend,
  Measure,
  MiniMap,
  Pan,
  Scale,
  Zoom,
  TdtMapSwitcher,
  TdtRoute,
  TdtSearch,
  VideoMap,
  VideoMapGeojsonLayer,
  VideoMapDraw,
  VideoMapPopup,
  VideoMapMarker
};

const install = function (Vue, opts: any = {}) {
  Vue.prototype.$message = components.Message;
  Vue.prototype.$notification = components.Notification;
  Vue.prototype.$info = (components.Modal as any).info;
  Vue.prototype.$success = (components.Modal as any).success;
  Vue.prototype.$error = (components.Modal as any).error;
  Vue.prototype.$warning = (components.Modal as any).warning;
  Vue.prototype.$confirm = (components.Modal as any).confirm;
  Vue.prototype.$destroyAll = (components.Modal as any).destroyAll;
  for (const component in components) {
    if (!['Notification', 'Message'].includes(component)) {
      const com = components[component];
      Vue.use(com, opts);
    }
  }
};
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue, {
    theme: 'light'
  });
}
export {
  setTheme,
  commontypes,
  lang,
  registerProjection,
  initi18n,
  Message as message,
  Notification as notification,
  Avatar,
  Border,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Collapse,
  CollapseCard,
  ColorPicker,
  DatePicker,
  Dropdown,
  Empty,
  Icon,
  Iframe,
  Image,
  Indicator,
  Input,
  InputNumber,
  LayerSelect,
  Layout,
  LiquidFill,
  Menu,
  Modal,
  Pagination,
  Progress,
  Radio,
  Select,
  Slider,
  Slideshow,
  Spin,
  Steps,
  Switch,
  Table,
  TablePopup,
  Tabs,
  Text,
  TimeLine,
  TimeRange,
  TimeSlider,
  TimeText,
  Tooltip,
  Transfer,
  Tree,
  TreeSelect,
  VideoPlayer,
  Attributes,
  Chart,
  Compare,
  NcpMap,
  OpenFile,
  Query,
  Search,
  TextList,
  WebMap,
  WebScene,
  AnimateMarkerLayer,
  ClusterLayer,
  DataFlowLayer,
  DeckglLayer,
  EchartsLayer,
  FireLayer,
  GeojsonLayer,
  GraphThemeLayer,
  HeatmapLayer,
  LabelThemeLayer,
  MapvLayer,
  RangeThemeLayer,
  RanksymbolThemeLayer,
  RasterTileLayer,
  TrackLayer,
  UniqueThemeLayer,
  VectorTileLayer,
  Compass,
  CoordinateConversion,
  Draw,
  FlyTo,
  Identify,
  LayerColor,
  LayerList,
  LayerManager,
  Legend,
  Measure,
  MiniMap,
  Pan,
  Scale,
  Zoom,
  TdtMapSwitcher,
  TdtRoute,
  TdtSearch,
  VideoMap,
  VideoMapGeojsonLayer,
  VideoMapDraw,
  VideoMapPopup,
  VideoMapMarker
};

export default {
  setTheme,
  commontypes,
  utils,
  lang,
  locale: setLocale,
  registerProjection,
  install
};
