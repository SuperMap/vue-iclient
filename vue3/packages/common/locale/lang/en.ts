export default {
  name: 'en',
  warning: {
    unassociatedMapCannotCheck: 'You need to configure the associated map before checking.',
    directoryTreeBrowseOnlyWithoutMap:
      'No associated map. You can browse now, but cannot check resources.',
    directoryTreeUnsupportedResourceType: 'This resource type cannot be checked.',
    directoryTreeUnsupportedServiceType: 'This service type cannot be checked.',
    directoryTreeServiceUnavailable: 'This service is unavailable and cannot be checked.',
    directoryTreeMissingProjection:
      'This resource has no projection information and cannot be checked.',
    directoryTreeCrsMismatch:
      'This resource projection does not match the current map and cannot be checked.',
    directoryTreeCsvExcelMissingCoordinateFields:
      'This CSV/Excel data has no coordinate fields and cannot be checked.',
    directoryTreeCsvExcelMissingProjection:
      'This CSV/Excel coordinate data cannot be identified as EPSG:4326 and cannot be checked.',
    directoryTreeCsvExcelUnsupportedProjection:
      'This CSV/Excel coordinate system is not EPSG:4326 and cannot be checked.',
    directoryTreeUnsupportedTileMatrixSet:
      'This WMTS layer has no tile matrix set supported by the current map and cannot be checked.',
    directoryTreeLoadFailed: 'Failed to load this resource. Try again later.'
  },
  info: {
    loading: 'Loading',
    directoryTreeValidating: 'Validating',
    directoryTreeChecking: 'Adding',
    directoryTreeUnchecking: 'Removing',
    directoryTreeBatchCheckingProgress: 'Adding {completed}/{total}',
    directoryTreeBatchUncheckingProgress: 'Removing {completed}/{total}',
    directoryTreeOperationActionCheck: 'Add',
    directoryTreeOperationActionUncheck: 'Remove',
    directoryTreeOperationSuccessSummary:
      '{action} completed. {successCount} resource(s) succeeded.',
    directoryTreeOperationPartialSummary:
      '{action} completed. {successCount} resource(s) succeeded, {failureCount} failed.'
  },
  sceneViewModeSwitcher: {
    switchTo2D: 'Switch to 2D',
    switchTo3D: 'Switch to 3D'
  },
  sceneMapSwitch: {
    title: 'Map Switch',
    original: 'Original Basemap',
    annotation: 'Place Name Annotation',
    terrain: 'Terrain Service'
  },
  flyTo: {
    title: 'Fly To'
  },
  sceneSplitScreen: {
    title: 'Split Screen',
    modeLabel: 'Split Mode:',
    layerVisibilityLabel: 'Layer Viewport Visibility:',
    loading: 'Loading...',
    modeNone: 'No Split',
    modeHorizontal: 'Horizontal Split',
    modeVertical: 'Vertical Split',
    modeQuad: 'Quad Viewport',
    modeTriple: 'Triple Viewport',
    modeVerticalTrisection: 'Horizontal Triple Viewport',
    viewport1: 'Viewport 1',
    viewport2: 'Viewport 2',
    viewport3: 'Viewport 3',
    viewport4: 'Viewport 4'
  },
  sceneSunlightAnalysis: {
    title: 'Sunlight Analysis',
    date: 'Date',
    startTime: 'Start Time',
    endTime: 'End Time',
    displayMode: 'Display Mode',
    sunshine: 'Sunshine',
    shadow: 'Shadow',
    sunshineColor: 'Sunshine Color',
    shadowColor: 'Shadow Color',
    rainbow: 'Rainbow Gradient',
    blueWhiteRed: 'Blue White Red',
    thermal: 'Thermal Gradient',
    maxDistance: 'Max Distance',
    meter: 'm',
    selectColorTable: 'Select Color Table',
    analysis: 'Analyze',
    clear: 'Clear'
  },
  sceneRollerShutter: {
    title: 'Roller Shutter',
    notReady: 'Scene is not ready yet',
    modeLabel: 'Roller Shutter Mode:',
    displayLabel: 'Display:',
    displayAll: 'Show All',
    displayNone: 'Hide All',
    modeNone: 'Disable',
    modeHorizontal: 'Left / Right',
    modeVertical: 'Top / Bottom',
    noLayers: 'No controllable layers were found in the current scene',
    s3mLayers: 'S3M Layers',
    imageryLayers: 'Imagery Layers',
    left: 'Left',
    right: 'Right',
    top: 'Top',
    bottom: 'Bottom',
    layer: 'Layer',
    imageryLayer: 'Imagery Layer'
  },
  sceneSkylineAnalysis: {
    title: 'Skyline Analysis',
    displayMode: 'Display Mode',
    lineDisplay: 'Line',
    faceDisplay: 'Face',
    bodyDisplay: 'Body',
    analysisRadius: 'Analysis Radius',
    meter: 'm',
    lineWidth: 'Line Width',
    skylineColor: 'Skyline Color',
    skylineBodyColor: 'Skyline Body Color',
    highlightObstacles: 'Highlight Obstacles',
    display2D: 'Display 2D Skyline',
    globeNoAnalysis: 'Ignore Globe',
    analysis: 'Analyze',
    drawViewPoint: 'Draw View Point',
    limitBody: 'Limit Body',
    clear: 'Clear'
  },
  sceneOpennessAnalysis: {
    title: 'Openness Analysis',
    analysisRadius: 'Analysis Radius',
    startAngle: 'Start Angle',
    endAngle: 'End Angle',
    visibleAreaColor: 'Visible Area Color',
    hiddenAreaColor: 'Hidden Area Color',
    displayMode: 'Display Mode',
    visiblePart: 'Visible',
    hiddenPart: 'Hidden',
    showAll: 'Show All',
    isClosed: 'Closed Area',
    analysis: 'Analyze',
    clear: 'Clear'
  },
  sceneSightlineAnalysis: {
    title: 'Sightline Analysis',
    viewShed: 'View Shed',
    sightline: 'Sightline',
    sightNetwork: 'Sight Network',
    direction: 'Direction',
    pitch: 'Pitch',
    distance: 'Distance',
    offsetHeight: 'Offset Height',
    horizontalFov: 'Horizontal FOV',
    verticalFov: 'Vertical FOV',
    lineWidth: 'Line Width',
    visibleAreaColor: 'Visible Area Color',
    hiddenAreaColor: 'Hidden Area Color',
    selectViewPoint: 'Select View Point',
    selectTargetPoint: 'Select Target Point',
    clear: 'Clear'
  },
  sceneLayerManager: {
    title: 'Layer Manager',
    layerControl: 'Layer Control',
    searchPlaceholder: 'Search layers',
    clear: 'Clear',
    sceneNotReady: 'Scene is not ready',
    emptyConfig: 'No layer configuration',
    noSearchResult: 'No matching layers',
    locate: 'Locate',
    loadFailed: 'Failed to load layer',
    operationFailed: 'Operation failed. Try again later.',
    alpha: 'Opacity',
    contrast: 'Contrast',
    brightness: 'Brightness',
    saturation: 'Saturation',
    bottomAltitudeOffset: 'Bottom altitude offset'
  },
  sm: {
    webmap: {
      test: 'tesssssssssssssssdsd'
    }
  }
}
