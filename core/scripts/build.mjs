import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { execFileSync } from 'node:child_process'
import { readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import glob from 'fast-glob'
import { rollup } from 'rollup'

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distRoot = path.resolve(packageRoot, '../controllers/mapboxgl/dist/core')
const legacyDistRoot = path.join(packageRoot, 'dist')
const require = createRequire(import.meta.url)
const ts = require('typescript')
const manifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'))
const publishedPackageName = '@supermapgis/iclient-components-core'

// core 是聚合包的内部模块，清理旧中间目录并直接把 JS 与声明写入聚合包 dist/core。
await Promise.all([
  rm(distRoot, { recursive: true, force: true }),
  rm(legacyDistRoot, { recursive: true, force: true })
])

const tsc = require.resolve('typescript/bin/tsc', { paths: [packageRoot] })
execFileSync(process.execPath, [tsc, '-p', path.join(packageRoot, 'tsconfig.package.json')], {
  cwd: packageRoot,
  stdio: 'inherit'
})

const input = await glob(['**/*.js', '**/*.ts', '!**/*.d.ts', '!**/__tests__/**', '!node_modules/**', '!dist/**', '!scripts/**', '!test/**'], {
  cwd: packageRoot,
  absolute: true,
  onlyFiles: true
})
if (input.length === 0) {
  throw new Error('No core source files were found for the package build.')
}

const externalPackages = [
  ...Object.keys(manifest.dependencies || {}),
  ...Object.keys(manifest.peerDependencies || {})
]
const external = id =>
  id === publishedPackageName ||
  id.startsWith(`${publishedPackageName}/`) ||
  externalPackages.some(name => id === name || id.startsWith(`${name}/`))
// 用 TypeScript 编译 API 转换源码，避免依赖需要额外启动子进程的转译服务。
const transpileSource = {
  name: 'typescript-source-transpiler',
  transform(code, id) {
    if (!/\.[jt]s$/.test(id) || id.endsWith('.d.ts')) {
      return null
    }
    const result = ts.transpileModule(code, {
      fileName: id,
      compilerOptions: {
        allowJs: true,
        experimentalDecorators: true,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2018
      }
    })
    return { code: result.outputText, map: null }
  }
}
const bundle = await rollup({
  input,
  external,
  treeshake: false,
  plugins: [
    transpileSource,
    nodeResolve({ extensions: ['.mjs', '.js', '.json', '.ts'] }),
    commonjs(),
    json()
  ]
})

await bundle.write({
  dir: distRoot,
  format: 'es',
  preserveModules: true,
  preserveModulesRoot: packageRoot,
  entryFileNames: '[name].js',
  sourcemap: false
})
await bundle.close()

console.log(`Built ESM-only shared core modules in ${path.relative(packageRoot, distRoot)}.`)
