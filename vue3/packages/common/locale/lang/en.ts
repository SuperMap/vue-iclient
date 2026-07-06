export default {
  name: 'en',
  warning: {
    unassociatedMapCannotCheck: 'You need to configure the associated map before checking.',
    directoryTreeBrowseOnlyWithoutMap: 'No associated map. You can browse now, but cannot check resources.',
    directoryTreeUnsupportedResourceType: 'This resource type cannot be checked.',
    directoryTreeUnsupportedServiceType: 'This service type cannot be checked.',
    directoryTreeServiceUnavailable: 'This service is unavailable and cannot be checked.',
    directoryTreeMissingProjection: 'This resource has no projection information and cannot be checked.',
    directoryTreeCrsMismatch: 'This resource projection does not match the current map and cannot be checked.',
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
    directoryTreeOperationSuccessSummary: '{action} completed. {successCount} resource(s) succeeded.',
    directoryTreeOperationPartialSummary:
      '{action} completed. {successCount} resource(s) succeeded, {failureCount} failed.'
  },
  sceneViewModeSwitcher: {
    switchTo2D: 'Switch to 2D',
    switchTo3D: 'Switch to 3D'
  },
  sceneMapSwitch: {
    title: 'Map Switch',
    annotation: 'Place Name Annotation',
    terrain: 'Terrain Service'
  },
  sm: {
    webmap: {
      test: 'tesssssssssssssssdsd'
    }
  }
}
