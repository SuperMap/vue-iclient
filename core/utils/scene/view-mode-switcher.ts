interface SceneViewModeSwitcherControllerOptions {
  getViewer: () => any
  getForceScene3D?: () => boolean | undefined
  getViewMode?: () => '2D' | '3D' | string | undefined
}

export function createSceneViewModeSwitcherController(
  options: SceneViewModeSwitcherControllerOptions
) {
  let tickHandler: (() => void) | null = null
  let restoreControllerState: (() => void) | null = null

  const clear = () => {
    const viewer = options.getViewer()
    if (tickHandler && viewer?.clock?.onTick?.removeEventListener) {
      viewer.clock.onTick.removeEventListener(tickHandler)
    }
    tickHandler = null
    restoreControllerState?.()
    restoreControllerState = null
  }

  const rotateCameraPitch = (targetPitch: number, callback: () => void = () => {}) => {
    const viewer = options.getViewer()
    const SuperMap3D = (window as any).SuperMap3D
    if (!viewer?.scene?.camera || !SuperMap3D) {
      return
    }

    clear()

    if (options.getForceScene3D?.()) {
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
    restoreControllerState = () => {
      Object.assign(controller, restoredState)
    }

    const targetPitchRadians = SuperMap3D.Math.toRadians(targetPitch)
    const stepRadians = Math.PI * 0.02

    tickHandler = () => {
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

      clear()
      callback()
    }

    viewer.clock.onTick.addEventListener(tickHandler)
  }

  const switchTo2D = (callback?: () => void) => rotateCameraPitch(-90, callback)
  const switchTo3D = (callback?: () => void) => rotateCameraPitch(-30, callback)
  const toggle = (callback?: () => void) => {
    if (options.getViewMode?.() === '3D') {
      switchTo2D(callback)
      return
    }
    switchTo3D(callback)
  }

  return {
    clear,
    toggle,
    switchTo2D,
    switchTo3D
  }
}
