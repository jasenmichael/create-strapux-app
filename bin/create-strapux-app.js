#!/usr/bin/env node

// Dependencies
const fs = require("fs")
// const {
//     promisify
// } = require('util')
// const copy = promisify(require('ncp').ncp)
const validFilename = require('valid-filename')
const execa = require('execa')
const chalk = require('chalk')

// global variables
const argv = process.argv.slice('2')
const workingDir = process.cwd()
const projectName = argv[0]
const projectDir = `${workingDir}/${projectName}`

async function init() {
    // console.log(process.argv)
    // console.log(argv)
    const options = {}
    // check if --freshy-install passed, and delete path
    if (argv.includes('-h') || argv.includes('--help')) {
        // await runBashCommand(`node_modules/.bin/strapux create-strapux-app --help`, workingDir, false)
        // await runBashCommand(process.argv[1].replace(`bin/create-strapux-app.js`, `node_modules/.bin/strapux --help`), workingDir, false)
        console.log(`
Usage: create-strapux-app install <path>

Options:
  --oneclick            one click install
  --freshy-install      WARNING deletes path directory before installing
  -V, -v, --version     output the version number
  -h, --help            output usage information

Commands:
  create-strapux-app <path> [options]  if no path provided use current directory.
or
  npx create-strapux-app <path> [options]
        `)
        process.exit(0)
    }
    if (argv.includes('-v') || argv.includes('-V') || argv.includes('--version')) {
        console.log(`1.0.0`)
        process.exit(0)
    }
    if (argv.includes('--freshy-install') && projectDir != process.cwd() && fs.existsSync(projectDir)) {
        console.log(`Deleting and reinstalling ${projectName}`)
        await execa.command(`rm -rf ${projectDir}`)
    }
    // check if --oneclick passed, and add to options
    if (argv.includes('--oneclick')) {
        console.clear()
        console.log(`One Click mode selected, sit back and roll one..`)
        options.oneclick = true
    } else {
        options.oneclick = false
    }

    if (projectName === './' || projectName === '.' || projectName === workingDir) {
        await createStrapuxApp(workingDir)
    }
    if (argv[0]) { // check project-name passed
        if (validFilename(projectName) && !argv[0].includes('-')) { // check if project-name is a valid filename
            if (!fs.existsSync(projectDir)) { // check if project-name not exist, create and install
                await createStrapuxApp(projectDir, options) // console.log('Creating Strapux project in', projectDir)
            } else { // project-directory exists, exit.
                console.log('Project diretory', `"${projectName}"`, 'exists')
            }
        } else { // invalid project-directory filename
            console.log('Invalid directory name')
            process.exit(1)
        }
    } else { // project-name not passed, or some other error
        process.exit(1)
    }
}
init()

async function createStrapuxApp(path, options) {
    if (!options.oneclick) {
        console.clear()
    }

    console.log(``)

    if (path === workingDir) {
        console.log(chalk `✨ Generating Strapux project in {cyan ${'.'}}`)
    } else {
        console.log(chalk `✨ Generating Strapux project in {cyan ${path.replace(`${workingDir}/`, '')}}`)
    }
    if (path !== workingDir) {
        await execa.command(`mkdir ${path}`)
    }

    try {
        await runBashCommand('npm init -y', path, true) // init strapux
        await runBashCommand('npm i strapux', path, true) // get strapux pkg

        options = JSON.stringify(options)
        await runBashCommand(`node_modules/strapux/bin/strapux-cli.js install ${path} ${options}`, path, false) // install strapux
        console.log(`\r\n✨ Sucessfully installed Strapux!`)
        console.log(``)
        if (path !== workingDir) {
            console.log(`   cd ${path}`)
        }
        console.log(`   npm run dev\r\n`)
        process.exit(0)
    } catch (err) {
        console.log(`\r\n${chalk.red("ERROR")}: ${err}\r\n${chalk.red.bold('x')} Failed to create Strapux Project`)
        console.log(`Deleting setup files`)
        await runBashCommand(`rm -rf ${path}`).catch(async () => await runBashCommand(`rm -rf ${path}`).catch())
    }
}

async function runBashCommand(command, cwd = workingDir, hide = false) {
    hide = hide ? 'ignore' : 'inherit'
    cmd = command.split(' ')[0]
    args = command.split(' ').splice(1)
    return await execa(cmd, args, {
        cwd,
        stdio: hide
    })
}
