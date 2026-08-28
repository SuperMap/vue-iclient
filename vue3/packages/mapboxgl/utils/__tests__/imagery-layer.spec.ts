import { describe, expect, it } from 'vitest'
import { getImageryLayerName } from '../imagery-layer'

const t = (key: string) => key

describe('getImageryLayerName', () => {
  it('prefers imageryLayer.customName over URL-derived service name', () => {
    const name = getImageryLayerName(
      {
        customName: '自定义底图',
        imageryProvider: {
          url: 'https://iserver.supermap.io/iserver/services/map-china400/rest/maps/China_4326',
          tablename: 'https://iserver.supermap.io/iserver/services/map-china400/rest/maps/China_4326'
        }
      },
      t
    )
    expect(name).toBe('自定义底图')
  })

  it('falls back to rest map name when customName is empty', () => {
    const name = getImageryLayerName(
      {
        customName: '  ',
        imageryProvider: {
          url: 'https://iserver.supermap.io/iserver/services/map-china400/rest/maps/China_4326',
          tablename: '/iserver/services/map-china400/rest/maps/China_4326'
        }
      },
      t
    )
    expect(name).toBe('China_4326')
  })
})
