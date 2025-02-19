import { getPkgByCommand, getPKG_NAME, PKG_PREFIX, rootDir } from '@supermapgis/build-utils'
import path from 'path'
import type { Plugin } from 'rollup'

const pkgName = getPkgByCommand(process.argv)
const PKG_NAME = getPKG_NAME(pkgName)
// export function Alias(): Plugin {
//   const themeChalk = 'theme-chalk'
//   const sourceCommonThemeChalk = `${PKG_PREFIX}/common/${themeChalk}` as const
//   const sourceThemeChalk = `${PKG_PREFIX}/${pkgName}/${themeChalk}` as const
//   const bundleThemeChalk = `${PKG_PREFIX}/${PKG_NAME}/${themeChalk}` as const

//   return {
//     name: 'sm-alias-plugin',
//     resolveId(id) {
//       if (!(id.startsWith(sourceThemeChalk) || id.startsWith(sourceCommonThemeChalk))) return
//       return {
//         id: id
//           .replaceAll(sourceThemeChalk, bundleThemeChalk)
//           .replaceAll(sourceCommonThemeChalk, bundleThemeChalk),
//         external: 'absolute'
//       }
//     }
//   }
//   // const sourceCore = `vue-iclient-core` as const
//   // const sourceCommon = `${PKG_PREFIX}/common/` as const
//   // const source = `${PKG_PREFIX}/${pkgName}/` as const
//   // const sourceCommonComp = `${PKG_PREFIX}/vue-iclient-common` as const
//   // return {
//   //   name: 'alias-plugin',
//   //   resolveId(id) {
//   //     if (
//   //       !(
//   //         id.startsWith(sourceCommon) ||
//   //         id.startsWith(source) ||
//   //         id.startsWith(sourceCommonComp) ||
//   //         id.startsWith(sourceCore)
//   //       )
//   //     )
//   //       return
//   //     const idStr = id
//   //       .replaceAll(sourceCore, `${PKG_PREFIX}/${PKG_NAME}/core`)
//   //       .replaceAll(source, `${PKG_PREFIX}/${PKG_NAME}/`)
//   //       .replaceAll(sourceCommonComp, `${PKG_PREFIX}/${PKG_NAME}`)
//   //       .replaceAll(sourceCommon, `${PKG_PREFIX}/${PKG_NAME}/`)
//   //     return {
//   //       id: idStr,
//   //       external: 'absolute'
//   //     }
//   //   }
//   // }

// }
export function Alias(): Plugin {
  const themeChalk = 'theme-chalk'
  const sourceCommonThemeChalk = `${PKG_PREFIX}/common/${themeChalk}` as const
  const sourceThemeChalk = `${PKG_PREFIX}/${pkgName}/${themeChalk}` as const
  const bundleThemeChalk = `${PKG_PREFIX}/${PKG_NAME}/${themeChalk}` as const

  return {
    name: 'alias-plugin',
    resolveId(id, importer) {
      if (id.startsWith(sourceCommonThemeChalk) || id.startsWith(sourceThemeChalk)) {
        const idStr = id
          .replaceAll(sourceThemeChalk, bundleThemeChalk)
          .replaceAll(sourceCommonThemeChalk, bundleThemeChalk)
          .replaceAll('.scss', '.css')
        return {
          id: idStr,
          external: 'absolute'
        }
      }
      if (importer) {
        const root = rootDir.replace(/\\/g, '/')
        const basename = path.basename(importer)
        const pathId = importer
          .replace(/\\/g, '/')
          .replace(root + '/', '')
          .replace('vue3/packages/common/components/', '')
          .replace('vue3/packages/common/', '')
          .replace(`vue3/packages/${pkgName}/components/`, '')
          .replace(`vue3/packages/${pkgName}/`, '')
          .replace(`/${basename}`, '')
          .replace(`${basename}`, '')
        const resolvePath = pathId ? pathId.split('/').map(() => '..') : []
        if (id.startsWith(`${PKG_PREFIX}/vue-iclient-common`)) {
          const idStr = id.replaceAll(
            `${PKG_PREFIX}/vue-iclient-common/`,
            `${resolvePath.join('/')}/`
          )
          return {
            id: idStr,
            external: 'absolute'
          }
        }
        if (id.startsWith(`${PKG_PREFIX}/common`) && !id.startsWith(sourceCommonThemeChalk)) {
          const idStr = id.replaceAll(`${PKG_PREFIX}/common/`, `${resolvePath.join('/')}/`)
          return {
            id: idStr,
            external: 'absolute'
          }
        }
        if (id.startsWith(`${PKG_PREFIX}/${pkgName}`) && !id.startsWith(sourceThemeChalk)) {
          const idStr = id.replaceAll(`${PKG_PREFIX}/${pkgName}/`, `${resolvePath.join('/')}/`)
          return {
            id: idStr,
            external: 'absolute'
          }
        }
        if (id.startsWith(`vue-iclient-core`)) {
          const idStr = id.replaceAll('vue-iclient-core/', `${resolvePath.join('/')}/core/`)
          return {
            id: idStr,
            external: 'absolute'
          }
        }
        return
      }
      return
    }
  }
}
export function FullAlias(): Plugin {
  const themeChalk = 'theme-chalk'
  const sourceCommonThemeChalk = `${PKG_PREFIX}/common/${themeChalk}` as const
  const sourceThemeChalk = `${PKG_PREFIX}/${pkgName}/${themeChalk}` as const
  const bundleThemeChalk = `${PKG_PREFIX}/${PKG_NAME}/${themeChalk}` as const
  return {
    name: 'alias-plugin',
    resolveId(id) {
      if (!(id.startsWith(sourceCommonThemeChalk) || id.startsWith(sourceThemeChalk))) return
      const idStr = id
        .replaceAll(sourceThemeChalk, bundleThemeChalk)
        .replaceAll(sourceCommonThemeChalk, bundleThemeChalk)

      return {
        id: idStr,
        external: 'absolute'
      }
    }
  }
}
