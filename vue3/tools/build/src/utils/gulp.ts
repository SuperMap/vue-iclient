import { buildRoot } from '@supermapgis/build-utils'
import { run } from './process'

import type { TaskFunction } from 'gulp'
import type { Pkg } from '@supermapgis/build-utils'

export const withTaskName = <T extends TaskFunction>(name: string, fn: T) =>
  Object.assign(fn, { displayName: name })

export const runTask = (name: string, pkgName: Pkg) =>
  withTaskName(`shellTask:${name}`, () => run(`pnpm run start ${name} --pkg=${pkgName}`, buildRoot))
