import { getPackage, getPackageDependencies, getPkgByCommand, type ExternalList } from '@supermapgis/build-utils'

import type { OutputOptions, RollupBuild } from 'rollup'

const pkgName = getPkgByCommand(process.argv)
const epPackage = getPackage(pkgName)
export const generateExternal = async (options: { externals?: ExternalList } = {}, path = epPackage) => {
  const { dependencies, peerDependencies } = getPackageDependencies(path)
  return (id: string) => {
    if (!options.externals) {
      const packages: string[] = [...peerDependencies]
      packages.push('@vue', 'mapbox-gl', 'vue-iclient-static', ...dependencies)
      return [...new Set(packages)].some(pkg => id === pkg || id.startsWith(`${pkg}/`));
    }
    const matchOne = options.externals.some(pkg => pkg.match?.(id, pkg.id) ?? (id === pkg.id || id.startsWith(`${pkg.id}/`)))
    return matchOne;
  }
}

export function writeBundles(bundle: RollupBuild, options: OutputOptions[]) {
  return Promise.all(options.map(option => bundle.write(option)))
}

export function formatBundleFilename(name: string, minify: boolean, ext: string) {
  return `${name}${minify ? '.min' : ''}.${ext}`
}
