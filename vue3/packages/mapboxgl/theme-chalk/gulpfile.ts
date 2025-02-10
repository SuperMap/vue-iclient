import path from 'path'
import { Transform } from 'stream'
import chalk from 'chalk'
import { type TaskFunction, dest, parallel, series, src } from 'gulp'
import gulpSass from 'gulp-sass'
import dartSass from 'sass'
import autoprefixer from 'gulp-autoprefixer'
import consola from 'consola'
import postcss from 'postcss'
import cssnano from 'cssnano'
import type Vinly from 'vinyl'
import { getEpOutput } from '@supermapgis/build-utils'

const pkgName = __dirname.includes('mapboxgl') ? 'mapboxgl' : 'leaflet'
const epOutput = getEpOutput(pkgName)

/** TODO: dist css bundle */
const distFolder = path.resolve(__dirname, 'dist')
const distBundle = path.resolve(epOutput, 'theme-chalk')

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
function buildThemeChalk() {
  const sass = gulpSass(dartSass)
  return src(path.resolve(__dirname, '*.scss'))
    .pipe(sass.sync())
    .pipe(autoprefixer({ cascade: false }))
    .pipe(compressWithCssnano())
    .pipe(dest(distFolder))
}

/**
 * TODO: 暗色主题
 * @returns
 */
function buildDarkCssVars() {
  const sass = gulpSass(dartSass)
  return src(path.resolve(__dirname, 'src/dark/css-vars.scss'))
    .pipe(sass.sync())
    .pipe(autoprefixer({ cascade: false }))
    .pipe(compressWithCssnano())
    .pipe(dest(`${distFolder}/dark`))
}

/**
 * copy from packages/mapboxgl/theme-chalk/dist to dist/vue-iclient-mapboxgl/theme-chalk
 */
export function copyThemeChalkBundle() {
  return src(`${distFolder}/**`).pipe(dest(distBundle))
}

/**
 * copy source file to packages
 */

// export function copyThemeChalkSource() {
//   return src(path.resolve(__dirname, 'src/**')).pipe(dest(path.resolve(distBundle, 'src')))
// }

export const build: TaskFunction = parallel(
  // copyThemeChalkSource,
  // series(buildThemeChalk, buildDarkCssVars, copyThemeChalkBundle)
  series(buildThemeChalk, copyThemeChalkBundle)
)

export default build
