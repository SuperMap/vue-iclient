export default {
  name: 'zh-cn',
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
    unsupportedPosterAddress: '封面地址不合法',
    unavailableVideo: '此视频暂无法播放，请稍后再试',
    mapNotLoaded: '关联的地图尚未加载完整，请稍后',
    unassociatedMap: '您需要配置关联地图！',
    unassociatedMapCannotCheck: '您需要先配置关联地图，才能勾选。',
    directoryTreeBrowseOnlyWithoutMap: '未关联地图，当前只能浏览不能勾选。',
    directoryTreeUnsupportedResourceType: '当前资源类型不支持勾选。',
    directoryTreeUnsupportedServiceType: '当前服务类型不支持勾选。',
    directoryTreeServiceUnavailable: '当前服务不可用，无法勾选。',
    directoryTreeMissingProjection: '当前资源缺少坐标系信息，无法勾选。',
    directoryTreeCrsMismatch: '当前资源坐标系与关联地图不匹配，无法勾选。',
    directoryTreeCsvExcelMissingCoordinateFields: '当前 CSV/Excel 数据缺少坐标字段，无法勾选。',
    directoryTreeCsvExcelMissingProjection:
      '当前 CSV/Excel 坐标数据无法判断为 EPSG:4326，无法勾选。',
    directoryTreeCsvExcelUnsupportedProjection: '当前 CSV/Excel 坐标系不是 EPSG:4326，无法勾选。',
    directoryTreeUnsupportedTileMatrixSet: '当前 WMTS 图层没有匹配当前地图的切片矩阵集，无法勾选。',
    directoryTreeLoadFailed: '当前资源加载失败，请稍后重试。',
    sceneDataMissingCoordinates: '当前数据缺少坐标信息，无法在场景中展示。',
    videojs: '请引入video.js插件: https://github.com/videojs/video.js',
    flvPlayer:
      '请引入flv相关插件: https://github.com/bilibili/flv.js, https://github.com/mister-ben/videojs-flvjs',
    treeDargTipLevel: '请在同级目录下拖拽',
    treeDargTipImage: '仅支持影像图层调整顺序'
  },
  success: {
    copySucccess: '复制成功'
  },
  info: {
    loading: '加载中',
    directoryTreeValidating: '校验中',
    directoryTreeChecking: '添加中',
    directoryTreeUnchecking: '移除中',
    directoryTreeBatchCheckingProgress: '正在添加 {completed}/{total}',
    directoryTreeBatchUncheckingProgress: '正在移除 {completed}/{total}',
    directoryTreeOperationActionCheck: '添加',
    directoryTreeOperationActionUncheck: '移除',
    directoryTreeOperationSuccessSummary: '{action}完成，成功 {successCount} 个资源。',
    directoryTreeOperationPartialSummary:
      '{action}完成，成功 {successCount} 个资源，失败 {failureCount} 个。',
    pressEscToExit: '按下 ESC 键或点击关闭按钮退出',
    pressEscOrClickToExit: '按下 ESC 键或点击任意位置退出'
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
    squarefeet: '平方英尺',
    XY: '经纬度',
    BASEMAP: '底图',
    UTM: 'UTM',
    DD: '度',
    DOM: '度分',
    DMS: '度分秒',
    Mercator: 'Web墨卡托'
  },
  error: {
    loadError: '加载失败'
  },
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
    title: '图层',
    layerStyle: '图层样式',
    attributes: '属性表',
    zoomToLayer: '缩放至图层',
    opacity: '不透明度'
  },
  sceneLayerList: {
    title: '图层',
    s3mLayer: 'S3M图层',
    imgLayer: '影像图层',
    mvtLayer: 'MVT图层',
    entityLayer: '矢量图层',
    terrainLayer: '地形图层',
    lnglatMap: '经纬底图',
    defaultImage: '默认影像',
    stkTerrain: 'STK地形',
    superMapTerrain: '超图在线地形',
    tiandituTerrain: '天地图地形',
    LocalImage: '本地图片',
    BingMap: '必应底图',
    TIANDITU: '天地图',
    OSM: 'OSM底图',
    GRIDIMAGERY: '经纬底图'
  },
  sceneLayerManager: {
    title: '图层管理',
    layerControl: '图层控制',
    searchPlaceholder: '搜索图层',
    clear: '清空',
    sceneNotReady: '场景尚未就绪',
    emptyConfig: '暂无图层配置',
    noSearchResult: '无匹配图层',
    locate: '定位',
    loadFailed: '图层加载失败',
    operationFailed: '操作失败，请稍后重试',
    alpha: '透明度',
    contrast: '对比度',
    brightness: '亮度',
    saturation: '饱和度',
    bottomAltitudeOffset: '底部高程偏移'
  },
  slideshow: {
    title: '幻灯片'
  },
  layerColor: {
    title: '图层颜色',
    layer: '图层',
    property: '属性',
    color: '颜色',
    reset: '重置',
    select: '选取',
    deselect: '取消',
    circleColor: '点颜色',
    strokeColor: '轮廓颜色',
    lineColor: '线颜色',
    fillColor: '面颜色',
    iconColor: '图标颜色',
    textColor: '文本颜色',
    capture: '捕获'
  },
  attributes: {
    title: '属性表',
    feature: '要素',
    selected: '已选择',
    clearSelected: '清除选中',
    zoomToFeatures: '缩放至已选要素',
    columnsControl: '显示/隐藏列',
    refreshData: '刷新数据',
    search: '搜索',
    reset: '重置'
  },
  miniMap: {},
  pan: {},
  scale: {},
  webmap: {
    loadingTip: '地图加载中...',
    crsNotSupport: '不支持当前地图的坐标系！',
    TileMatrixSetNotSuppport: '不支持传入的 TileMatrixSet！',
    getLayerInfoFailed: '图层加载失败！',
    getThemeInfoFailed: '获取图层样式信息失败！',
    crsnotsupport: '不支持的坐标系！',
    baiduMapNotSupport: '暂不支持加载百度地图！',
    layerorsourcenameduplicated: '图层名或数据源名重复无法添加',
    sampleDataNotSupport: '暂不支持加载示例数据！',
    drillLayersNotSupport: '暂不支持加载下钻图层！',
    mvtNotSupport: '暂不支持加载矢量瓦片图层！',
    mapCreatedFailed: '地图加载失败！',
    projectionnotmatch: '{title}与当前地图投影不匹配！',
    xyztilelayernotsupport: '{title}瓦片图层与当前地图的分辨率或原点不匹配！'
  },
  videoPlus: {
    loadingTip: '视频加载中...'
  },
  drillMap: {
    goBack: '返回'
  },
  legend: {
    themeField: '专题字段',
    title: '图例',
    top: '最高',
    bottom: '最低',
    noMatchLayer: '没有匹配的图层',
    themeDefault: '缺省风格',
    outOfRange: '范围以外的值',
    style: '样式',
    color: '颜色',
    size: '大小',
    opacity: '不透明度',
    width: '宽度',
    outlineColor: '轮廓色',
    haloColor: '晕轮颜色',
    label: '标签',
    parentheses: '（{tips}）',
    colon: '：'
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
    queryLayer: '查询图层',
    queryMode: '查询方式',
    queryBounds: '查询空间范围',
    sqlExpression: 'SQL表达式',
    keywordQuery: '关键字查询',
    attributeCondition: '查询条件',
    keyQueryCondition: '查询关键字',
    spatialFilter: '空间过滤器',
    mapBounds: '全图范围',
    currentMapBounds: '当前地图范围',
    applicate: '查询',
    noResult: '无结果',
    resultAlreadyExists: '当前查询结果已经存在!',
    querying: '查询中',
    querySuccess: '查询成功!',
    attribute: '属性',
    attributeValue: '属性值',
    noResults: '查询结果为空！',
    queryFailed: '查询失败!',
    seviceNotSupport: '此服务不支持查询！',
    sqlExpressionInvalid: 'SQL表达式格式有误',
    keyQueryPlaceholder: '请输入关查询键字',
    sqlQueryPlaceholder: '请输入SQL表达式',
    resultCount: '共 {count} 个结果'
  },
  identify: {
    layerNotExit: "地图上不存在该图层: '{layer}'",
    noData: '无数据'
  },
  popup: {
    selectLayer: '选择图层',
    noData: '暂无数据'
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
  fillExtrusion: {
    title: '三维拉伸',
    polygonLayer: '面图层',
    height: '高度（米）',
    heightValue: '高度值',
    fieldName: '字段名',
    customFieldPlaceholder: '填写字段名称',
    customNum: '自定义',
    multiple: '倍数',
    fillColor: '填充颜色',
    layerOpacity: '透明度',
    hideOriginalLayer: '隐藏原图层',
    reset: '重置'
  },
  flyTo: {
    title: '飞行定位'
  },
  sceneFullscreen: {
    title: '全屏'
  },
  sceneMapSwitch: {
    title: '底图切换',
    original: '原始底图',
    annotation: '地名标注',
    terrain: '地形服务'
  },
  sceneSplitScreen: {
    title: '数据分屏',
    modeLabel: '分屏模式：',
    layerVisibilityLabel: '图层视口可见性：',
    loading: '加载中...',
    modeNone: '无分屏',
    modeHorizontal: '水平分屏',
    modeVertical: '垂直分屏',
    modeQuad: '四视口',
    modeTriple: '三视口',
    modeVerticalTrisection: '水平三视口',
    viewport1: '视口一',
    viewport2: '视口二',
    viewport3: '视口三',
    viewport4: '视口四'
  },
  sceneSunlightAnalysis: {
    title: '日照分析',
    date: '日期',
    startTime: '开始时间',
    endTime: '结束时间',
    displayMode: '显示模式',
    sunshine: '日照',
    shadow: '阴影',
    sunshineColor: '日照颜色',
    shadowColor: '阴影颜色',
    rainbow: '渐变彩虹',
    blueWhiteRed: '渐变蓝白红',
    thermal: '渐变热力',
    maxDistance: '最远距离',
    meter: '米',
    selectColorTable: '选择色带',
    analysis: '分析',
    clear: '清除'
  },
  sceneRollerShutter: {
    title: '卷帘',
    notReady: '场景还未加载完成',
    modeLabel: '卷帘模式：',
    displayLabel: '显示范围：',
    displayAll: '全部显示',
    displayNone: '全部隐藏',
    modeNone: '不使用卷帘',
    modeHorizontal: '左右卷帘',
    modeVertical: '上下卷帘',
    noLayers: '当前场景未发现可控制图层',
    s3mLayers: 'S3M图层',
    imageryLayers: '影像图层',
    left: '左',
    right: '右',
    top: '上',
    bottom: '下',
    layer: '图层',
    imageryLayer: '影像图层'
  },
  sceneSkylineAnalysis: {
    title: '天际线分析',
    displayMode: '显示模式',
    lineDisplay: '线显示',
    faceDisplay: '面显示',
    bodyDisplay: '体显示',
    analysisRadius: '分析半径',
    meter: '米',
    lineWidth: '线宽度',
    skylineColor: '天际线颜色',
    skylineBodyColor: '天际体颜色',
    highlightObstacles: '高亮障碍物',
    display2D: '二维天际线展示',
    globeNoAnalysis: '地表不参与分析',
    analysis: '分析',
    drawViewPoint: '绘制观察点',
    limitBody: '限高体',
    clear: '清除'
  },
  sceneOpennessAnalysis: {
    title: '开敞度分析',
    analysisRadius: '分析半径',
    startAngle: '起始角度',
    endAngle: '结束角度',
    visibleAreaColor: '可见区域颜色',
    hiddenAreaColor: '不可见区域颜色',
    displayMode: '显示模式',
    visiblePart: '可见部分',
    hiddenPart: '不可见部分',
    showAll: '全部显示',
    isClosed: '闭合分析区域',
    analysis: '分析',
    clear: '清除'
  },
  sceneSightlineAnalysis: {
    title: '通视分析',
    viewShed: '可视域',
    sightline: '通视线',
    sightNetwork: '通视网络',
    direction: '方向',
    pitch: '俯仰角',
    distance: '距离',
    offsetHeight: '附加高度',
    horizontalFov: '水平视场角',
    verticalFov: '垂直视场角',
    lineWidth: '线宽',
    visibleAreaColor: '可见区域颜色',
    hiddenAreaColor: '不可见区域颜色',
    selectViewPoint: '选择观察点',
    selectTargetPoint: '选择目标点',
    clear: '清除'
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
    relateAdress: "点击此处查看 '{keyWord}' 的相关地点",
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
  coordinateConversion: {
    inputPlaceHolder: '请输入坐标',
    copy: '复制',
    location: '定位至',
    capture: '捕捉',
    realTime: '实时',
    errorCoordinate: '坐标格式不正确'
  },
  // layer
  dataFlow: {
    dataSubscriptionFailed: '数据订阅失败！'
  },
  animateMarkerlayer: {
    unsupportedData: '当前图层不支持该数据，请重新传入数据！'
  },
  sceneMeasure: {
    measure: '量算',
    measureMode: '量算模式',
    pickPoint: '顶点捕捉',
    contour: '等高线',
    measureAction: '测量',
    clear: '清除',
    mode_space: '空间量算',
    mode_ground: '贴地量算',
    mode_projection: '平面投影',
    measureDistence: '测量距离',
    measureHeight: '测量高度',
    measureArea: '测量面积',
    distence_cl: '距离',
    area: '面积',
    spaceDistance: '空间距离',
    verticalHeight: '垂直高度',
    horizontalDistance: '水平距离'
  },
  sceneViewModeSwitcher: {
    switchTo2D: '切至平面',
    switchTo3D: '切至三维'
  },
  cascader: {
    placeholder: '请选择'
  },
  months: [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月'
  ],
  weekdays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  monthsShort: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月'
  ],
  weekdaysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  weekdaysMin: ['日', '一', '二', '三', '四', '五', '六']
}
