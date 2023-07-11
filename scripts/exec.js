const path = require('path')
const { execSync } = require('child_process')
const { readdirSync } = require('fs')
const minimist = require('minimist')
const chalk = require('chalk')

function exec(cmd, dir, subdirs, silent) {
  const stdio = silent ? 'ignore' : 'inherit'

  try {
    if (subdirs) {
      readdirSync(dir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory)
        .map(subDir => path.normalize(path.join(dir, subDir.name)))
        .forEach(subDir => {
          console.log(`\n${chalk.green(path.basename(subDir))}`)
          execSync(cmd, { cwd: subDir, stdio })
        })
    } else {
      console.log(`\n${chalk.green(path.basename(dir))}`)
      execSync(cmd, { cwd: dir, stdio })
    }
  } catch (error) {
    console.log(
      chalk.red(
        `\nCould not execute '${cmd}' in ${path.basename(dir)}!\n`,
        error
      )
    )
    process.exit(1)
  }
}

function main() {
  const args = process.argv.slice(2)
  const { cmd = '', dir = '', subdirs = false, silent = false } = minimist(args)
  const absDir = path.normalize(path.join(__dirname, '../', dir))

  exec(cmd, absDir, subdirs, silent)
}

main()
