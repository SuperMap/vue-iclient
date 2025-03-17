import findWorkspacePackages from '@pnpm/find-workspace-packages'
import { projRoot } from './paths'

import type { ProjectManifest } from '@pnpm/types'

export const getWorkspacePackages = () => findWorkspacePackages(projRoot)
export const getWorkspaceNames = async (dir = projRoot) => {
  const pkgs = await findWorkspacePackages(projRoot)
  return pkgs
    .filter(pkg => pkg.dir.startsWith(dir))
    .map(pkg => pkg.manifest.name)
    .filter((name): name is string => !!name)
}

export const getPackageManifest = (pkgPath: string) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(pkgPath) as ProjectManifest
}

export const getPackageName = (pkgPath: string): string => {
  const manifest = getPackageManifest(pkgPath)
  const { name } = manifest
  return name
}

export const getPackageDependencies = (
  pkgPath: string
): Record<'dependencies' | 'peerDependencies', string[]> => {
  const manifest = getPackageManifest(pkgPath)
  const { dependencies = {}, peerDependencies = {} } = manifest

  return {
    dependencies: Object.keys(dependencies),
    peerDependencies: Object.keys(peerDependencies)
  }
}

export const excludeFiles = (files: string[]) => {
  const excludes = ['node_modules', 'test', 'mock', 'gulpfile', 'dist', 'demo']
  return files.filter(path => {
    const position = path.startsWith(projRoot) ? projRoot.length : 0
    return !excludes.some(exclude => path.includes(exclude, position))
  })
}
export const getPkgByCommand = (processArgv: string[]) => {
  const minimist = require('minimist')
  const argv = minimist(processArgv.slice(2))
  return argv.pkg
}
