import path from 'path'
import { parallel, series } from 'gulp'
import { rollup } from 'rollup'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import esbuild from 'rollup-plugin-esbuild'
import glob from 'fast-glob'
import { copy, remove } from 'fs-extra'
import {
  excludeFiles,
  getPkgRoot,
  getPkgByCommand,
  rootDir,
  getEpOutput,
  getPKG_NAME,
  PKG_PREFIX
} from '@supermapgis/build-utils'
import { generateExternal, withTaskName, writeBundles } from '../utils'
import { Alias } from '../plugins/alias'
import { buildConfigEntries, target } from '../build-info'
import json from '@rollup/plugin-json';
import type { TaskFunction } from 'gulp'
import type { OutputOptions, Plugin } from 'rollup'

const pkgName = getPkgByCommand(process.argv)
const pkgRoot = getPkgRoot(pkgName)
const pkgCommonRoot = getPkgRoot('common')
const epOutput = getEpOutput(pkgName)

/**
 * Monkey Patch Vue Compiler 以解决 __name 引用错误
 * 
 * 问题根源：
 * esbuild 在转译 TypeScript 代码时，即使设置了 keepNames: false，当 sourceMap 信息存在时，
 * 仍会在生成的 source map 元数据中包含 __name 函数引用（用于调试时保留函数名）。
 * 
 * 错误触发链路：
 * 1. esbuild 转译 .vue 文件中的 <script setup lang="ts"> 代码
 * 2. esbuild 生成的代码和 source map 中包含 __name 引用
 * 3. Vue 的 @vue/compiler-sfc 调用 compileScript 处理编译结果
 * 4. Vue compiler 尝试调用 mergeSourceMaps 合并多个转译阶段的 source maps
 * 5. source-map-js 库在解析 source map 时执行包含 __name 的代码模板（通过 eval）
 * 6. 由于 __name 函数在运行时环境中不存在，抛出 ReferenceError: __name is not defined
 * 
 * 解决方案：
 * 通过 monkey patch 拦截 @vue/compiler-sfc 的 compileScript 函数，
 * 强制设置 sourceMap: false，阻止 Vue compiler 尝试合并 source maps，
 * 从而避免执行包含 __name 引用的代码模板。
 * 
 * 注意：这是目前唯一有效的解决方案，因为：
 * - Vue 插件的 sourceMap 配置在内部会被覆盖或忽略
 * - esbuild 的 keepNames: false 只影响代码生成，不影响 source map 元数据
 * - 必须在 source map 被解析之前阻止其处理流程
 */
try {
  const Module = require('module')
  const originalRequire = Module.prototype.require
  Module.prototype.require = function(id: string) {
    const result = originalRequire.apply(this, arguments as any)
    if (id.includes('compiler-sfc') || id === '@vue/compiler-sfc') {
      if (result.compileScript && typeof result.compileScript === 'function') {
        const originalCompileScript = result.compileScript
        result.compileScript = function(sfc: any, options: any) {
          return originalCompileScript(sfc, {
            ...options,
            sourceMap: false
          })
        }
      }
    }
    return result
  }
} catch (e) {
  console.warn('Failed to patch Vue compiler:', e)
}
const plugins: Plugin[] = [
  Alias(),
  replace({
    'vue3/packages/common/': ``,
    [`vue3/packages/${pkgName}/`]: ``,
    // [`./${pkgName}/`]: './',
    // './common': '',
    preventAssignment: true
  }),
  {
    name: 'replace-chunk-during-render',
    renderChunk(code) {
      return code
        .replaceAll('./common/', './')
        .replaceAll(`./${pkgName}/`, './')
        .replaceAll('.scss', '.css')
        .replaceAll('vue-iclient-static/', `${PKG_PREFIX}/${getPKG_NAME(pkgName)}/static/`)
    }
  },
  vue({
    isProduction: true,
    template: {
      compilerOptions: {
        hoistStatic: false,
        cacheHandlers: false
      }
    }
  }) as Plugin,
  vueJsx() as Plugin,
  nodeResolve({
    extensions: ['.mjs', '.js', '.json', '.ts']
  }),
  commonjs({
    sourceMap: false
  }),
  esbuild({
    sourceMap: false,
    target,
    loaders: {
      '.vue': 'ts'
    }
  }),
  json()
]
async function buildModulesComponents(root = pkgRoot) {
  const files = await glob(['**/*.{js,ts,vue}', '!**/demo/*.{js,ts,vue}', '!**/style/(index|css).{js,ts,vue}'], {
    cwd: root,
    absolute: true,
    onlyFiles: true
  })
  const input = excludeFiles(files)
  const bundle = await rollup({
    input,
    plugins,
    external: await generateExternal(),
    treeshake: false
  })

  await writeBundles(
    bundle,
    buildConfigEntries.map(([module, config]): OutputOptions => {
      return {
        format: config.format,
        dir: config.output.path,
        exports: module === 'cjs' ? 'named' : undefined,
        preserveModules: true,
        preserveModulesRoot: root,
        sourcemap: false,
        entryFileNames: chunkInfo => {
          // 使用 path.basename 去掉 .vue 后缀
          const baseName = chunkInfo.name.replace('.vue', '')
          return `${baseName}.${config.ext}`
        },
        // entryFileNames: `[name].${config.ext}`,
        // chunkFileNames: '[name].[ext]'
      }
    })
  )
}

// async function buildModulesTools({ input, externalsConfig, folder, preserveModulesRoot }) {
//   const bundle = await rollup({
//     input,
//     plugins,
//     external: await generateExternal(),
//     treeshake: { moduleSideEffects: false },
//     onwarn(warning, warn) {
//       const { code, importer } = warning
//       if (code === 'CIRCULAR_DEPENDENCY' && importer.includes('ant-design-vue')) {
//         return
//       }
//       warn(warning)
//     }
//   })
//   await writeBundles(
//     bundle,
//     buildConfigEntries.map(([module, config]): OutputOptions => {
//       const dir =
//         folder !== 'components' ? path.resolve(config.output.path, folder) : config.output.path
//       const cfg: OutputOptions = {
//         format: config.format,
//         dir: dir,
//         exports: module === 'cjs' ? 'named' : undefined,
//         preserveModules: true,
//         preserveModulesRoot,
//         sourcemap: true,
//         entryFileNames: `[name].${config.ext}`
//       }
//       return cfg
//     })
//   )
// }
async function buildModulesStyles(rootDir, folder = 'components') {
  const root = path.resolve(rootDir, folder)
  const input = excludeFiles(
    await glob('**/style/(index|css).{js,ts,vue}', {
      cwd: root,
      absolute: true,
      onlyFiles: true
    })
  )
  const bundle = await rollup({
    input,
    plugins,
    treeshake: false,
    external: await generateExternal()
  })
  await writeBundles(
    bundle,
    buildConfigEntries.map(([module, config]): OutputOptions => {
      return {
        format: config.format,
        dir: path.resolve(config.output.path, 'components'),
        exports: module === 'cjs' ? 'named' : undefined,
        preserveModules: true,
        preserveModulesRoot: root,
        sourcemap: false,
        entryFileNames: `[name].${config.ext}`
      }
    })
  )
}

async function copyStatic() {
  await copy(path.resolve(rootDir, 'static'), path.resolve(epOutput, 'static'))
  await remove(path.join(epOutput, 'static', 'package.json'))
}

/** 将 components 下 assets 目录中的静态资源同步到 es / lib，供 import.meta.url / 相对路径引用 */
async function copyComponentAssets(root: string) {
  const assetFiles = await glob(['**/assets/**/*'], {
    cwd: root,
    absolute: true,
    onlyFiles: true,
    ignore: ['**/demo/**', '**/node_modules/**']
  })
  await Promise.all(
    assetFiles.map(async file => {
      const relativePath = path.relative(root, file)
      await Promise.all(
        buildConfigEntries.map(([, config]) =>
          copy(file, path.resolve(config.output.path, relativePath))
        )
      )
    })
  )
}

async function buildStyles() {
  await buildModulesStyles(pkgRoot)
  await buildModulesStyles(pkgCommonRoot)
}

async function removeMoreModules() {
  await remove(path.join(epOutput, 'lib', 'vue3'))
  await remove(path.join(epOutput, 'es', 'vue3'))
  await remove(path.join(epOutput, 'lib', 'static'))
  await remove(path.join(epOutput, 'es', 'static'))
}
export const buildModules: TaskFunction = parallel(
  series(
    withTaskName('buildPkgModules', () => buildModulesComponents(pkgRoot)),
    withTaskName('buildCommonModules', () => buildModulesComponents(pkgCommonRoot)),
    removeMoreModules,
    withTaskName('copyPkgComponentAssets', () => copyComponentAssets(pkgRoot)),
    withTaskName('copyCommonComponentAssets', () => copyComponentAssets(pkgCommonRoot)),
    copyStatic,
    buildStyles
  )
)
