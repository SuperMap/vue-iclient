import path from 'path'
import { readFile, writeFile } from 'fs/promises'
import glob from 'fast-glob'
import { copy, remove } from 'fs-extra'
import { buildOutput, getPkgByCommand, getPKG_NAME } from '@supermapgis/build-utils'
import { pathRewriter, run } from '../utils'

const pkgName = getPkgByCommand(process.argv)
export const generateTypesDefinitions = async () => {
  await generateTypes(`tsconfig.${pkgName}.json`, `packages/${pkgName}`)
  await generateTypes('tsconfig.common.json', 'packages/common')
  const distPackage = `${getPKG_NAME(pkgName)}`
  const typesDir = path.join(buildOutput, 'types', 'packages', `${distPackage}`)
  const moveTo = async (pkg = 'packages/common', targetDir = typesDir) => {
    const sourceDir = path.join(buildOutput, 'types', pkg)
    await copy(sourceDir, targetDir)
    await remove(sourceDir)
  }
  await moveTo(`packages/${pkgName}`)
  await moveTo('packages/common')
}
export const generateTypes = async (tsconfig, pkgRoot) => {
  await run(
    `npx vue-tsc -p ${tsconfig} --declaration --emitDeclarationOnly --declarationDir dist/types`
  )
  await generatePkgTypes(pkgRoot)
}

async function generatePkgTypes(pkg) {
  const typesDir = path.join(buildOutput, 'types', `${pkg}`)
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
