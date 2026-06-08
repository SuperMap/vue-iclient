import { Events } from 'vue-iclient-core/types/event/Events'

export interface SceneViewModeSwitcherOptions {
  viewer?: any
  forceScene3D?: boolean
  defaultViewMode?: '2D' | '3D'
}

export type SceneViewMode = '2D' | '3D'

export interface SceneViewModeSwitcherChangeEvent {
  currentMode: SceneViewMode
  previousMode: SceneViewMode
}

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

  get currentMode() {
    return this._currentMode
  }

  setViewer(viewer: any) {
    this.options.viewer = viewer
  }

  clear() {
    const viewer = this.options.viewer
    if (this.tickHandler && viewer?.clock?.onTick?.removeEventListener) {
      viewer.clock.onTick.removeEventListener(this.tickHandler)
    }
    this.tickHandler = null
    this.restoreControllerState?.()
    this.restoreControllerState = null
  }

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

  toggle(callback?: () => void) {
    if (this._currentMode === '3D') {
      this.switchTo2D(callback)
      return
    }
    this.switchTo3D(callback)
  }

  switchTo2D(callback?: () => void) {
    this.rotateCameraPitch(-90, '2D', callback)
  }

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

    // Align the final tilt capability with the target mode before snapshotting.
    // This matches the reference implementation: switching to 2D leaves tilt disabled,
    // switching back to 3D leaves tilt enabled.
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
