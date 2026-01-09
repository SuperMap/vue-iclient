import { vi } from 'vitest'

export default class CRS {
  constructor(epsgCode, wkt, extent, unit) {
    this.epsgCode = epsgCode
    this.wkt = wkt
    this.extent = extent
    this.unit = unit || 'degree'
  }

  getWKT() {
    return this.wkt
  }
}
CRS.get = () => {
  return { getWKT: vi.fn() }
}
CRS.set = vi.fn()
