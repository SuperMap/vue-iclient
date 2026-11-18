// 坐标转换组件依赖的第三方无类型包，补齐最小类型声明，避免因 checkJs 拉取 node_modules 源码。
declare module 'utm' {
  export interface UtmResult {
    easting: number
    northing: number
    zoneNum: number
    zoneLetter: string
  }
  export function fromLatLon(latitude: number, longitude: number, forceZoneNum?: number): UtmResult
  export function toLatLon(
    easting: number | string,
    northing: number | string,
    zoneNum: number,
    zoneLetter?: string,
    northern?: boolean,
    strict?: boolean
  ): { latitude: number; longitude: number }
}

declare module 'latlng-conv' {
  export function dd2dms(value: number, type: string): any
  export function dd2ddm(value: number, type: string): any
  export function format(dms: any): string
  export function parse(dms: string): any
  export function dms2dd(dms: any): number
  export function ddm2dd(ddm: any): number
}

declare module 'clipboard' {
  export default class ClipboardJS {
    constructor(trigger: string | Element | NodeList, options?: any)
    on(event: string, handler: (...args: any[]) => void): void
    destroy(): void
  }
}
