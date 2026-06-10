export const rollerShutterModes = ['NONE', 'HORIZONTAL', 'VERTICAL'] as const

export type RollerShutterMode = (typeof rollerShutterModes)[number]

export interface RollerShutterLayerState {
  left: boolean
  right: boolean
  top: boolean
  bottom: boolean
}

export interface SceneRollerShutterOptions {
  mode?: RollerShutterMode
  sliderX?: number
  sliderY?: number
}

interface RollerShutterRegions {
  left: any
  right: any
  top: any
  bottom: any
  none: any
}

type RollerShutterTarget =
  | {
      layers?: RollerShutterTarget[]
      swipeEnabled?: boolean
      swipeRegion?: any
      name?: string
    }
  | RollerShutterTarget[]
  | null
  | undefined

function getSuperMap3D(): any {
  const SuperMap3D = (window as any)?.SuperMap3D
  if (!SuperMap3D) {
    throw new Error('SuperMap3D is not available')
  }
  return SuperMap3D
}

export function clampRollerShutterRatio(value: number, fallback = 0.5): number {
  if (!Number.isFinite(value)) {
    return fallback
  }
  if (value < 0) {
    return 0
  }
  if (value > 1) {
    return 1
  }
  return value
}

export function createRollerShutterLayerState(
  state: Partial<RollerShutterLayerState> = {}
): RollerShutterLayerState {
  return {
    left: true,
    right: true,
    top: true,
    bottom: true,
    ...state
  }
}

export function applyRollerShutterModeToLayerState(
  mode: RollerShutterMode,
  state: Partial<RollerShutterLayerState> = {}
): RollerShutterLayerState {
  const nextState = createRollerShutterLayerState(state)
  switch (mode) {
    case 'NONE':
      return createRollerShutterLayerState()
    case 'HORIZONTAL':
      return {
        ...nextState,
        top: true,
        bottom: true
      }
    case 'VERTICAL':
      return {
        ...nextState,
        left: true,
        right: true
      }
    default:
      return nextState
  }
}

function unpackBoundingRectangle(rectangle: any, x: number, y: number, width: number, height: number) {
  const SuperMap3D = getSuperMap3D()
  SuperMap3D.BoundingRectangle.unpack([x, y, width, height], 0, rectangle)
}

function resolveRollerShutterTargets(target: RollerShutterTarget): Array<Record<string, any>> {
  if (!target) {
    return []
  }
  if (Array.isArray(target)) {
    return target.reduce<Array<Record<string, any>>>((result, item) => {
      return result.concat(resolveRollerShutterTargets(item))
    }, [])
  }
  if (Array.isArray(target.layers) && target.layers.length) {
    return target.layers.reduce<Array<Record<string, any>>>((result, item) => {
      return result.concat(resolveRollerShutterTargets(item))
    }, [])
  }
  return [target]
}

export class SceneRollerShutter {
  viewer: any
  mode: RollerShutterMode
  sliderX: number
  sliderY: number
  regions: RollerShutterRegions
  trackedLayers: Set<Record<string, any>>

  constructor(viewer: any, options: SceneRollerShutterOptions = {}) {
    if (!viewer) {
      throw new Error('viewer is required')
    }
    const SuperMap3D = getSuperMap3D()
    this.viewer = viewer
    this.mode = options.mode ?? 'NONE'
    this.sliderX = clampRollerShutterRatio(options.sliderX ?? 0.5)
    this.sliderY = clampRollerShutterRatio(options.sliderY ?? 0.5)
    this.trackedLayers = new Set()
    this.regions = {
      left: new SuperMap3D.BoundingRectangle(),
      right: new SuperMap3D.BoundingRectangle(),
      top: new SuperMap3D.BoundingRectangle(),
      bottom: new SuperMap3D.BoundingRectangle(),
      none: new SuperMap3D.BoundingRectangle()
    }
    this.updateRegions()
  }

  setMode(mode: RollerShutterMode) {
    this.mode = rollerShutterModes.includes(mode) ? mode : 'NONE'
    return this.mode
  }

  setLeftRightSplitPosition(value: number) {
    this.sliderX = clampRollerShutterRatio(value, this.sliderX)
    this.updateRegions()
    return this.sliderX
  }

  setTopBottomSplitPosition(value: number) {
    this.sliderY = clampRollerShutterRatio(value, this.sliderY)
    this.updateRegions()
    return this.sliderY
  }

  updateRegions() {
    unpackBoundingRectangle(this.regions.left, 0, 0, this.sliderX, 1)
    unpackBoundingRectangle(this.regions.right, this.sliderX, 0, 1 - this.sliderX, 1)
    unpackBoundingRectangle(this.regions.top, 0, 0, 1, this.sliderY)
    unpackBoundingRectangle(this.regions.bottom, 0, this.sliderY, 1, 1 - this.sliderY)
    unpackBoundingRectangle(this.regions.none, 0, 0, 0, 0)
    return this.regions
  }

  getLayerSwipeConfig(state: Partial<RollerShutterLayerState> = {}) {
    const layerState = applyRollerShutterModeToLayerState(this.mode, state)
    if (this.mode === 'NONE') {
      return {
        enabled: false,
        region: undefined,
        state: layerState
      }
    }

    if (this.mode === 'HORIZONTAL') {
      if (layerState.left && !layerState.right) {
        return { enabled: true, region: this.regions.left, state: layerState }
      }
      if (!layerState.left && layerState.right) {
        return { enabled: true, region: this.regions.right, state: layerState }
      }
      if (!layerState.left && !layerState.right) {
        return { enabled: true, region: this.regions.none, state: layerState }
      }
      return { enabled: false, region: undefined, state: layerState }
    }

    if (layerState.top && !layerState.bottom) {
      return { enabled: true, region: this.regions.top, state: layerState }
    }
    if (!layerState.top && layerState.bottom) {
      return { enabled: true, region: this.regions.bottom, state: layerState }
    }
    if (!layerState.top && !layerState.bottom) {
      return { enabled: true, region: this.regions.none, state: layerState }
    }
    return { enabled: false, region: undefined, state: layerState }
  }

  setTargetSwipeState(target: Record<string, any>, enabled: boolean, region?: any) {
    target.swipeEnabled = enabled
    target.swipeRegion = enabled ? region : undefined
  }

  applyToTarget(target: RollerShutterTarget, state: Partial<RollerShutterLayerState> = {}) {
    const layers = resolveRollerShutterTargets(target)
    const config = this.getLayerSwipeConfig(state)
    layers.forEach(layer => {
      this.trackedLayers.add(layer)
      try {
        if (!config.enabled) {
          this.setTargetSwipeState(layer, false)
          return
        }
        this.setTargetSwipeState(layer, true, config.region)
      } catch (error) {
        console.warn(`Failed to apply roller shutter on layer ${layer.name ?? ''}`.trim(), error)
      }
    })
    return config
  }

  applyToLayer(target: RollerShutterTarget, state: Partial<RollerShutterLayerState> = {}) {
    return this.applyToTarget(target, state)
  }

  clearTarget(target: RollerShutterTarget) {
    const layers = resolveRollerShutterTargets(target)
    layers.forEach(layer => {
      this.trackedLayers.delete(layer)
      try {
        this.setTargetSwipeState(layer, false)
      } catch (error) {
        console.warn(`Failed to clear roller shutter on layer ${layer.name ?? ''}`.trim(), error)
      }
    })
  }

  clearLayer(target: RollerShutterTarget) {
    this.clearTarget(target)
  }

  clearAll() {
    this.trackedLayers.forEach(layer => {
      try {
        this.setTargetSwipeState(layer, false)
      } catch (error) {
        console.warn(`Failed to clear roller shutter on layer ${layer.name ?? ''}`.trim(), error)
      }
    })
    this.trackedLayers.clear()
  }

  destroy() {
    this.clearAll()
  }
}
