import Vue from 'vue';
import {
  message,
  notification,
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
  TimePicker,
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
  VideoPlus,
  VideoPlusDraw,
  VideoPlusLayer,
  VideoPlusMarker,
  VideoPlusPopup
} from '@supermapgis/vue-iclient-mapboxgl';
import { setTheme } from '@supermapgis/vue-iclient-mapboxgl/lib/_utils/style/theme/set-theme'; // 需要引用具体的路径
import { locale } from '@supermapgis/vue-iclient-mapboxgl/lib/_lang'; // 需要引用具体的路径
import i18n from './lang';

setTheme('dark');
Vue.use(locale, { i18n });

Vue.use(Avatar);
Vue.use(Border);
Vue.use(Breadcrumb);
Vue.use(Button);
Vue.use(Card);
Vue.use(Checkbox);
Vue.use(Collapse);
Vue.use(CollapseCard);
Vue.use(ColorPicker);
Vue.use(DatePicker);
Vue.use(Dropdown);
Vue.use(Empty);
Vue.use(Icon);
Vue.use(Iframe);
Vue.use(Image);
Vue.use(Indicator);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(LayerSelect);
Vue.use(Layout);
Vue.use(LiquidFill);
Vue.use(Menu);
Vue.use(Modal);
Vue.use(Pagination);
Vue.use(Progress);
Vue.use(Radio);
Vue.use(Select);
Vue.use(Slider);
Vue.use(Slideshow);
Vue.use(Spin);
Vue.use(Steps);
Vue.use(Switch);
Vue.use(Table);
Vue.use(TablePopup);
Vue.use(Tabs);
Vue.use(Text);
Vue.use(TimeLine);
Vue.use(TimeRange);
Vue.use(TimeSlider);
Vue.use(TimeText);
Vue.use(TimePicker);
Vue.use(Tooltip);
Vue.use(Transfer);
Vue.use(Tree);
Vue.use(TreeSelect);
Vue.use(VideoPlayer);
Vue.use(Attributes);
Vue.use(Chart);
Vue.use(Compare);
Vue.use(NcpMap);
Vue.use(OpenFile);
Vue.use(Query);
Vue.use(Search);
Vue.use(TextList);
Vue.use(WebMap);
// 需要传入 Cesium 依赖
Vue.use(WebScene, {
  cesiumPath: './Build/Cesium/Cesium.js'
});
Vue.use(AnimateMarkerLayer);
Vue.use(ClusterLayer);
Vue.use(DataFlowLayer);
Vue.use(DeckglLayer);
Vue.use(EchartsLayer);
Vue.use(FireLayer);
Vue.use(GeojsonLayer);
Vue.use(GraphThemeLayer);
Vue.use(HeatmapLayer);
Vue.use(LabelThemeLayer);
Vue.use(MapvLayer);
Vue.use(RangeThemeLayer);
Vue.use(RanksymbolThemeLayer);
Vue.use(RasterTileLayer);
Vue.use(TrackLayer);
Vue.use(UniqueThemeLayer);
Vue.use(VectorTileLayer);
Vue.use(Compass);
Vue.use(CoordinateConversion);
Vue.use(Draw);
Vue.use(FlyTo);
Vue.use(Identify);
Vue.use(LayerColor);
Vue.use(LayerList);
Vue.use(LayerManager);
Vue.use(Legend);
Vue.use(Measure);
Vue.use(MiniMap);
Vue.use(Pan);
Vue.use(Scale);
Vue.use(Zoom);
Vue.use(TdtMapSwitcher);
Vue.use(TdtRoute);
Vue.use(TdtSearch);
Vue.use(VideoPlus);
Vue.use(VideoPlusDraw);
Vue.use(VideoPlusLayer);
Vue.use(VideoPlusMarker);
Vue.use(VideoPlusPopup);

Vue.prototype.$message = message;
Vue.prototype.$notification = notification;
Vue.prototype.$info = Modal.info;
Vue.prototype.$success = Modal.success;
Vue.prototype.$error = Modal.error;
Vue.prototype.$warning = Modal.warning;
Vue.prototype.$confirm = Modal.confirm;
Vue.prototype.$destroyAll = Modal.destroyAll;
