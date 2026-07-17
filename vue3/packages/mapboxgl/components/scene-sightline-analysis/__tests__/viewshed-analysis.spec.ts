import {
  ViewShedAnalysis,
  type ViewShedInstance
} from 'vue-iclient-core/utils/scene/viewshed-analysis'

function createViewShed(viewPosition: [number, number, number]) {
  const positions: Array<[number, number, number]> = []
  const viewShed = {
    viewPosition,
    pointEntity: { show: true },
    setPosition(position: [number, number, number]) {
      positions.push(position)
      this.viewPosition = position
    }
  } as unknown as ViewShedInstance
  return { viewShed, positions }
}

describe('ViewShedAnalysis offset height', () => {
  beforeEach(() => {
    window.SuperMap3D = {
      Color: {
        fromCssColorString: (color: string) => color
      },
      Cartesian3: {
        fromDegrees: (longitude: number, latitude: number, height: number) => ({
          longitude,
          latitude,
          height
        })
      }
    }
  })

  it('updates from the original base height without cumulative drift', () => {
    const analysis = new ViewShedAnalysis({}, { offsetHeight: 10 })
    const { viewShed, positions } = createViewShed([120, 30, 110])
    ;(analysis as any).currentViewShed3D = viewShed

    analysis.setOffsetHeight(20)
    analysis.setOffsetHeight(30)

    expect(positions).toEqual([
      [120, 30, 120],
      [120, 30, 130]
    ])
    expect(positions[0]).not.toBe(positions[1])
    expect(viewShed.pointEntity?.position).toEqual({ longitude: 120, latitude: 30, height: 130 })
  })

  it('updates defaults safely before a view point is created', () => {
    const analysis = new ViewShedAnalysis({}, { offsetHeight: 10 })

    expect(() => analysis.setOffsetHeight(25)).not.toThrow()
    expect(analysis.options.offsetHeight).toBe(25)
  })

  it('updates the in-progress view shed before drawing is completed', () => {
    const analysis = new ViewShedAnalysis({}, { offsetHeight: 10 })
    const { viewShed } = createViewShed([120, 30, 110])
    ;(analysis as any).viewShedTool = { viewShed3D: viewShed, options: {} }

    analysis.setOffsetHeight(20)

    expect(viewShed.viewPosition).toEqual([120, 30, 120])
  })

  it('applies an offset supplied through updateOptions', () => {
    const analysis = new ViewShedAnalysis({}, { offsetHeight: 10 })
    const { viewShed } = createViewShed([120, 30, 110])
    ;(analysis as any).currentViewShed3D = viewShed

    analysis.updateOptions({ offsetHeight: 40 })

    expect(viewShed.viewPosition).toEqual([120, 30, 140])
  })

  it('rebuilds legacy instances that do not expose setPosition', () => {
    const analysis = new ViewShedAnalysis({}, { offsetHeight: 10 })
    const build = vi.fn()
    const viewShed = { viewPosition: [120, 30, 110], build } as unknown as ViewShedInstance
    ;(analysis as any).currentViewShed3D = viewShed

    analysis.setOffsetHeight(20)

    expect(viewShed.viewPosition).toEqual([120, 30, 120])
    expect(build).toHaveBeenCalledOnce()
  })
})
