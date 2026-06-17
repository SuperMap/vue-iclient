import { Events } from 'vue-iclient-core/types/event/Events'

/**
 * 场景视图模式切换器配置。
 */
export interface SceneViewModeSwitcherOptions {
  /** 场景 Viewer 实例。 */
  viewer?: any
  /** 切换过程中是否强制保持三维场景模式。 */
  forceScene3D?: boolean
  /** 默认视图模式。 */
  defaultViewMode?: '2D' | '3D'
}

/**
 * 场景视图模式。
 */
export type SceneViewMode = '2D' | '3D'

/**
 * 场景视图模式切换事件。
 */
export interface SceneViewModeSwitcherChangeEvent {
  /** 切换后的模式。 */
  currentMode: SceneViewMode
  /** 切换前的模式。 */
  previousMode: SceneViewMode
}

/**
 * 管理场景在 2D / 3D 之间的平滑切换，并派发 `change` 事件。
 */
export class SceneViewModeSwitcher extends Events {
  private tickHandler: (() => void) | null = null
  private restoreControllerState: (() => void) | null = null
  private _currentMode: SceneViewMode

  triggerEvent: (name: 'change', event: SceneViewModeSwitcherChangeEvent) => any
  on: (data: { change?: (event: SceneViewModeSwitcherChangeEvent) => any; scope?: any }) => void
  un: (data: { change?: (event: SceneViewModeSwitcherChangeEvent) => any; scope?: any }) => void

  constructor(private options: SceneViewModeSwitcherOptions) {
    super()
    this.eventTypes = ['change']
    this._currentMode = options.defaultViewMode === '2D' ? '2D' : '3D'
  }

  /** 当前视图模式。 */
  get currentMode() {
    return this._currentMode
  }

  /** 更新内部持有的 Viewer 实例。 */
  setViewer(viewer: any) {
    this.options.viewer = viewer
  }

  /** 清理切换过程中挂载的 tick 和控制器状态。 */
  clear() {
    const viewer = this.options.viewer
    if (this.tickHandler && viewer?.clock?.onTick?.removeEventListener) {
      viewer.clock.onTick.removeEventListener(this.tickHandler)
    }
    this.tickHandler = null
    this.restoreControllerState?.()
    this.restoreControllerState = null
  }

  /** 主动设置当前模式，并在需要时触发 `change` 事件。 */
  setCurrentMode(mode: SceneViewMode) {
    if (this._currentMode === mode) {
      return
    }
    const previousMode = this._currentMode
    this._currentMode = mode
    this.triggerEvent('change', {
      currentMode: mode,
      previousMode
    })
  }

  /** 在 2D / 3D 之间切换。 */
  toggle(callback?: () => void) {
    if (this._currentMode === '3D') {
      this.switchTo2D(callback)
      return
    }
    this.switchTo3D(callback)
  }

  /** 切换到 2D 视图。 */
  switchTo2D(callback?: () => void) {
    this.rotateCameraPitch(-90, '2D', callback)
  }

  /** 切换到 3D 视图。 */
  switchTo3D(callback?: () => void) {
    this.rotateCameraPitch(-30, '3D', callback)
  }

  private rotateCameraPitch(
    targetPitch: number,
    nextMode: SceneViewMode,
    callback: () => void = () => {}
  ) {
    const viewer = this.options.viewer
    const SuperMap3D = (window as any).SuperMap3D
    if (!viewer?.scene?.camera || !SuperMap3D) {
      this.setCurrentMode(nextMode)
      return
    }

    this.clear()

    if (this.options.forceScene3D) {
      viewer.scene.mode = SuperMap3D.SceneMode.SCENE3D
    }

    const center = new SuperMap3D.Cartesian2()
    center.x = viewer.scene.canvas.clientWidth / 2
    center.y = viewer.scene.canvas.clientHeight / 2

    const ellipsoidPoint = viewer.scene.camera.pickEllipsoid(
      center,
      viewer.scene.globe.ellipsoid,
      new SuperMap3D.Cartesian3()
    )
    if (!ellipsoidPoint) {
      return
    }

    const camera = viewer.scene.camera
    const targetTransform = SuperMap3D.Transforms.eastNorthUpToFixedFrame(
      ellipsoidPoint,
      viewer.scene.globe.ellipsoid,
      new SuperMap3D.Matrix4()
    )
    const controller = viewer.scene._screenSpaceCameraController

    if (targetPitch === -90) {
      controller.enableTilt = false
    } else if (targetPitch === -30) {
      controller.enableTilt = true
    }

    const restoredState = {
      enableTilt: controller.enableTilt,
      enableRotate: controller.enableRotate,
      enableTranslate: controller.enableTranslate,
      enableZoom: controller.enableZoom
    }

    controller.enableTilt = false
    controller.enableRotate = false
    controller.enableTranslate = false
    controller.enableZoom = false
    this.restoreControllerState = () => {
      Object.assign(controller, restoredState)
    }

    const targetPitchRadians = SuperMap3D.Math.toRadians(targetPitch)
    const stepRadians = Math.PI * 0.02

    this.tickHandler = () => {
      const savedTransform = SuperMap3D.Matrix4.clone(
        camera.transform,
        new SuperMap3D.Matrix4()
      )

      if (targetPitch === -90) {
        if (camera.pitch > targetPitchRadians + stepRadians) {
          camera.lookAtTransform(targetTransform)
          camera.rotateUp(-stepRadians)
          camera.lookAtTransform(savedTransform)
          return
        }
      } else if (targetPitch === -30) {
        if (camera.pitch < targetPitchRadians - stepRadians) {
          camera.lookAtTransform(targetTransform)
          camera.rotateUp(stepRadians)
          camera.lookAtTransform(savedTransform)
          return
        }
      }

      this.clear()
      this.setCurrentMode(nextMode)
      callback()
    }

    viewer.clock.onTick.addEventListener(this.tickHandler)
  }
}
