import path from 'path'
import { readFile, writeFile } from 'fs/promises'
import glob from 'fast-glob'
import { copy, remove } from 'fs-extra'
import { dest, src } from 'gulp'
import replace from 'gulp-replace'
import { buildOutput, getPkgByCommand } from '@supermapgis/build-utils'
import { pathRewriter, run } from '../utils'

const pkgName = getPkgByCommand(process.argv)
export const generateTypesDefinitions = async () => {
  await generateTypesPkg()
  await generateTypesCommon()
  const typesDir = path.join(buildOutput, 'types', 'packages', `${pkgName}`)
  const moveCommon = async () => {
    const sourceDir = path.join(buildOutput, 'types', 'packages', `common`)
    await copy(sourceDir, typesDir)
    await remove(sourceDir)
  }
  await moveCommon()
  const filePaths = await glob('**/*.d.ts', {
    cwd: typesDir,
    absolute: true
  })
  filePaths.map(filePath => {
    const basename = path.basename(filePath)
    const destDir = filePath.replace(basename, '').replace(`${pkgName}`, `all-${pkgName}`)
    src(filePath) // 文件匹配模式
      .pipe(replace(/vue-iclient-mapboxgl\/es\/common\//g, 'vue-iclient-mapboxgl/es/')) // 替换内容
      .pipe(replace(/vue-iclient-mapboxgl\/es\/mapboxgl\//g, 'vue-iclient-mapboxgl/es/')) // 替换内容
      .pipe(replace(/vue-iclient-mapboxgl\/es\/leaflet\//g, 'vue-iclient-leaflet/es/')) // 替换内容
      .pipe(dest(destDir)) // 输出目录
  })
  // await remove(typesDir)
}
export const generateTypesCommon = async () => {
  await run(
    `npx vue-tsc -p tsconfig.common.json --declaration --emitDeclarationOnly --declarationDir dist/types`
  )
  await generatePkgTypes('common')
}
export const generateTypesPkg = async () => {
  await run(
    `npx vue-tsc -p tsconfig.${pkgName}.json --declaration --emitDeclarationOnly --declarationDir dist/types`
  )
  const moveVueIclientPkg = async () => {
    const typesDir1 = path.join(buildOutput, 'types', 'packages', `${pkgName}`)
    const sourceDir = path.join(typesDir1, `vue-iclient-${pkgName}`)
    await copy(sourceDir, typesDir1)
    await remove(sourceDir)
  }
  await generatePkgTypes()
  await moveVueIclientPkg()
}

async function generatePkgTypes(pkg = pkgName) {
  const typesDir = path.join(buildOutput, 'types', 'packages', `${pkg}`)
  const filePaths = await glob(`**/*.d.ts`, {
    cwd: typesDir,
    absolute: true
  })
  const rewriteTasks = filePaths.map(async filePath => {
    const content = await readFile(filePath, 'utf8')
    await writeFile(filePath, pathRewriter('esm')(content), 'utf8')
  })
  await Promise.all(rewriteTasks)
}