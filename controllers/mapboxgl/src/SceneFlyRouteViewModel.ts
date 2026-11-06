import mapboxgl from 'mapbox-gl'

export type SceneFlyRouteStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'stopped'
  | 'error'

export interface SceneFlyRouteStop {
  index: number
  name: string
}

export interface SceneFlyRouteOptions {
  fpfUrl: string
  playRate: number
  isLineVisible: boolean
  isStopVisible: boolean
}

const defaultOptions: SceneFlyRouteOptions = {
  fpfUrl: '',
  playRate: 1,
  isLineVisible: true,
  isStopVisible: true
}

function getSuperMap3D(): any {
  return typeof window === 'undefined' ? undefined : (window as any).SuperMap3D
}

export default class SceneFlyRouteViewModel extends mapboxgl.Evented {
  viewer: any = null

  routes: any = null

  flyManager: any = null

  stops: SceneFlyRouteStop[] = []

  status: SceneFlyRouteStatus = 'idle'

  options: SceneFlyRouteOptions

  private loadToken = 0

  private destroyed = false

  private savedView: any = null

  private stopArrivedHandler: ((routeStop: any) => void) | null = null

  private routeEntityCollection: any = null

  private routeEntitySnapshot: Set<any> | null = null

  private routeEntities: any[] = []

  private routeEntitiesCaptured = false

  constructor(options?: Partial<SceneFlyRouteOptions>) {
    super()
    this.options = { ...defaultOptions, ...(options || {}) }
  }

  get isPlaying(): boolean {
    return this.status === 'playing'
  }

  get isReady(): boolean {
    return !!this.flyManager && this.stops.length > 0
  }

  get currentStopIndex(): number {
    return this.flyManager?.currentStopIndex ?? 0
  }

  setViewer(viewer: any) {
    if (this.viewer && this.viewer !== viewer) {
      this.exit()
    }
    this.viewer = viewer
  }

  updateOptions(options?: Partial<SceneFlyRouteOptions>) {
    if (!options) {
      return
    }
    const prevFpfUrl = this.options.fpfUrl
    this.options = { ...this.options, ...options }
    if (options.playRate !== undefined) {
      this.setPlayRate(options.playRate)
    }
    if (
      options.isLineVisible !== undefined ||
      options.isStopVisible !== undefined
    ) {
      this.applyRouteOptions()
    }
    if ('fpfUrl' in options && this.options.fpfUrl !== prevFpfUrl) {
      if (this.options.fpfUrl) {
        this.load()
      } else {
        this.exit()
      }
    }
  }

  async load(fpfUrl?: string) {
    if (fpfUrl) {
      this.options.fpfUrl = fpfUrl
    }
    const url = this.options.fpfUrl
    if (!url || this.destroyed) {
      return
    }
    if (!this.viewer) {
      this.reportError(new Error('A scene viewer must be set before loading a flight route'))
      return
    }
    const SuperMap3D = getSuperMap3D()
    if (!SuperMap3D) {
      this.setStatus('error')
      this.reportError(new Error('SuperMap3D is not available'))
      return
    }
    if (this.status === 'playing' || this.status === 'paused') {
      this.stop()
    }
    const token = ++this.loadToken
    this.releaseFlyManager()
    this.stops = []
    this.setStatus('loading')
    try {
      this.routeEntityCollection = this.viewer.entities
      this.routeEntitySnapshot = new Set(this.routeEntityCollection?.values || [])
      this.routeEntities = []
      this.routeEntitiesCaptured = false
      this.routes = new SuperMap3D.RouteCollection(this.viewer.entities)
      const fromFile = this.routes.fromFile(url)
      if (fromFile && typeof fromFile.then === 'function') {
        await fromFile
      }
      if (this.isLoadInvalid(token)) {
        return
      }
      this.flyManager = new SuperMap3D.FlyManager({
        scene: this.viewer.scene,
        routes: this.routes
      })
      this.setPlayRate(this.options.playRate)
      this.bindStopArrived()
      await this.waitRoutesReady(this.routes, token)
      if (this.isLoadInvalid(token)) {
        return
      }
      this.applyRouteOptions()
      this.captureRouteEntities()
      this.syncStops()
      if (!this.stops.length) {
        throw new Error(`No flight stops were found in "${url}"`)
      }
      this.setStatus('ready')
    } catch (error) {
      if (this.isLoadInvalid(token)) {
        return
      }
      this.releaseFlyManager()
      this.stops = []
      this.fire('stopschange', { stops: [] })
      this.setStatus('error')
      this.reportError(error)
    }
  }

  play() {
    if (!this.flyManager || this.destroyed) {
      return
    }
    if (this.status !== 'paused') {
      this.saveView()
    }
    this.flyManager.play()
    this.setStatus('playing')
  }

  pause() {
    if (!this.flyManager || this.status !== 'playing') {
      return
    }
    this.flyManager.pause()
    this.setStatus('paused')
  }

  toggle() {
    if (this.status === 'playing') {
      this.pause()
    } else {
      this.play()
    }
  }

  stop() {
    if (!this.flyManager) {
      return
    }
    this.flyManager.stop()
    this.restoreSavedView()
    this.setStatus('stopped')
  }

  /** 退出漫游：停止飞行、释放资源、恢复漫游前的场景视角 */
  exit() {
    if (!this.flyManager && !this.routes) {
      return
    }
    if (this.status === 'playing' || this.status === 'paused') {
      this.restoreSavedView()
    }
    this.loadToken++
    this.releaseFlyManager()
    this.stops = []
    this.fire('stopschange', { stops: [] })
    this.setStatus('idle')
  }

  setPlayRate(playRate: number) {
    const value = Number(playRate)
    if (!Number.isFinite(value) || value <= 0) {
      this.reportError(new Error('Flight play rate must be a positive number'))
      return
    }
    this.options.playRate = value
    if (this.flyManager) {
      this.flyManager.playRate = value
    }
  }

  setLineVisible(isLineVisible: boolean) {
    this.options.isLineVisible = !!isLineVisible
    this.applyRouteOptions()
  }

  setStopVisible(isStopVisible: boolean) {
    this.options.isStopVisible = !!isStopVisible
    this.applyRouteOptions()
  }

  getStops(): SceneFlyRouteStop[] {
    return this.stops.map(stop => ({ ...stop }))
  }

  viewToStop(index: number) {
    const route = this.flyManager?.currentRoute
    if (!route) {
      return
    }
    if (!Number.isInteger(index) || index < 0) {
      this.reportError(new Error(`Invalid flight stop index: ${index}`))
      return
    }
    // 飞行中 viewToStop 不生效，必须先停止
    this.flyManager.stop()
    const stop = route.get(index)
    if (!stop) {
      return
    }
    this.flyManager.currentStopIndex = index
    this.flyManager.viewToStop(stop)
    this.setStatus('stopped')
  }

  destroy() {
    if (this.destroyed) {
      return
    }
    this.exit()
    this.destroyed = true
    this.viewer = null
    this.savedView = null
  }

  private reportError(error: Error | unknown) {
    this.fire('error', { error })
  }

  private setStatus(status: SceneFlyRouteStatus) {
    if (this.status === status) {
      return
    }
    this.status = status
    this.fire('statuschange', { status })
  }

  private isLoadInvalid(token: number): boolean {
    return this.destroyed || token !== this.loadToken
  }

  /** fpf 解析是异步的，轮询等待路线可用 */
  private waitRoutesReady(routes: any, token: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const start = Date.now()
      const check = () => {
        if (this.isLoadInvalid(token)) {
          resolve()
          return
        }
        const ready = routes?.ready === true || this.readRawStops().length > 0
        if (ready) {
          resolve()
          return
        }
        if (Date.now() - start > 20000) {
          reject(new Error('Timed out while loading flight route data'))
          return
        }
        setTimeout(check, 100)
      }
      check()
    })
  }

  private getRouteList(): any[] {
    const collection = this.routes?.routes ?? this.routes?.routeCollection ?? this.routes
    const length = collection?.length ?? collection?.routeCount ?? collection?._routes?.length ?? 0
    const list: any[] = []
    for (let i = 0; i < length; i++) {
      const route = typeof collection?.get === 'function' ? collection.get(i) : collection[i]
      if (route) {
        list.push(route)
      }
    }
    if (!list.length && this.flyManager?.currentRoute) {
      list.push(this.flyManager.currentRoute)
    }
    return list
  }

  private readRawStops(): any[] {
    const all = this.flyManager?.getAllRouteStops?.()
    if (all?.length) {
      return all
    }
    const raw: any[] = []
    this.getRouteList().forEach(route => {
      const count = route?.stopCollection?.length ?? route?.stopCount ?? 0
      for (let i = 0; i < count; i++) {
        const stop = typeof route?.get === 'function' ? route.get(i) : route?.stopCollection?.[i]
        if (stop) {
          raw.push(stop)
        }
      }
    })
    return raw
  }

  private syncStops() {
    const raw = this.readRawStops()
    this.stops = raw.map((stop: any, index: number) => ({
      index,
      name: stop?.name || `Stop ${index + 1}`
    }))
    this.fire('stopschange', { stops: this.getStops() })
    if (this.stops.length) {
      this.fire('ready', { stops: this.getStops() })
    }
  }

  private bindStopArrived() {
    if (!this.flyManager?.stopArrived?.addEventListener) {
      return
    }
    this.stopArrivedHandler = (routeStop: any) => {
      const rawStops = this.readRawStops()
      const stopIndex = rawStops.indexOf(routeStop)
      const index = stopIndex >= 0
        ? stopIndex
        : Number(routeStop?.index ?? this.flyManager?.currentStopIndex ?? 0)
      const stop = this.stops[index] ?? {
        index,
        name: `Stop ${index + 1}`
      }
      const isLastStop = stopIndex >= 0
        ? stopIndex === rawStops.length - 1
        : index === this.stops.length - 1
      if (this.status === 'playing' && isLastStop) {
        this.setStatus('ready')
      }
      this.fire('stoparrived', { index, stop })
    }
    this.flyManager.stopArrived.addEventListener(this.stopArrivedHandler)
  }

  private applyRouteOptions() {
    this.getRouteList().forEach(route => {
      try {
        route.isLineVisible = this.options.isLineVisible
        route.isStopVisible = this.options.isStopVisible
      } catch (error) {
        this.reportError(error)
      }
    })
  }

  private saveView() {
    const camera = this.viewer?.scene?.camera
    const SuperMap3D = getSuperMap3D()
    if (!camera || !SuperMap3D?.Cartesian3) {
      return
    }
    this.savedView = {
      position: SuperMap3D.Cartesian3.clone(camera.position),
      direction: SuperMap3D.Cartesian3.clone(camera.direction),
      up: SuperMap3D.Cartesian3.clone(camera.up)
    }
  }

  private restoreSavedView() {
    const camera = this.viewer?.scene?.camera
    const saved = this.savedView
    if (!camera || !saved) {
      return
    }
    try {
      camera.setView({
        destination: saved.position,
        orientation: { direction: saved.direction, up: saved.up }
      })
      this.savedView = null
    } catch (error) {
      this.reportError(error)
    }
  }

  private releaseFlyManager() {
    if (this.flyManager) {
      try {
        if (this.stopArrivedHandler && this.flyManager.stopArrived?.removeEventListener) {
          this.flyManager.stopArrived.removeEventListener(this.stopArrivedHandler)
        }
        this.flyManager.stop()
      } catch (error) {
        this.reportError(error)
      }
    }
    this.captureRouteEntities()
    this.stopArrivedHandler = null
    this.flyManager = null
    if (this.routes) {
      try {
        if (typeof this.routes.removeAll === 'function') {
          this.routes.removeAll()
        } else if (typeof this.routes.clear === 'function') {
          this.routes.clear()
        }
      } catch (error) {
        this.reportError(error)
      }
    }
    if (
      this.routeEntities.length &&
      typeof this.routeEntityCollection?.remove !== 'function'
    ) {
      this.reportError(new Error('The scene entity collection cannot remove flight route entities'))
    } else {
      this.routeEntities.forEach(entity => {
        try {
          this.routeEntityCollection.remove(entity)
        } catch (error) {
          this.reportError(error)
        }
      })
    }
    this.routeEntities = []
    this.routeEntitySnapshot = null
    this.routeEntityCollection = null
    this.routeEntitiesCaptured = false
    this.routes = null
  }

  private captureRouteEntities() {
    if (
      this.routeEntitiesCaptured ||
      !this.routeEntityCollection ||
      !this.routeEntitySnapshot
    ) {
      return
    }
    const entities = this.routeEntityCollection.values
    if (!Array.isArray(entities)) {
      return
    }
    this.routeEntities = entities.filter(entity => !this.routeEntitySnapshot?.has(entity))
    this.routeEntitiesCaptured = true
  }
}
