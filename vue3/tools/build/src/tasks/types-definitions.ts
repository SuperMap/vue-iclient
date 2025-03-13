import path from 'path'
import { readFile, writeFile } from 'fs/promises'
import glob from 'fast-glob'
import { copy, remove } from 'fs-extra'
import { buildOutput, getPkgByCommand, getPKG_NAME } from '@supermapgis/build-utils'
import { pathRewriter, run } from '../utils'

const pkgName = getPkgByCommand(process.argv)
export const generateTypesDefinitions = async () => {
  await generateTypesPkg()
  await generateTypesCommon()
  const distPackage = `${getPKG_NAME(pkgName)}`
  const typesDir = path.join(buildOutput, 'types', 'packages', `${distPackage}`)
  const moveTo = async (pkg = 'common', targetDir = typesDir) => {
    const sourceDir = path.join(buildOutput, 'types', 'packages', pkg)
    await copy(sourceDir, targetDir)
    await remove(sourceDir)
  }
  await moveTo(pkgName)
  await moveTo('common')
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
  await generatePkgTypes()
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