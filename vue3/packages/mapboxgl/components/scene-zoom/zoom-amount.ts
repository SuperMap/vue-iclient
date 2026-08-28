const DEFAULT_ZOOM_RATIO = 0.05
const MIN_ZOOM_AMOUNT = 1

export function getSceneZoomAmount(
  cameraHeight: number | undefined,
  step?: number | string
): number {
  const height = Number(cameraHeight)
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 0
  const parsedStep = Number(step)
  const ratio =
    Number.isFinite(parsedStep) && parsedStep > 0 ? parsedStep / 100 : DEFAULT_ZOOM_RATIO
  return Math.max(safeHeight * ratio, MIN_ZOOM_AMOUNT)
}

export function getSceneCameraHeight(viewer: {
  camera?: { positionCartographic?: { height?: number }; position?: unknown }
  scene?: {
    camera?: { positionCartographic?: { height?: number }; position?: unknown }
    globe?: { ellipsoid?: { cartesianToCartographic?: (position: unknown) => { height?: number } } }
  }
} | null): number {
  if (!viewer) {
    return 0
  }
  const camera = viewer.scene?.camera || viewer.camera
  const height = Number(camera?.positionCartographic?.height)
  if (Number.isFinite(height) && height > 0) {
    return height
  }
  const position = camera?.position
  const cartographic = viewer.scene?.globe?.ellipsoid?.cartesianToCartographic?.(position)
  const fallbackHeight = Number(cartographic?.height)
  return Number.isFinite(fallbackHeight) && fallbackHeight > 0 ? fallbackHeight : 0
}
