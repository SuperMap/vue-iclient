import path from 'path'
import { Transform } from 'stream'
import chalk from 'chalk'
import { type TaskFunction, dest, parallel, src, series } from 'gulp'
import gulpSass from 'gulp-sass'
import dartSass from 'sass'
import autoprefixer from 'gulp-autoprefixer'
import consola from 'consola'
import postcss from 'postcss'
import cssnano from 'cssnano'
import type Vinly from 'vinyl'
import { getEpOutput, getThemeRoot, getPkgByCommand } from '@supermapgis/build-utils'
import { withTaskName } from '../utils'

const sass = gulpSass(dartSass)
const pkgName = getPkgByCommand(process.argv)
const epOutput = getEpOutput(pkgName)
const themeRoot = getThemeRoot(pkgName)
const themeCommonRoot = getThemeRoot('common')
const distBundle = path.resolve(epOutput, 'theme-chalk')
const distFolder = path.resolve(themeRoot, 'dist')
const distCommonFolder = path.resolve(themeCommonRoot, 'dist')

/**
 * using `postcss` and `cssnano` to compress CSS
 * @returns
 */
function compressWithCssnano() {
  const processor = postcss([
    cssnano({
      preset: [
        'default',
        {
          // avoid color transform
          colormin: false,
          // avoid font transform
          minifyFontValues: false
        }
      ]
    })
  ])
  return new Transform({
    objectMode: true,
    transform(chunk, _encoding, callback) {
      const file = chunk as Vinly
      if (file.isNull()) {
        callback(null, file)
        return
      }
      if (file.isStream()) {
        callback(new Error('Streaming not supported'))
        return
      }
      const cssString = file.contents!.toString()
      processor.process(cssString, { from: file.path }).then(result => {
        const name = path.basename(file.path)
        file.contents = Buffer.from(result.css)
        consola.success(
          `${chalk.cyan(name)}: ${chalk.yellow(
            cssString.length / 1000
          )} KB -> ${chalk.green(result.css.length / 1000)} KB`
        )
        callback(null, file)
      })
    }
  })
}

/**
 * compile theme-chalk scss & minify
 * not use sass.sync().on('error', sass.logError) to throw exception
 * @returns
 */
function buildTheme(filePath: string, distFolder: string) {
  return src(filePath + '/*.scss')
    .pipe(
      sass({
        loadPaths: [path.resolve(__dirname, '..', '..', '..', '..', 'node_modules')]
      }).on('error', sass.logError)
    )
    .pipe(autoprefixer({ cascade: false }))
    .pipe(compressWithCssnano())
    .pipe(dest(distFolder))
}

/**
 * TODO: 暗色主题
 * @returns
 */
// function buildDarkCssVars(distFolder: string) {
//   // const sass = gulpSass(dartSass)
//   return src(path.resolve(__dirname, 'src/dark/css-vars.scss'))
//     .pipe(
//       sass({
//         loadPaths: [path.resolve(__dirname, '..', '..', '..', '..', 'node_modules')]
//       }).on('error', sass.logError)
//     )
//     .pipe(autoprefixer({ cascade: false }))
//     .pipe(compressWithCssnano())
//     .pipe(dest(`${distFolder}/dark`))
// }

/**
 * copy from packages/mapboxgl/theme-chalk/dist to dist/vue3-iclient-mapboxgl/theme-chalk
 */
export function copyThemeChalkBundle(distFolder: string, distBundle: string) {
  return src(`${distFolder}/**`).pipe(dest(distBundle))
}

/**
 * copy source file to packages
 */

// export function copyThemeChalkSource() {
//   return src(path.resolve(__dirname, 'src/**')).pipe(dest(path.resolve(distBundle, 'src')))
// }

export const buildThemeChalk: TaskFunction = parallel(
  // copyThemeChalkSource,
  // series(buildThemeChalk, buildDarkCssVars, copyThemeChalkBundle)
  series(
    withTaskName('buildCommonTheme', () => buildTheme(themeCommonRoot, distCommonFolder)),
    withTaskName('CopyCommonTheme', () => copyThemeChalkBundle(distCommonFolder, distBundle))
  ),
  series(
    withTaskName('buildTheme', () => buildTheme(themeRoot, distFolder)),
    withTaskName('CopyTheme', () => copyThemeChalkBundle(distFolder, distBundle))
  )
)
