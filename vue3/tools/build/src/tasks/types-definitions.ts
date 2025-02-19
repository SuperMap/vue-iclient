import path from 'path'
import { readFile, writeFile } from 'fs/promises'
import glob from 'fast-glob'
import { copy, remove } from 'fs-extra'
import { buildOutput, getPkgByCommand } from '@supermapgis/build-utils'
import { pathRewriter, run } from '../utils'

const pkgName = getPkgByCommand(process.argv)
export const generateTypesDefinitions = async () => {
  await run(
    `npx vue-tsc -p tsconfig.${pkgName}.json --declaration --emitDeclarationOnly --declarationDir dist/types`
  )
  await generatePkgTypes()
  // const typesDir = path.join(buildOutput, 'types', 'packages')
  // await copyTSFile(typesDir, pkgName)
  // await copyTSFile(typesDir, 'common')
  // await copy(typesDir, path.join(buildOutput, 'types', 'packages', pkgName))
}

async function generatePkgTypes(pkg = pkgName) {
  const typesDir = path.join(buildOutput, 'types', 'packages', ` ${pkg}`)
  const filePaths = await glob(`**/*.d.ts`, {
    cwd: typesDir,
    absolute: true
  })
  console.log(filePaths)
  const rewriteTasks = filePaths.map(async filePath => {
    const content = await readFile(filePath, 'utf8')
    await writeFile(filePath, pathRewriter('esm')(content), 'utf8')
  })
  await Promise.all(rewriteTasks)
  const sourceDir = path.join(typesDir, `vue-iclient-${pkgName}`)

  await copy(sourceDir, typesDir)
  await remove(sourceDir)
}

// async function generateTypes(folder = 'components') {
//   const typesDir = path.join(buildOutput, 'types', 'vue3', 'packages')
//   const filePaths = await glob(`**/**/*.d.ts`, {
//     cwd: typesDir,
//     absolute: true
//   })
//   const rewriteTasks = filePaths.map(async filePath => {
//     const content = await readFile(filePath, 'utf8')
//     await writeFile(filePath, pathRewriter('esm')(content), 'utf8')
//   })
//   await Promise.all(rewriteTasks)
//   await copyTSFile(typesDir, pkgName, folder)
//   await copyTSFile(typesDir, 'common', folder)
//   await copy(typesDir, path.join(buildOutput, 'types', 'packages', pkgName))
//   await remove(path.join(buildOutput, 'types', 'vue3'))
// }
async function copyTSFile(typesDir, pkg, folder = '') {
  const sourceDir = path.join(typesDir, pkg, folder)
  await copy(sourceDir, typesDir)
  await remove(sourceDir)
  const sourceUtils = path.join(typesDir, pkg)
  await copy(sourceUtils, typesDir)
  await remove(sourceUtils)
}
