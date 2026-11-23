import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import stylelint from 'stylelint'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const configFile = resolve(projectRoot, '.stylelintrc.json')
const styles = ['common/theme-chalk/progress.scss', 'mapboxgl/theme-chalk/coordinate-conversion.scss']

describe.each(styles)('%s', style => {
  const file = resolve(projectRoot, 'packages', style)

  it('passes stylelint without unused rule exceptions', async () => {
    const result = await stylelint.lint({
      files: [file],
      configFile,
      fix: false,
      reportNeedlessDisables: true
    })

    expect(result.results.flatMap(({ warnings }) => warnings)).toEqual([])
    expect(result.errored).toBe(false)
  }, 30000)

  it('still requires ordinary text to inherit its typography and color', async () => {
    // 在真实样式末尾追加违规声明，确保局部布局和状态色的豁免不会放开后续文本样式。
    const code = `${await readFile(file, 'utf8')}
.stylelint-regression {
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  line-height: 24px;
}
`
    const result = await stylelint.lint({ code, codeFilename: file, configFile, fix: false })
    const warnings = result.results.flatMap(({ warnings }) => warnings)

    expect(warnings.map(({ rule }) => rule)).toEqual(
      Array(4).fill('declaration-property-value-allowed-list')
    )
  })
})
