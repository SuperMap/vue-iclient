import type { ChartView, graphic } from 'echarts'
import NativeRadarView from 'echarts/lib/chart/radar/RadarView.js'

type RadarSymbol = InstanceType<typeof graphic.Circle> & { __isEmptyBrush?: boolean }
const RadarViewBase = NativeRadarView as typeof ChartView

class StyledRadarView extends RadarViewBase {
  override render(...args: Parameters<ChartView['render']>) {
    super.render(...args)
    const data = args[0].getData()
    data.eachItemGraphicEl((group, index) => {
      const style = data.getItemVisual(index, 'style')
      group.traverse(element => {
        const symbol = element as RadarSymbol
        if (!symbol.__isEmptyBrush) {
          return
        }
        // 原生空心圆 setColor 会重置描边；沿用原生几何和系列视觉，再恢复配置的描边。
        if (style.stroke) {
          symbol.setStyle('stroke', style.stroke)
        }
        if (style.lineWidth != null) {
          symbol.setStyle('lineWidth', style.lineWidth)
        }
      })
    })
  }
}

export const radarNodeStyleExtension = {
  install(registers: { registerChartView(view: typeof ChartView): void }) {
    registers.registerChartView(StyledRadarView)
  }
}
