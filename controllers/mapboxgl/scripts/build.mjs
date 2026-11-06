import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { execFileSync } from 'node:child_process'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import glob from 'fast-glob'
import { rollup } from 'rollup'

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const ts = require('typescript')
const manifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'))
const publishedPackageName = manifest.name
const distRoot = path.join(packageRoot, 'dist')
const mapboxOutputRoot = path.join(distRoot, 'mapboxgl')
const staticOutputRoot = path.join(distRoot, 'static')
const staticRoot = path.resolve(packageRoot, '../../static')

const generatedPaths = [distRoot, ...['controllers', 'mixin', 'types', 'utils', 'index.js', 'core', 'mapboxgl', 'static'].map(name => path.join(packageRoot, name))]
for (const generatedPath of generatedPaths) {
  const relativePath = path.relative(packageRoot, generatedPath)
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(`Refusing to clean a path outside the package: ${generatedPath}`)
  }
}
// 清理上一次构建的 dist 和旧版包根输出，避免发布物同时残留两套目录结构。
await Promise.all(generatedPaths.map(generatedPath => rm(generatedPath, { recursive: true, force: true })))

const coreBuildScript = path.resolve(packageRoot, '../../core/scripts/build.mjs')
execFileSync(process.execPath, [coreBuildScript], {
  cwd: path.dirname(path.dirname(coreBuildScript)),
  stdio: 'inherit'
})

const tsc = require.resolve('typescript/bin/tsc', { paths: [packageRoot] })
execFileSync(process.execPath, [tsc, '-p', path.join(packageRoot, 'tsconfig.package.json')], {
  cwd: packageRoot,
  stdio: 'inherit'
})

const input = await glob(
  ['index.ts', 'src/**/*.{js,ts}', '!**/*.d.ts', '!**/__tests__/**', '!node_modules/**', '!dist/**'],
  {
    cwd: packageRoot,
    absolute: true,
    onlyFiles: true
  }
)
if (input.length === 0) {
  throw new Error('No MapboxGL controller source files were found for the package build.')
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
const mapboxglRuntimeAlias = {
  name: 'mapboxgl-runtime-alias',
  transform(code, id) {
    if (!/\.[jt]s$/.test(id) || id.endsWith('.d.ts')) {
      return null
    }
    // 发布包自带增强版 MapboxGL，运行时代码应从同包 static 目录加载；类型声明仍使用 mapbox-gl 类型。
    const enhancedMapboxglPath = `${publishedPackageName}/static/libs/mapboxgl/mapbox-gl-enhance.js`
    const rewrittenCode = code
      .replace(/(\bfrom\s*)(['"])mapbox-gl\2/g, `$1'${enhancedMapboxglPath}'`)
      .replace(/(\bimport\s*)(['"])mapbox-gl\2/g, `$1'${enhancedMapboxglPath}'`)
    return rewrittenCode === code ? null : { code: rewrittenCode, map: null }
  }
}
const bundle = await rollup({
  input,
  external,
  treeshake: false,
  plugins: [
    transpileSource,
    mapboxglRuntimeAlias,
    nodeResolve({ extensions: ['.mjs', '.js', '.json', '.ts'] }),
    commonjs(),
    json()
  ]
})

await bundle.write({
  dir: mapboxOutputRoot,
  format: 'es',
  preserveModules: true,
  preserveModulesRoot: packageRoot,
  entryFileNames: '[name].js',
  sourcemap: false
})
await bundle.close()

await writeFile(path.join(mapboxOutputRoot, 'src', 'index.js'), "export * from '../index.js';\n")
await mkdir(staticOutputRoot, { recursive: true })
for (const directory of ['assets', 'libs']) {
  await cp(path.join(staticRoot, directory), path.join(staticOutputRoot, directory), { recursive: true })
}
// 保留原始 UMD 静态文件供脚本直链使用，同时为包导入生成 ESM，避免宿主按 ESM 解析 UMD 时丢失默认导出。
const staticLibraryExports = Object.values(manifest.exports)
  .map(entry => entry?.default)
  .filter(target => typeof target === 'string' && target.startsWith('./dist/static/libs/') && target.endsWith('.js'))
for (const target of staticLibraryExports) {
  const relativePath = path.relative('./dist/static/libs', target)
  const staticBundle = await rollup({
    input: path.join(staticRoot, 'libs', relativePath),
    external,
    plugins: [commonjs({ esmExternals: true, requireReturnsDefault: 'namespace' })]
  })
  await staticBundle.write({
    file: path.join(staticOutputRoot, 'libs', relativePath.replace(/\.js$/, '.module.js')),
    format: 'es'
  })
  await staticBundle.close()
}
// 类型增强必须在控制器源码旁解析其 mapbox-gl 依赖，发布时再复制到静态资源的公开路径。
await cp(
  path.join(packageRoot, 'typings', 'mapbox-gl-enhance.d.ts'),
  path.join(staticOutputRoot, 'libs', 'mapboxgl', 'mapbox-gl-enhance.d.ts')
)

const publishedManifest = JSON.parse(JSON.stringify(manifest))
const rewritePublishedPaths = value => {
  if (Array.isArray(value)) {
    return value.map(rewritePublishedPaths)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, rewritePublishedPaths(child)]))
  }
  if (typeof value === 'string') {
    return value.replace(/^\.\/dist\//, './').replace(/^dist\//, '')
  }
  return value
}
// 工作区清单从仓库根解析 dist；发布清单位于 dist 根，因此其入口要改成包内相对路径。
publishedManifest.main = rewritePublishedPaths(publishedManifest.main)
publishedManifest.module = rewritePublishedPaths(publishedManifest.module)
publishedManifest.types = rewritePublishedPaths(publishedManifest.types)
publishedManifest.exports = rewritePublishedPaths(publishedManifest.exports)
publishedManifest.typesVersions = rewritePublishedPaths(publishedManifest.typesVersions)
for (const [key, entry] of Object.entries(publishedManifest.exports)) {
  if (entry && typeof entry === 'object' && typeof entry.default === 'string' && entry.default.startsWith('./static/libs/')) {
    entry.default = entry.default.replace(/\.js$/, '.module.js')
    if (!key.endsWith('.js')) {
      // Vue2 使用显式 .js 路径；两种导入写法必须命中同一模块和声明文件。
      publishedManifest.exports[`${key}.js`] = { ...entry }
      publishedManifest.typesVersions['*'][`${key.slice(2)}.js`] = publishedManifest.typesVersions['*'][key.slice(2)]
    }
  }
}
publishedManifest.files = ['mapboxgl', 'core', 'static', 'README.md']
delete publishedManifest.scripts
delete publishedManifest.devDependencies
await cp(path.join(packageRoot, 'README.md'), path.join(distRoot, 'README.md'))
await writeFile(path.join(distRoot, 'package.json'), `${JSON.stringify(publishedManifest, null, 2)}\n`)

console.log(`Built ${manifest.name}@${manifest.version} in ${path.relative(packageRoot, distRoot)}.`)
