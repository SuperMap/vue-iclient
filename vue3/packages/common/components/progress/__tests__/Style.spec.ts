import { mount } from '@vue/test-utils'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { fileURLToPath, URL as NodeURL } from 'node:url'
import { execFileSync } from 'node:child_process'
import { execPath } from 'node:process'
import { SmProgress } from '@supermapgis/common/components/progress'

const style = document.createElement('style')

beforeAll(() => {
  const commonRoot = new NodeURL('../../../', import.meta.url)
  // 在 Node 环境复用构建工作区的 Sass，避免 JSDOM 的 URL 类型影响编译器。
  style.textContent = execFileSync(execPath, ['-e', `
    const {createRequire}=require('node:module');
    const {pathToFileURL}=require('node:url');
    const path=require('node:path');
    const sass=createRequire(process.argv[1])('sass');
    const common=process.argv[2];
    process.stdout.write(sass.compile(path.join(common,'theme-chalk/progress.scss'), {
      importers:[{findFileUrl:url=>url.startsWith('@supermapgis/common/')
        ?pathToFileURL(path.join(common,url.slice('@supermapgis/common/'.length))):null}],
      logger:sass.Logger.silent
    }).css);
  `, fileURLToPath(new NodeURL('../../tools/build/package.json', commonRoot)), fileURLToPath(commonRoot)], {
    encoding: 'utf8', timeout: 15000
  })
})

afterAll(() => style.remove())

function normalizeColor(value: string) {
  const probe = document.createElement('span')
  probe.style.color = value
  document.body.appendChild(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

describe('Progress status text styles', () => {
  it.each([
    ['line', 'success'], ['line', 'exception'], ['circle', 'success'], ['circle', 'exception']
  ] as const)('keeps %s %s text aligned with the status color and restores normal text', async (type, state) => {
    const wrapper = mount(SmProgress, {
      attachTo: document.body,
      props: { type, size: type === 'circle' ? 144 : undefined, percent: 40 }
    })
    try {
      const text = wrapper.find('.sm-component-progress-text').element
      for (const status of ['normal', state, 'normal'] as const) {
        await wrapper.setProps({ status })
        await nextTick()
        document.head.appendChild(style)
        if (status === 'normal') {
          // JSDOM 不解析继承后的颜色，但可核对继承声明及根节点的实际文字色。
          expect(['inherit', getComputedStyle(wrapper.element).color]).toContain(getComputedStyle(text).color)
        } else {
          const graphic = wrapper.find(type === 'circle'
            ? '.sm-component-progress-circle-path'
            : '.sm-component-progress-bg').element
          const graphicColor = type === 'circle'
            ? getComputedStyle(graphic).stroke
            : getComputedStyle(graphic).backgroundColor
          expect(graphicColor).not.toBe('')
          expect(getComputedStyle(text).color).toBe(normalizeColor(graphicColor))
        }
      }
      await wrapper.setProps({ textColor: '#abcdef' })
      expect(getComputedStyle(wrapper.element).color).toBe('rgb(171, 205, 239)')
      expect(['inherit', 'rgb(171, 205, 239)']).toContain(getComputedStyle(text).color)
    } finally {
      wrapper.unmount()
    }
  })

  it.each([
    ['line', 'success'], ['line', 'exception'], ['circle', 'success'], ['circle', 'exception']
  ] as const)('honors explicit text color after changing the %s %s stroke and restores the state color when cleared', async (type, status) => {
    const wrapper = mount(SmProgress, {
      attachTo: document.body,
      props: { type, status, size: type === 'circle' ? 144 : undefined, percent: 40 }
    })
    const text = wrapper.find('.sm-component-progress-text').element
    const graphic = wrapper.find(type === 'circle'
      ? '.sm-component-progress-circle-path'
      : '.sm-component-progress-bg').element
    const graphicColor = () => type === 'circle'
      ? getComputedStyle(graphic).stroke
      : getComputedStyle(graphic).backgroundColor
    try {
      document.head.appendChild(style)
      const stateColor = getComputedStyle(text).color
      await wrapper.setProps({ strokeColor: '#eedd00' })
      expect(normalizeColor(graphicColor())).toBe('rgb(238, 221, 0)')
      expect(getComputedStyle(text).color).toBe(stateColor)
      for (const textColor of ['#ab00ef', '#123456']) {
        await wrapper.setProps({ textColor })
        expect(getComputedStyle(wrapper.element).color).toBe(normalizeColor(textColor))
        expect(['inherit', normalizeColor(textColor)]).toContain(getComputedStyle(text).color)
        expect(normalizeColor(graphicColor())).toBe('rgb(238, 221, 0)')
      }
      for (const emptyColor of [undefined, '']) {
        await wrapper.setProps({ textColor: '#ab00ef' })
        await wrapper.setProps({ textColor: emptyColor })
        expect(getComputedStyle(text).color).toBe(stateColor)
      }
      await wrapper.setProps({ strokeColor: undefined })
      expect(getComputedStyle(text).color).toBe(normalizeColor(graphicColor()))
    } finally {
      wrapper.unmount()
    }
  })
})
