const rollerShutterModes = ['NONE', 'HORIZONTAL', 'VERTICAL'] as const

/**
 * 卷帘模式。
 * - NONE: 不启用卷帘
 * - HORIZONTAL: 左右卷帘
 * - VERTICAL: 上下卷帘
 */
export type RollerShutterMode = (typeof rollerShutterModes)[number]
const rollerShutterLayerDisplays = ['all', 'none', 'first', 'second'] as const

/**
 * 图层在卷帘模式中的显示侧。
 */
export type SceneRollerShutterLayerDisplay = (typeof rollerShutterLayerDisplays)[number]

/**
 * 单个图层的卷帘显示配置。
 */
export interface SceneRollerShutterLayerConfig {
  /** 需要参与卷帘控制的图层。*/
  layer: any
  /** 
   * 图层在卷帘模式下的显示侧。
   * - display: 表示图层在当前卷帘模式下的显示状态
   * - 'all': 两侧都显示
   * - 'none': 两侧都隐藏
   * - 'first': 第一侧显示（水平是左、垂直是上）
   * - 'second': 第二侧显示（水平是右、垂直是下）
   */
  display?: SceneRollerShutterLayerDisplay
}

/**
 * 场景卷帘工具配置。
 */
export interface SceneRollerShutterOptions {
  /** 初始卷帘模式。 */
  mode?: RollerShutterMode
  /** 初始滑块位置，取值范围为 0 到 1。 */
  position?: number
  /** 自定义滑块元素。 */
  sliderElement?: HTMLElement | null
  /** 受卷帘控制的图层列表。 */
  layers?: SceneRollerShutterLayerConfig[]
}

interface RollerShutterRegions {
  horizontalFirst: any
  horizontalSecond: any
  verticalFirst: any
  verticalSecond: any
  none: any
}

function getSuperMap3D(): any {
  const SuperMap3D = (window as any)?.SuperMap3D
  if (!SuperMap3D) {
    throw new Error('SuperMap3D is not available')
  }
  return SuperMap3D
}

function clampRatio(value: number, fallback = 0.5): number {
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

function unpackBoundingRectangle(rectangle: any, x: number, y: number, width: number, height: number) {
  const SuperMap3D = getSuperMap3D()
  SuperMap3D.BoundingRectangle.unpack([x, y, width, height], 0, rectangle)
}

function isValidMode(mode: RollerShutterMode): boolean {
  return rollerShutterModes.includes(mode)
}

function isValidLayerDisplay(display: unknown): display is SceneRollerShutterLayerDisplay {
  return typeof display === 'string' && rollerShutterLayerDisplays.includes(display as SceneRollerShutterLayerDisplay)
}

function getDefaultLayerDisplay() {
  return 'all' as SceneRollerShutterLayerDisplay
}

/**
 * 管理场景图层和影像图层的卷帘状态，并可选接管滑块拖拽事件。
 */
export class SceneRollerShutter {
  private viewer: any
  private mode: RollerShutterMode
  private controlledLayers: SceneRollerShutterLayerConfig[]
  private horizontalPosition: number
  private verticalPosition: number
  private sliderElement: HTMLElement | null
  private regions: RollerShutterRegions
  private appliedLayers: Set<Record<string, any>>
  private dragging: boolean

  constructor(viewer: any, options: SceneRollerShutterOptions = {}) {
    if (!viewer) {
      throw new Error('viewer is required')
    }
    const SuperMap3D = getSuperMap3D()
    const initialPosition = clampRatio(options.position ?? 0.5)
    this.viewer = viewer
    this.mode = isValidMode(options.mode ?? 'NONE') ? options.mode ?? 'NONE' : 'NONE'
    this.controlledLayers = []
    this.horizontalPosition = initialPosition
    this.verticalPosition = initialPosition
    this.sliderElement = null
    this.appliedLayers = new Set()
    this.dragging = false
    this.regions = {
      horizontalFirst: new SuperMap3D.BoundingRectangle(),
      horizontalSecond: new SuperMap3D.BoundingRectangle(),
      verticalFirst: new SuperMap3D.BoundingRectangle(),
      verticalSecond: new SuperMap3D.BoundingRectangle(),
      none: new SuperMap3D.BoundingRectangle()
    }
    this.updateRegions()
    this.attachSliderElement(options.sliderElement ?? null)
    if (options.layers?.length) {
      this.setLayers(options.layers)
      return
    }
    this.renderSlider()
  }

  /**
   * 更新当前卷帘模式，并立即同步已管理图层的显示效果。
   */
  setMode(mode: RollerShutterMode) {
    this.mode = isValidMode(mode) ? mode : 'NONE'
    this.renderSlider()
    this.applyLayers()
    return this.mode
  }

  /**
   * 替换当前受卷帘控制的图层列表，并立即应用显示状态。
   */
  setLayers(layers: SceneRollerShutterLayerConfig[] = []) {
    this.controlledLayers = layers
      .filter(layerState => layerState?.layer)
      .map(layerState => this.normalizeLayerState(layerState))
    this.applyLayers()
    return this.controlledLayers
  }

  /**
   * 更新单个图层在卷帘中的显示状态；如果该图层尚未加入控制列表，会自动追加进去。
   */
  setLayerDisplay(layer: any, display: SceneRollerShutterLayerDisplay = getDefaultLayerDisplay()) {
    if (!layer) {
      return null
    }
    const nextLayerState = this.normalizeLayerState({
      layer,
      display
    })
    const targetIndex = this.controlledLayers.findIndex(layerState => layerState.layer === layer)
    if (targetIndex > -1) {
      this.controlledLayers[targetIndex] = nextLayerState
    } else {
      this.controlledLayers.push(nextLayerState)
    }
    this.applyLayers()
    return nextLayerState
  }

  /**
   * 更新当前模式下的滑块位置。
   * HORIZONTAL 模式对应左右卷帘位置，VERTICAL 模式对应上下卷帘位置。
   */
  setPosition(value: number) {
    const nextPosition = clampRatio(value, this.getCurrentPosition())
    if (this.mode === 'VERTICAL') {
      this.verticalPosition = nextPosition
    } else if (this.mode === 'HORIZONTAL') {
      this.horizontalPosition = nextPosition
    } else {
      this.horizontalPosition = nextPosition
      this.verticalPosition = nextPosition
    }
    this.updateRegions()
    this.renderSlider()
    this.applyLayers()
    return nextPosition
  }

  /**
   * 释放当前实例维护的全部卷帘状态和拖拽事件。
   */
  destroy() {
    this.stopDrag()
    this.detachSliderElement()
    this.clearAppliedLayers()
  }

  private normalizeLayerState(layerState: SceneRollerShutterLayerConfig): SceneRollerShutterLayerConfig {
    return {
      ...layerState,
      display: isValidLayerDisplay(layerState.display) ? layerState.display : getDefaultLayerDisplay()
    }
  }

  private attachSliderElement(sliderElement: HTMLElement | null) {
    this.detachSliderElement()
    this.sliderElement = sliderElement
    this.sliderElement?.addEventListener('mousedown', this.handleSliderMouseDown)
    this.renderSlider()
  }

  private detachSliderElement() {
    this.sliderElement?.removeEventListener('mousedown', this.handleSliderMouseDown)
    this.sliderElement = null
  }

  private updateRegions() {
    unpackBoundingRectangle(this.regions.horizontalFirst, 0, 0, this.horizontalPosition, 1)
    unpackBoundingRectangle(
      this.regions.horizontalSecond,
      this.horizontalPosition,
      0,
      1 - this.horizontalPosition,
      1
    )
    unpackBoundingRectangle(this.regions.verticalFirst, 0, 0, 1, this.verticalPosition)
    unpackBoundingRectangle(
      this.regions.verticalSecond,
      0,
      this.verticalPosition,
      1,
      1 - this.verticalPosition
    )
    unpackBoundingRectangle(this.regions.none, 0, 0, 0, 0)
  }

  private getCurrentPosition() {
    if (this.mode === 'VERTICAL') {
      return this.verticalPosition
    }
    return this.horizontalPosition
  }

  private getLayerSwipeConfig(layerState: SceneRollerShutterLayerConfig) {
    if (this.mode === 'NONE') {
      return {
        enabled: false,
        region: undefined
      }
    }

    const firstRegion =
      this.mode === 'HORIZONTAL' ? this.regions.horizontalFirst : this.regions.verticalFirst
    const secondRegion =
      this.mode === 'HORIZONTAL' ? this.regions.horizontalSecond : this.regions.verticalSecond

    switch (layerState.display ?? getDefaultLayerDisplay()) {
      case 'first':
        return { enabled: true, region: firstRegion }
      case 'second':
        return { enabled: true, region: secondRegion }
      case 'none':
        return { enabled: true, region: this.regions.none }
      default:
        return { enabled: false, region: undefined }
    }
  }

  private writeLayerSwipeState(layer: Record<string, any>, enabled: boolean, region?: any) {
    layer.swipeEnabled = enabled
    layer.swipeRegion = enabled ? region : undefined
  }

  private applyLayers() {
    this.clearAppliedLayers()
    this.controlledLayers.forEach(layerState => {
      const config = this.getLayerSwipeConfig(layerState)
      const layer = layerState.layer as Record<string, any>
      this.appliedLayers.add(layer)
      try {
        if (!config.enabled) {
          this.writeLayerSwipeState(layer, false)
          return
        }
        this.writeLayerSwipeState(layer, true, config.region)
      } catch (error) {
        console.warn(`Failed to apply roller shutter on layer ${layer.name ?? ''}`.trim(), error)
      }
    })
  }

  private clearAppliedLayers() {
    this.appliedLayers.forEach(layer => {
      try {
        this.writeLayerSwipeState(layer, false)
      } catch (error) {
        console.warn(`Failed to clear roller shutter on layer ${layer.name ?? ''}`.trim(), error)
      }
    })
    this.appliedLayers.clear()
  }

  private renderSlider() {
    if (!this.sliderElement) {
      return
    }
    if (this.mode === 'VERTICAL') {
      this.sliderElement.style.top = `${this.verticalPosition * 100}%`
      this.sliderElement.style.left = '0'
      return
    }
    this.sliderElement.style.left = `${this.horizontalPosition * 100}%`
    this.sliderElement.style.top = '0'
  }

  private handleSliderMouseDown = (event: MouseEvent) => {
    if (this.mode === 'NONE') {
      return
    }
    event.preventDefault()
    this.dragging = true
    document.body.style.cursor = this.mode === 'HORIZONTAL' ? 'col-resize' : 'row-resize'
    window.addEventListener('mousemove', this.handleSliderMouseMove)
    window.addEventListener('mouseup', this.handleSliderMouseUp)
  }

  private handleSliderMouseMove = (event: MouseEvent) => {
    if (!this.dragging) {
      return
    }
    const container = this.viewer?.container
    const rect = container?.getBoundingClientRect?.()
    if (!rect) {
      return
    }
    if (this.mode === 'VERTICAL') {
      this.setPosition((event.clientY - rect.top) / rect.height)
      return
    }
    this.setPosition((event.clientX - rect.left) / rect.width)
  }

  private handleSliderMouseUp = () => {
    this.stopDrag()
  }

  private stopDrag() {
    this.dragging = false
    document.body.style.cursor = ''
    window.removeEventListener('mousemove', this.handleSliderMouseMove)
    window.removeEventListener('mouseup', this.handleSliderMouseUp)
  }
}
