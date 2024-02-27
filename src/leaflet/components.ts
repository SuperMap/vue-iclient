import { registerProjection } from 'vue-iclient/src/common/_utils/epsg-define';
import { lang, setLocale, initi18n } from 'vue-iclient/src/common/_lang/index';
import * as commontypes from 'vue-iclient/src/leaflet/_types/index';
import { setTheme } from 'vue-iclient/src/common/_utils/style/theme/set-theme';

/** common */
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
import { default as TimePicker } from 'vue-iclient/src/common/time-picker/index.js';
import { default as Tooltip } from 'vue-iclient/src/common/tooltip/index.js';
import { default as Transfer } from 'vue-iclient/src/common/transfer/index.js';
import { default as Tree } from 'vue-iclient/src/common/tree/index.js';
import { default as TreeSelect } from 'vue-iclient/src/common/tree-select/index.js';
import { default as VideoPlayer } from 'vue-iclient/src/common/video-player/index.js';

/** layer */
import { default as TileLayer } from 'vue-iclient/src/leaflet/web-map/layer/tile/index.js';

import { default as Chart } from 'vue-iclient/src/leaflet/chart/index.js';
import { default as Identify } from 'vue-iclient/src/leaflet/identify/index.js';
import { default as Marker } from 'vue-iclient/src/leaflet/marker/index.js';
import { default as Popup } from 'vue-iclient/src/leaflet/popup/index.js';
import { default as WebMap } from 'vue-iclient/src/leaflet/web-map/index.js';

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
  TimePicker,
  Tooltip,
  Transfer,
  Tree,
  TreeSelect,
  VideoPlayer,
  Chart,
  Identify,
  Marker,
  Popup,
  WebMap,
  TileLayer
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
  for (let component in components) {
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
  initi18n,
  registerProjection,
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
  Chart,
  Identify,
  Marker,
  Popup,
  WebMap,
  TileLayer
};
export default {
  setTheme,
  commontypes,
  lang,
  locale: setLocale,
  install
};
