import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ImageRenderer from '@supermapgis/mapboxgl/components/legend/subs/image-renderer.vue'
import { loadSpriteImage } from '@supermapgis/mapboxgl/components/legend/subs/sprite'

// 雪碧图改为内存中构造，不走网络与 new Image
vi.mock('@supermapgis/mapboxgl/components/legend/subs/sprite', () => ({
  loadSpriteImage: vi.fn(),
  getLoadedSpriteMeta: vi.fn(() => undefined),
  loadSpriteMeta: vi.fn()
}))

const mockedLoadSpriteImage = vi.mocked(loadSpriteImage)

// jsdom 未安装 node-canvas，getContext('2d') 返回 null：
// 桩一个 2d 上下文，通过 drawImage 调用参数断言图案的裁剪与落位
function createMockContext() {
  return {
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    createPattern: vi.fn(),
    setLineDash: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn()
  }
}

let mockContext: ReturnType<typeof createMockContext>
let getContextSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  mockContext = createMockContext()
  getContextSpy = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(mockContext as unknown as CanvasRenderingContext2D)
})

afterEach(() => {
  getContextSpy.mockRestore()
  mockedLoadSpriteImage.mockReset()
  // attachTo 挂载的 canvas 留在 body 上会跨用例累积，手动清空
  document.body.innerHTML = ''
})

const SPRITE_URL = 'http://localhost:8080/iportal/web/maps/1866201310/sprites/sprite.png'

function buildStyle(
  sprite: { width: number; height: number; x?: number; y?: number },
  legendWidth = 100,
  legendHeight = 10
) {
  return {
    style: {
      type: 'image',
      shape: 'line',
      width: legendWidth,
      height: legendHeight,
      url: SPRITE_URL,
      sprite: { sdf: false, pixelRatio: 1, x: 0, y: 0, ...sprite }
    }
  }
}

async function mountLineRenderer(styleData: ReturnType<typeof buildStyle>) {
  const fakeImage = { width: 200, height: 100 } as unknown as HTMLImageElement
  mockedLoadSpriteImage.mockResolvedValue(fakeImage)
  // 组件内部通过 document.getElementById(canvasId) 取画布，必须挂到 body 上才能找到
  const wrapper = mount(ImageRenderer, { props: { styleData }, attachTo: document.body })
  await flushPromises()
  const canvas = wrapper.element as HTMLCanvasElement
  return { wrapper, canvas, fakeImage }
}

// drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) 调用参数中的落位部分
function getDrawImageDest(call: unknown[]) {
  return {
    sx: call[1],
    sy: call[2],
    sWidth: call[3],
    sHeight: call[4],
    dx: call[5],
    dy: call[6],
    dWidth: call[7],
    dHeight: call[8]
  }
}

describe('ImageRenderer 图片线符号', () => {
  it('使用外部传入的 height（10px），并按原始宽高比等比缩放图幅', async () => {
    // line-83030291: 100×32，缩放到高 10 后单幅宽 31.25
    const { canvas } = await mountLineRenderer(buildStyle({ width: 100, height: 32 }))

    expect(canvas.height).toBe(10)
    expect(canvas.style.height).toBe('10px')
    expect(canvas.width).toBe(100)
    expect(canvas.style.width).toBe('100px')
  })

  it('x 方向只整幅重复：100px 内放得下 3 幅（第 4 幅会显示一半）时只画 3 幅', async () => {
    const { fakeImage } = await mountLineRenderer(buildStyle({ width: 100, height: 32 }))

    const calls = mockContext.drawImage.mock.calls
    expect(calls).toHaveLength(3)
    calls.forEach(call => {
      const dest = getDrawImageDest(call)
      expect(dest.dHeight).toBe(10)
      expect(dest.dWidth).toBeCloseTo(31.25)
      expect(dest.dy).toBe(0)
    })
    expect(getDrawImageDest(calls[0]).dx).toBeCloseTo(0)
    expect(getDrawImageDest(calls[1]).dx).toBeCloseTo(31.25)
    expect(getDrawImageDest(calls[2]).dx).toBeCloseTo(62.5)
    // 源矩形取自雪碧图原符号（pixelRatio=1，原点 0,0）
    expect(calls[0][0]).toBe(fakeImage)
    expect(getDrawImageDest(calls[0]).sWidth).toBe(100)
    expect(getDrawImageDest(calls[0]).sHeight).toBe(32)
  })

  it('整幅恰好铺满 width 时（如 50×10、width=100）画 2 幅，不受浮点误差影响', async () => {
    const { canvas } = await mountLineRenderer(buildStyle({ width: 50, height: 10 }))

    expect(mockContext.drawImage).toHaveBeenCalledTimes(2)
    const calls = mockContext.drawImage.mock.calls
    expect(getDrawImageDest(calls[0]).dx).toBeCloseTo(0)
    expect(getDrawImageDest(calls[1]).dx).toBeCloseTo(50)
    expect(getDrawImageDest(calls[0]).dWidth).toBe(50)
    expect(canvas.width).toBe(100)
  })

  it('单幅缩放后比 width 还宽（line-49050801: 100×9）时仍画 1 幅，避免图例空白', async () => {
    // 100×9 缩放到高 10 后单幅宽约 111.11，超出图例线长 100
    const { canvas } = await mountLineRenderer(buildStyle({ width: 100, height: 9 }))

    expect(mockContext.drawImage).toHaveBeenCalledTimes(1)
    const dest = getDrawImageDest(mockContext.drawImage.mock.calls[0])
    expect(dest.dx).toBe(0)
    expect(dest.dHeight).toBe(10)
    expect(dest.dWidth).toBeCloseTo(111.11, 1)
    // 超出部分由画布边缘自然裁切
    expect(canvas.width).toBe(100)
    expect(canvas.height).toBe(10)
  })

  it('带偏移的雪碧图符号：源矩形坐标随 x/y 与 pixelRatio 定位', async () => {
    // line-49050801 在雪碧图中位于 x:100, y:0
    const styleData = {
      style: {
        type: 'image',
        shape: 'line',
        width: 100,
        height: 10,
        url: SPRITE_URL,
        sprite: { sdf: false, pixelRatio: 1, x: 100, y: 0, width: 100, height: 9 }
      }
    }
    await mountLineRenderer(styleData)

    const source = getDrawImageDest(mockContext.drawImage.mock.calls[0])
    expect(source.sx).toBe(100)
    expect(source.sy).toBe(0)
    expect(source.sWidth).toBe(100)
    expect(source.sHeight).toBe(9)
  })
})
