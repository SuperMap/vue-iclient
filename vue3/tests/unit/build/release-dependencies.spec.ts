import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parse } from 'vue/compiler-sfc'
import ts from 'typescript'
import { describe, expect, it, vi } from 'vitest'

// 隔离 workspace 和构建命令初始化，依赖内容仍从真实发布清单读取。
vi.mock('@supermapgis/build-utils', async () => {
  const { readFileSync } = await import('node:fs')
  const { fileURLToPath } = await import('node:url')
  const packagePath = fileURLToPath(new URL('../../../packages/mapboxgl/package.json', import.meta.url))
  return {
    getPkgByCommand: () => 'mapboxgl',
    getPackage: () => packagePath,
    getPackageDependencies: (manifestPath: string) => {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
      return {
        dependencies: Object.keys(manifest.dependencies ?? {}),
        peerDependencies: Object.keys(manifest.peerDependencies ?? {})
      }
    }
  }
})

import { generateExternal } from '../../../tools/build/src/utils/rollup'

const manifestPath = new URL('../../../packages/mapboxgl/package.json', import.meta.url)
const componentPath = new URL(
  '../../../packages/mapboxgl/components/coordinate-conversion/coordinate-conversion.vue',
  import.meta.url
)
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const { descriptor } = parse(readFileSync(componentPath, 'utf8'))
const scripts = [descriptor.script, descriptor.scriptSetup].filter(script => script !== null)
const runtimePackages = new Set<string>()

for (const script of scripts) {
  const ast = ts.createSourceFile(fileURLToPath(componentPath), script.content, ts.ScriptTarget.Latest, true)
  for (const statement of ast.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
      continue
    }
    const clause = statement.importClause
    const bindings = clause?.namedBindings
    if (clause?.isTypeOnly || (bindings && ts.isNamedImports(bindings) &&
      !clause.name && bindings.elements.length > 0 && bindings.elements.every(item => item.isTypeOnly))) {
      continue
    }
    const id = statement.moduleSpecifier.text
    if (id.startsWith('.') || id.startsWith('/') || /^@supermapgis\/(common|mapboxgl)(\/|$)/.test(id)) {
      continue
    }
    runtimePackages.add(id.split('/').slice(0, id.startsWith('@') ? 2 : 1).join('/'))
  }
}

describe('coordinate conversion release dependencies', () => {
  it('discovers the real third-party runtime imports', () => {
    expect([...runtimePackages]).toEqual(expect.arrayContaining(['clipboard', 'utm', 'latlng-conv']))
  })

  it.each([...runtimePackages])('declares %s in the package consumed by npm', dependency => {
    expect(Object.hasOwn({ ...manifest.dependencies, ...manifest.peerDependencies }, dependency)).toBe(true)
  })

  it.each([...runtimePackages])('externalizes declared runtime dependency %s', async dependency => {
    const external = await generateExternal()
    expect(external(dependency)).toBe(true)
    expect(external(`${dependency}/entry`)).toBe(true)
  })
})
