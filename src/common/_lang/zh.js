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
    unassociatedMap: '您需要配置关联地图！',
    videojs: '请引入video.js插件: https://github.com/videojs/video.js； 当播放rtmp时，安装flash相关插件：https://github.com/videojs/videojs-flash',
    flvPlayer: '请引入flv相关插件: https://github.com/bilibili/flv.js, https://github.com/mister-ben/videojs-flvjs'
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
  // 组件
  timeText: {
    Year: '年',
    Month: '月',
    Day: '日',
    hour: '时',
    minute: '分',
    second: '秒'
  },
  zoom: {},
  chart: {
    unSupportedData: '当前数据不支持与地图联动'
  },
  layerList: {
    title: '图层'
  },
  miniMap: {},
  pan: {},
  scale: {},
  webmap: {
    loadingTip: '地图加载中...',
    crsNotSupport: '不支持当前地图的坐标系！',
    TileMatrixSetNotSuppport: '不支持传入的 TileMatrixSet！',
    getLayerInfoFailed: '获取图层信息失败！',
    getThemeInfoFailed: '获取图层样式信息失败！',
    crsnotsupport: '不支持的坐标系！',
    baiduMapNotSupport: '暂不支持加载百度地图！',
    sampleDataNotSupport: '暂不支持加载示例数据！',
    mvtNotSupport: '暂不支持加载矢量瓦片图层！'
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
    measureResult: '测量结果：',
    distance: '距离',
    area: '面积',
    delete: '清空',
    selectPlaceholder: '请选择',
    startingPoint: '起点'
  },
  search: {
    noResult: '查询结果为空！',
    noKey: '搜索关键字不能为空，请输入搜索条件。',
    inputPlaceHolder: '查找地址或地点',
    attribute: '属性',
    attributeValue: '属性值',
    setSearchSource: '请设置搜索源！',
    address: '地址',
    null: '空',
    illegalFeature: '要素必须包含合法的坐标！'
  },
  query: {
    query: '查询',
    queryJob: '任务',
    queryResult: '结果',
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
  identify: {
    layerNotExit: "地图上不存在该图层: '{layer}'",
    noData: '无数据'
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
  layerManager: {
    title: '图层管理'
  },
  tdtResults: {
    on: '在',
    station: '站',
    total: '共',
    about: '约',
    // pagination
    homePage: '首页',
    prevPage: '上一页',
    nextPage: '下一页',
    // nothingResult
    searchNoResult: '没有查询到相关结果',
    youCanTry: '您可以尝试',
    enterCorrect: '检查输入是否正确',
    enterOtherKeyWords: '输入其他关键字进行搜索',
    onTdtMap: '在天地图上',
    addThisAddress: '添加该地点',
    uWantTo: '您是否要找',
    // pointResults
    totalFind: '共找到',
    piecesResults: '条结果',
    phone: '电话',
    address: '地址',
    setStartPonint: '设为起点',
    setEndPonint: '设为终点',
    // routePlan
    totalMiles: '总里程',
    distance: '约{distance}公里',
    showDetails: '显示全部详情',
    switchTimes: '换乘{switchTimes}次',
    noSwitch: '无换乘',
    walk: '步行至',
    getOff: '下车',
    getOn: '上车',
    take: '乘坐',
    noSearchResults: '没有查询到线路信息',
    fastRoute: '最快线路',
    shortRoute: '最短线路',
    walkRoute: '少走高速',
    fast: '较快捷',
    noSubway: '不坐地铁',
    lessSwitch: '少换乘',
    lessWalk: '少步行',
    // staticResult
    cityHadResults: '以下城市有结果，请您选择',
    moreCity: '更多城市',
    // LineResult
    allFound: '共为您找到',
    piecesBusRoute: '条公交线路',
    showDetail: '展开详情',
    busEndTime: '首末车时间',
    relateAdress: '点击此处查看 "{keyWord}" 的相关地点',
    // areaResult
    switchTo: '已切换到'
  },
  tdtRoute: {
    title: '路线',
    pleaseEnterStartPoint: '请输入起点',
    pleaseEnterEndPoint: '请输入终点',
    search: '搜索',
    startPoint: '起点',
    endPoint: '终点',
    mapLoadedFiled: '地图加载失败',
    busEndTime: '首末车时间',
    about: '约',
    station: '站',
    total: '共',
    hour: '小时',
    minutes: '分钟'
  },
  tdtSearch: {
    phone: '电话',
    address: '地址',
    noData: '暂无',
    transport: '交通'
  },
  tdtMapSwitcher: {
    title: '地图切换',
    image: '影像',
    vector: '矢量',
    terrain: '地形',
    placeName: '地名',
    TiandituVec: '天地图矢量底图',
    TiandituTer: '天地图地形底图',
    TiandituImg: '天地图影像底图',
    TiandituCva: '天地图矢量注记',
    TiandituCta: '天地图地形注记',
    TiandituCia: '天地图影像注记'
  },
  // layer
  dataFlow: {
    dataSubscriptionFailed: '数据订阅失败！'
  },
  animateMarkerlayer: {
    unsupportedData: '当前图层不支持该数据，请重新传入数据！'
  }
};
