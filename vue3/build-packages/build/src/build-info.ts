import path from 'path'
import { getPKG_NAME } from '@supermapgis/build-utils'
import { getPkgByCommand, getEpOutput } from '@supermapgis/build-utils'

import type { ModuleFormat } from 'rollup'

const pkgName = getPkgByCommand(process.argv)
const epOutput = getEpOutput(pkgName)
const PKG_NAME = getPKG_NAME(pkgName)

export const modules = ['esm', 'cjs'] as const
export type Module = (typeof modules)[number]
export interface BuildInfo {
  module: 'ESNext' | 'CommonJS'
  format: ModuleFormat
  ext: 'mjs' | 'cjs' | 'js'
  output: {
    /** e.g: `es` */
    name: string
    /** e.g: `dist/element-plus/es` */
    path: string
  }

  bundle: {
    /** e.g: `element-plus/es` */
    path: string
  }
}

export const buildConfig: Record<Module, BuildInfo> = {
  esm: {
    module: 'ESNext',
    format: 'esm',
    ext: 'mjs',
    output: {
      name: 'es',
      path: path.resolve(epOutput, 'es')
    },
    bundle: {
      path: `${PKG_NAME}/es`
    }
  },
  cjs: {
    module: 'CommonJS',
    format: 'cjs',
    ext: 'js',
    output: {
      name: 'lib',
      path: path.resolve(epOutput, 'lib')
    },
    bundle: {
      path: `${PKG_NAME}/lib`
    }
  }
}
export const buildConfigEntries = Object.entries(buildConfig) as BuildConfigEntries

export type BuildConfig = typeof buildConfig
export type BuildConfigEntries = [Module, BuildInfo][]

export const target = 'es2018'
