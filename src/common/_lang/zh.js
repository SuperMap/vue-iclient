export default {
  dateTimeFormat: {
    date: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    date_second: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    },
    date_second_week: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    }
  },
  // messageTemplate
  warning: {
    unsupportedVideoAddress: '视频地址不合法',
    unavailableVideo: '此视频暂无法播放，请稍后再试',
    mapNotLoaded: '关联的地图尚未加载完整，请稍后',
    unassociatedMap: '您需要配置关联地图！'
  },
  success: {},
  info: {
    loading: '加载中',
    pressEscToExit: '按下 ESC 键或点击关闭按钮退出'
  },
  unit: {
    kilometers: '千米',
    miles: '英里',
    meters: '米',
    yards: '码',
    feet: '英尺',
    squarekilometers: '平方千米',
    squaremiles: '平方英里',
    squaremeters: '平方米',
    squareyards: '平方码',
    squarefeet: '平方英尺'
  },
  error: {},
  commontypes: {
    restData: 'SuperMap Rest 数据服务',
    restMap: 'SuperMap Rest 地图服务',
    addressMatch: 'SuperMap 地址匹配服务',
    iportalData: 'SuperMap iPortal 数据',
    onlineLocalSearch: 'SuperMap Online 本地搜索'
  },
  // 微件
  timeText: {
    Year: '年',
    Month: '月',
    Day: '日',
    hour: '时',
    minute: '分',
    second: '秒'
  },
  zoom: {},
  chart: {},
  layerList: {
    title: '图层'
  },
  miniMap: {},
  pan: {},
  scale: {},
  webmap: {
    loadingTip: '地图加载中...'
  },
  legend: {
    themeField: '专题字段',
    title: '图例',
    top: '最高',
    bottom: '最低',
    noMatchLayer: '没有匹配的图层'
  },
  measure: {
    mapMeasure: '量算',
    measureResult: '测量结果',
    distance: '距离',
    area: '面积',
    delete: '清空',
    selectPlaceholder: '请选择',
    startingPoint: '起点'
  },
  map: {},
  search: {
    noResult: '查询结果为空！',
    noKey: '搜索关键字不能为空，请输入搜索条件。',
    inputPlaceHolder: '查找地址或地点',
    attribute: '属性',
    attributeValue: '属性值',
    setSearchSource: '请设置搜索源！',
    address: '地址',
    null: '空'
  },
  query: {
    query: '查询',
    queryJob: '任务',
    queryReuslt: '结果',
    attributeCondition: '属性条件',
    spatialFilter: '空间过滤器',
    mapBounds: '返回地图全图范围的要素',
    currentMapBounds: '返回当前地图范围内的要素',
    applicate: '应用',
    noResult: '无结果',
    resultAlreadyExists: '当前查询结果已经存在!',
    querying: '查询中',
    attribute: '属性',
    attributeValue: '属性值',
    noResults: '查询结果为空！',
    queryFailed: '查询失败!',
    seviceNotSupport: '此服务不支持查询！'
  },
  openFile: {
    fileSizeExceeded: '文件大小超限！文件大小不得超过 10M！',
    fileTypeUnsupported: '不支持该文件格式！',
    openFileFail: '打开文件失败！',
    openFileSuccess: '打开文件成功!',
    selectFile: '选择文件',
    openEmptyFile: '打开文件为空！',
    openFile: '打开文件'
  },
  draw: {
    draw: '绘制'
  },
  indicator: {
    title: '指标标题',
    unit: '单位'
  },
  tdtRoute: {
    title: '路线'
  },
  // layer
  dataFlow: {
    dataSubscriptionFailed: '数据订阅失败！'
  }
};
