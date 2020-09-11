import chalk from 'chalk'
import execa from 'execa'
import { join } from 'path'
import { promises as fs } from 'fs'

async function writeVersion(version: string, pkgDir = process.cwd()) {
  const pkgJsonPath = join(pkgDir, 'package.json')
  const file = await fs.readFile(pkgJsonPath, 'utf-8')
  const packageJson: {
    version: string
    [key: string]: any
  } = JSON.parse(file)
  packageJson.version = version
  await fs.writeFile(pkgJsonPath, JSON.stringify(packageJson, null, 2))
}

async function run(cmd: string) {
  try {
    await execa.command(cmd, {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        SKIP_GENERATE: 'true'
      }
    })
  } catch (e) {
    throw new Error(chalk.red(e.stderr || e.stack || e.message))
  }
}

async function publish() {
  const args = process.argv.slice(2)
  if (args.length < 1) {
    console.error('Usage: npm run publish <version> [tag]\nExample: npm run publish v3.0.0 next')
    return
  }
  const version = args[0]
  const tag = args[1] || 'latest'

  console.log(`\nPublishing ${chalk.magentaBright(`${version}`)} ${chalk.dim(`on ${tag}`)}`)

  await writeVersion(version)

  await run('git add .')
  await run(`git commit -am "chore(release): bump ${version}"`)
  await run(`git tag -a ${version} -m "${version}"`)
  await run(`npm publish --no-git-checks --tag ${tag}`)
  await run('git push --quiet')
  await run('git push --tags --quiet')
}

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
if (!module.parent) {
  publish().catch((e) => {
    console.error(chalk.red.bold('Error: ') + `${e.stack || e.message}`)
    process.exit(1)
  })
}
