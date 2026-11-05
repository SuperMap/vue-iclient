import assert from 'node:assert/strict'
import { access, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distRoot = path.join(packageRoot, 'dist')
const packageName = '@supermapgis/iclient-components-core'
const publishedDirectories = ['mapboxgl', 'core', 'static']

test('runtime dependencies are declared according to package ownership', async () => {
  const manifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'))
  const peerDependencies = Object.keys(manifest.peerDependencies).sort()
  const implementationDependencies = [
    '@turf/area',
    '@turf/bbox',
    '@turf/circle',
    '@turf/center',
    '@turf/envelope',
    '@turf/helpers',
    '@turf/length',
    '@turf/transform-scale',
    'fast-xml-parser',
    'lodash.assignin',
    'lodash.clonedeep',
    'lodash.debounce',
    'lodash.difference',
    'lodash.isequal',
    'lodash.max',
    'lodash.mergewith',
    'lodash.orderby',
    'lodash.tonumber',
    'lodash.uniqueid',
    'lodash.uniqby',
    'mapbox-gl-compare-enhanced',
    'omit.js',
    'ol',
    'simple-statistics',
    'tinycolor2'
  ]

  assert.deepEqual(peerDependencies, [
    '@supermapgis/iclient-common',
    '@supermapgis/iclient-mapboxgl',
    'echarts',
    'proj4'
  ].sort())
  for (const dependency of implementationDependencies) {
    assert.ok(manifest.dependencies[dependency], `${dependency} must be installed with the package`)
  }
  for (const dependency of ['@types/geojson', '@types/lodash', '@types/mapbox-gl']) {
    assert.ok(manifest.dependencies[dependency], `${dependency} must be available to package consumers`)
  }
  assert.equal(manifest.dependencies.geojson, undefined)
  assert.equal(manifest.peerDependencies.geojson, undefined)
  assert.equal(manifest.devDependencies['@types/geojson'], undefined)
})

async function findNestedPackageJson(directory) {
  const matches = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      matches.push(...(await findNestedPackageJson(entryPath)))
    } else if (entry.name === 'package.json') {
      matches.push(entryPath)
    }
  }
  return matches
}

async function findFiles(directory, extension) {
  const matches = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      matches.push(...(await findFiles(entryPath, extension)))
    } else if (entry.isFile() && path.extname(entry.name) === extension) {
      matches.push(entryPath)
    }
  }
  return matches
}

test('published controller paths contain usable ESM modules', async () => {
  const modulePath = path.join(distRoot, 'mapboxgl', 'src', 'types', 'CircleStyle.js')
  assert.equal(fileURLToPath(import.meta.resolve(`${packageName}/mapboxgl/src/types/CircleStyle`)), modulePath)
  const esmModule = await import(`${packageName}/mapboxgl/src/types/CircleStyle`)
  assert.equal(typeof esmModule.default, 'function')
  assert.equal(new esmModule.default().paint['circle-radius'], 6)
})

test('MapboxGL controllers use the enhanced runtime shipped in this package', async () => {
  const enhancedModulePath = path.join(distRoot, 'static', 'libs', 'mapboxgl', 'mapbox-gl-enhance.js')
  const panModulePath = path.join(distRoot, 'mapboxgl', 'src', 'PanViewModel.js')
  const panModule = await readFile(panModulePath, 'utf8')
  const mapboxglModules = await findFiles(path.join(distRoot, 'mapboxgl'), '.js')
  const modulesWithExternalMapboxImports = []

  for (const modulePath of mapboxglModules) {
    const source = await readFile(modulePath, 'utf8')
    if (/(?:from\s*|import\s*)['"]mapbox-gl['"]/.test(source)) {
      modulesWithExternalMapboxImports.push(path.relative(distRoot, modulePath))
    }
  }

  assert.match(
    panModule,
    new RegExp(`${packageName.replaceAll('/', '\\/')}\\/static\\/libs\\/mapboxgl\\/mapbox-gl-enhance\\.js`)
  )
  assert.deepEqual(modulesWithExternalMapboxImports, [])
  await access(enhancedModulePath)
  assert.equal(
    fileURLToPath(import.meta.resolve(`${packageName}/static/libs/mapboxgl/mapbox-gl-enhance.js`)),
    enhancedModulePath
  )
})

test('package contains only direct ESM paths for mapboxgl, core, and static', async () => {
  const workspaceManifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'))
  const manifest = JSON.parse(await readFile(path.join(distRoot, 'package.json'), 'utf8'))

  assert.equal(manifest.name, packageName)
  assert.equal(manifest.private, undefined)
  assert.equal(manifest.type, 'module')
  assert.deepEqual(workspaceManifest.files, ['dist'])
  assert.equal(workspaceManifest.exports['./mapboxgl/src'].types, './dist/mapboxgl/index.d.ts')
  assert.deepEqual(manifest.files, ['mapboxgl', 'core', 'static', 'README.md'])
  assert.equal(manifest.scripts, undefined)
  assert.equal(manifest.devDependencies, undefined)
  assert.equal(manifest.dependencies[packageName], undefined)
  assert.equal(manifest.main, './core/index.js')
  assert.equal(manifest.module, './core/index.js')
  assert.equal(manifest.types, './core/index.d.ts')
  assert.equal(manifest.exports['./mapboxgl/src'].types, './mapboxgl/index.d.ts')
  assert.equal(manifest.exports['./mapboxgl/src/types'].import, './mapboxgl/src/types/index.js')
  assert.equal(manifest.exports['./core/utils/scene'].import, './core/utils/scene/index.js')
  assert.equal(manifest.exports['./static/libs/json-sql/jsonsql'].default, './static/libs/json-sql/jsonsql.js')
  assert.deepEqual(
    Object.values(manifest.files).filter(entry => publishedDirectories.includes(entry)),
    publishedDirectories
  )
  for (const exportTarget of Object.values(manifest.exports)) {
    if (exportTarget && typeof exportTarget === 'object') {
      assert.equal('require' in exportTarget, false)
      assert.equal(Object.values(exportTarget).some(target => /(?:^|\/)esm(?:\/|$)|cjs/i.test(target)), false)
    }
  }
  assert.doesNotMatch(JSON.stringify(manifest.typesVersions), /(?:^|\/)dist\//)

  for (const directory of publishedDirectories) {
    await access(path.join(distRoot, directory))
    assert.deepEqual(await findNestedPackageJson(path.join(distRoot, directory)), [])
  }
  await access(path.join(distRoot, 'README.md'))
  await access(path.join(distRoot, 'mapboxgl', 'src', 'WebMapViewModel.js'))
  await access(path.join(distRoot, 'mapboxgl', 'src', 'WebMapViewModel.d.ts'))
  await access(path.join(distRoot, 'mapboxgl', 'index.js'))
  await access(path.join(distRoot, 'mapboxgl', 'index.d.ts'))
  await access(path.join(distRoot, 'core', 'index.js'))
  await access(path.join(distRoot, 'core', 'index.d.ts'))
  await assert.rejects(access(path.join(distRoot, 'core', 'static')))
  await access(path.join(distRoot, 'core', 'types', 'event', 'Events.js'))
  await access(path.join(distRoot, 'core', 'types', 'event', 'Events.d.ts'))
  await access(path.join(distRoot, 'core', 'utils', 'scene', 'index.js'))
  await access(path.join(distRoot, 'core', 'utils', 'scene', 'index.d.ts'))
  await access(path.join(distRoot, 'static', 'assets', 'iconfont', 'icon-sm-components.woff2'))
  await access(path.join(distRoot, 'static', 'libs', 'json-sql', 'jsonsql.js'))
  await access(path.join(distRoot, 'static', 'libs', 'Cesium', 'Workers'))
  assert.deepEqual(await findNestedPackageJson(distRoot), [path.join(distRoot, 'package.json')])
  assert.equal(
    fileURLToPath(import.meta.resolve(`${packageName}/core/utils/scene`)),
    path.join(distRoot, 'core', 'utils', 'scene', 'index.js')
  )
  assert.equal(
    fileURLToPath(import.meta.resolve(`${packageName}/static/libs/json-sql/jsonsql`)),
    path.join(distRoot, 'static', 'libs', 'json-sql', 'jsonsql.js')
  )
  await assert.rejects(access(path.join(distRoot, 'dist')))
  await assert.rejects(access(path.resolve(packageRoot, '../../core/dist')))
  await assert.rejects(access(path.join(distRoot, 'mapboxgl', 'esm')))
  await assert.rejects(access(path.join(distRoot, 'core', 'esm')))
  for (const oldOutput of ['mapboxgl', 'core', 'static']) {
    await assert.rejects(access(path.join(packageRoot, oldOutput)))
  }

  const webMapModule = await readFile(path.join(distRoot, 'mapboxgl', 'src', 'WebMapViewModel.js'), 'utf8')
  const coreModule = await readFile(path.join(distRoot, 'core', 'utils', 'json-sql-filter.js'), 'utf8')
  const drawDeclaration = await readFile(path.join(distRoot, 'mapboxgl', 'src', 'types', 'DrawEvent.d.ts'), 'utf8')
  const statisticsDeclaration = await readFile(path.join(distRoot, 'core', 'utils', 'statistics.d.ts'), 'utf8')
  const restServiceDeclaration = await readFile(path.join(distRoot, 'core', 'utils', 'iServerRestService.d.ts'), 'utf8')
  assert.match(webMapModule, new RegExp(`${packageName.replaceAll('/', '\\/')}\\/static\\/libs\\/json-sql\\/jsonsql`))
  assert.match(webMapModule, new RegExp(`${packageName.replaceAll('/', '\\/')}\\/core\\/utils\\/iPortalDataService`))
  assert.match(coreModule, new RegExp(`${packageName.replaceAll('/', '\\\/')}\\/static\\/libs\\/json-sql\\/jsonsql`))
  assert.match(drawDeclaration, new RegExp(`${packageName.replaceAll('/', '\\/')}\\/static\\/libs\\/mapbox-gl-draw\\/mapbox-gl-draw`))
  assert.ok(statisticsDeclaration.includes('statisticsFeatures(features: any, fields?: any, fieldCaptions?: any, fieldTypes?: any, originalFields?: any, isSystemFields?: any)'))
  assert.ok(restServiceDeclaration.includes('constructor(url: string, options?: any);'))
})
