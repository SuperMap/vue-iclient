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
    unsupportedVideoAddress: 'The video address is illegal',
    unsupportedPosterAddress: 'The poster address is illegal',
    unavailableVideo: 'This video is temporarily unavailable, please try again later',
    mapNotLoaded: 'The associated map has not been loaded yet, please wait for a second',
    unassociatedMap: 'You need to configure the associated map!',
    videojs: 'Please import video.js plugin: https://github.com/videojs/video.js',
    flvPlayer:
      'Please import flv related plugin: https://github.com/bilibili/flv.js, https://github.com/mister-ben/videojs-flvjs'
  },
  success: { copySucccess: 'copy success' },
  info: {
    loading: 'Loading...',
    pressEscToExit: 'Press the ESC key or click the close button to exit',
    pressEscOrClickToExit: 'Press the ESC key or click anywhere to exit'
  },
  unit: {
    kilometers: 'km',
    miles: 'mi',
    meters: 'm',
    yards: 'yd',
    feet: 'ft',
    squarekilometers: 'sq km',
    squaremiles: 'sq mi',
    squaremeters: 'sq m',
    squareyards: 'sq yd',
    squarefeet: 'sq ft',
    XY: 'XY',
    BASEMAP: 'BASEMAP',
    UTM: 'UTM',
    DD: 'DD',
    DOM: 'DOM',
    DMS: 'DMS',
    Mercator: 'Web Mercator'
  },
  error: {},
  commontypes: {
    restData: 'SuperMap Rest Data Service',
    restMap: 'SuperMap Rest Map Service',
    addressMatch: 'SuperMap Address Matching Service',
    iportalData: 'SuperMap iPortal Data',
    onlineLocalSearch: 'SuperMap Online Local Search'
  },
  // 微件
  timeText: {
    Year: 'year',
    Month: 'month',
    Day: 'd',
    hour: 'h',
    minute: 'min',
    second: 's'
  },
  zoom: {},
  chart: {
    unSupportedData: 'The current data does not support linkage with the map'
  },
  layerList: {
    title: 'Layer',
    layerStyle: 'layerStyle',
    attributes: 'Attributes',
    zoomToLayer: 'zoomToLayer',
    opacity: 'Opacity'
  },
  slideshow: {
    title: 'Slideshow'
  },
  layerColor: {
    title: 'LayerColor',
    layer: 'Layer',
    property: 'Property',
    color: 'Color',
    reset: 'Reset',
    select: 'Select',
    deselect: 'Deselect',
    circleColor: 'circleColor',
    strokeColor: 'circleStrokeColor',
    lineColor: 'lineColor',
    fillColor: 'fillColor',
    iconColor: 'iconColor',
    textColor: 'textColor',
    capture: 'Capture'
  },
  attributes: {
    title: 'Attributes',
    feature: 'Feature',
    selected: 'Selected',
    clearSelected: 'Clear Selected',
    zoomToFeatures: 'ZoomTo Features',
    columnsControl: 'Show/Hide Columns',
    refreshData: 'RefreshData',
    search: 'Search',
    reset: 'Reset'
  },
  miniMap: {},
  pan: {},
  scale: {},
  webmap: {
    loadingTip: 'Map is loading...',
    crsNotSupport: 'The coordinate system of the current map is not supported!',
    TileMatrixSetNotSuppport: 'Incoming TileMatrixSet is not supported!',
    getLayerInfoFailed: 'Failed to load layer!',
    getThemeInfoFailed: 'Failed to get theme information!',
    crsnotsupport: 'Unsupported coordinate system!',
    baiduMapNotSupport: 'Baidu maps is not supported yet!',
    layerorsourcenameduplicated: 'layer or source name duplicated and cannot be added!',
    sampleDataNotSupport: 'Sample datas is not supported yet!',
    drillLayersNotSupport: 'Drill-down layers are not supported yet!',
    mvtNotSupport: 'Vector tile layers is not supported yet!',
    mapCreatedFailed: 'Failed to load map!',
    projectionnotmatch: '{title} does not match the current map projection!',
    xyztilelayernotsupport: '{title} XYZ Tile layer does not match the resolution or origin of the current map!'
  },
  drillMap: {
    goBack: 'Go Back'
  },
  legend: {
    themeField: 'Thematic Field',
    title: 'Legend',
    top: 'Highest',
    bottom: 'Lowest',
    noMatchLayer: 'No matching layer',
    themeDefault: 'Default',
    outOfRange: 'Out of range',
    style: 'Style',
    color: 'Color',
    size: 'Size',
    opacity: 'Opacity',
    width: 'Width',
    outlineColor: 'Outline Color',
    haloColor: 'Halo Color',
    label: 'Label',
    parentheses: '({tips})',
    colon: ':'
  },
  measure: {
    mapMeasure: 'Measure',
    measureResult: 'Measurement Result:',
    distance: 'Distance',
    area: 'Area',
    delete: 'Empty',
    selectPlaceholder: 'Please Select',
    startingPoint: 'Starting Point'
  },
  search: {
    noResult: 'The query result is empty!',
    noKey: 'The search keyword cannot be empty. Please enter the search condition.',
    inputPlaceHolder: 'Find an address or location',
    attribute: 'Attribute',
    attributeValue: 'Attribute Value',
    setSearchSource: 'Please set the search source!',
    address: 'Address',
    null: 'Null',
    illegalFeature: 'Features must contain legal coordinates!'
  },
  query: {
    query: 'Query',
    queryJob: 'Task',
    queryResult: 'Result',
    attributeCondition: 'Query Condition',
    keyQueryCondition: 'Search keyword',
    spatialFilter: 'Spatial Filter',
    mapBounds: 'Query within the whole map extent',
    currentMapBounds: 'Query within current viewbound',
    applicate: 'Apply',
    noResult: 'No Result',
    resultAlreadyExists: 'The current query result already exists!',
    querying: 'Querying...',
    attribute: 'Attribute',
    attributeValue: 'Attribute Value',
    noResults: 'The query result is empty!',
    queryFailed: 'Query failed!',
    seviceNotSupport: 'This service does not support queries!',
    keyQueryPlaceholder: 'Please enter the search keyword',
    sqlQueryPlaceholder: 'Please enter the SQL expression'
  },
  identify: {
    layerNotExit: "The layer '{layer}' does not exist in the map's style",
    noData: 'no Data'
  },
  openFile: {
    fileSizeExceeded: "The file size is too big! The file size can't exceed 10M!",
    fileTypeUnsupported: 'This file format is not supported!',
    openFileFail: 'File open failed!',
    openFileSuccess: 'File open succeeded!',
    selectFile: 'Select File',
    openEmptyFile: 'The opened file is empty!',
    openFile: 'Open File'
  },
  draw: {
    draw: 'Draw'
  },
  indicator: {
    title: 'Indicator Title',
    unit: 'Unit'
  },
  layerManager: {
    title: 'Layer Manager'
  },
  fillExtrusion: {
    title: 'Fill Extrusion',
    polygonLayer: 'Polygon Layer',
    height: 'Height(meter)',
    heightValue: 'Height Value',
    fieldName: 'Field Name',
    customFieldPlaceholder: 'Fill in the field name',
    customNum: 'Custom',
    multiple: 'Multiple',
    fillColor: 'Fill color',
    layerOpacity: 'Opacity',
    hideOriginalLayer: 'Hide original layer',
    reset: 'Reset'
  },
  flyTo: {
    title: 'Fly To'
  },
  tdtResults: {
    on: 'on ',
    station: ' station',
    total: 'total',
    about: 'about ',
    // pagination
    homePage: 'Home',
    prevPage: 'Previous',
    nextPage: 'Next',
    // nothingResult
    searchNoResult: 'No related results were found',
    youCanTry: 'You can try',
    enterCorrect: 'Check if the input is correct',
    enterOtherKeyWords: 'Enter another keyword to search',
    onTdtMap: 'On the map of the sky',
    addThisAddress: 'Add this address',
    uWantTo: 'Are you looking for',
    // pointResults
    totalFind: 'found',
    piecesResults: 'result',
    phone: 'Tell',
    address: 'Address',
    setStartPonint: 'Set as starting point',
    setEndPonint: 'Set as end point',
    // routePlan
    totalMiles: 'total mileage',
    distance: 'About {distance} km',
    showDetails: 'Show full details',
    switchTimes: 'Transfer {switchTimes} times',
    noSwitch: 'No transfer',
    walk: 'Walk to',
    getOff: 'get off',
    getOn: 'boarding',
    take: 'take ',
    noSearchResults: 'No line information was found',
    fastRoute: 'Fastest line',
    shortRoute: 'Shortest line',
    walkRoute: 'Less high speed',
    fast: 'Faster',
    noSubway: 'No subway',
    lessSwitch: 'Less transfer',
    lessWalk: 'Less walking',
    // staticResult
    cityHadResults: 'The following cities have results, please choose',
    moreCity: 'More cities',
    // LineResult
    allFound: 'Found for you',
    piecesBusRoute: 'bus route',
    showDetail: 'Expand details',
    busEndTime: 'First and last bus time',
    relateAdress: "Click here to see the location of '{keyWord}'",
    // areaResult
    switchTo: 'Switched to'
  },
  tdtRoute: {
    title: 'Route',
    pleaseEnterStartPoint: 'Please enter the starting address',
    pleaseEnterEndPoint: 'Please enter the destination address',
    search: 'Search',
    startPoint: 'Starting address',
    endPoint: 'Destination address',
    mapLoadedFiled: 'Map failed to load',
    busEndTime: 'First and last bus time',
    about: 'about ',
    station: ' station',
    total: 'total',
    hour: ' hour',
    minutes: ' minutes'
  },
  tdtSearch: {
    phone: 'Tell',
    address: 'Address',
    noData: 'No data',
    transport: 'traffic'
  },
  tdtMapSwitcher: {
    title: 'Map Switcher',
    image: 'image',
    vector: 'vector',
    terrain: 'terrain',
    placeName: 'placeName',
    TiandituVec: 'TiandituVecLayer',
    TiandituTer: 'TiandituTerLayer',
    TiandituImg: 'TiandituImgLayer',
    TiandituCva: 'TiandituCvaLabel',
    TiandituCta: 'TiandituCtaLabel',
    TiandituCia: 'TiandituCiaLabel'
  },
  coordinateConversion: {
    inputPlaceHolder: 'Input coordinate',
    copy: 'copy',
    location: 'location',
    capture: 'capture',
    realTime: 'real-time',
    errorCoordinate: 'invalid coordinate'
  },
  // layer
  dataFlow: {
    dataSubscriptionFailed: 'Data subscription failed!'
  },
  animateMarkerlayer: {
    unsupportedData: 'The data is not supported, please reset the data!'
  },
  DatePicker: {
    lang: {
      months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ],
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      weekdaysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    }
  }
};
