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
    const options = {}
    // console.log('process.argv', process.argv)
    // console.log('argv', argv)
    // check if --freshy-install passed, and delete path
    if (argv[0] === ('-h' || '--help') || argv[1] === ('-h' || '--help')) {
        // await runBashCommand(`node_modules/.bin/strapux create-strapux-app --help`, workingDir, false)
        await runBashCommand(process.argv[1].replace(`bin/create-strapux-app.js`, `node_modules/.bin/strapux --help`), workingDir, false)
        await runBashCommand(process.argv[1].replace(`bin/create-strapux-app.js`, `node_modules/.bin/strapux --help`), workingDir, false)
        process.exit(0)
    }
    if (argv[0] === ('-V' || '-v' || '--version') || argv[1] === ('-V' || '-v' || '--version')) {
        await runBashCommand(process.argv[1].replace(`bin/create-strapux-app.js`, `node_modules/.bin/strapux --version`), workingDir, false)
        // await runBashCommand(`node_modules/.bin/strapux create-strapux-app --version`, projectDir, false)
        process.exit(0)
    }
    if (argv[1] || argv[2] === '--freshy-install' && fs.existsSync(projectDir)) {
        console.log(`Deleting and reinstalling ${projectName}`)
        await execa.command(`rm -rf ${projectDir}`)
    }
    // check if --oneclick passed, and add to options
    if (argv[1] === '--oneclick' || argv[2] === '--oneclick') {
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
            // check if project-name not exist, create and install
            if (!fs.existsSync(projectDir)) {
                // console.log('Creating Strapux project in', projectDir)
                await createStrapuxApp(projectDir, options)
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
        // init strapux
        await runBashCommand('npm init -y', path, true)

        // get strapux pkg
        // await runBashCommand('npm i /home/me/dev/new-strapux', path, true)
        await runBashCommand('npm i github:jasenmichael/strapux', path, true)

        // install strapux
        options = JSON.stringify(options)
        // console.log(``, command, options)
        console.log('path========================', path)
        await runBashCommand(`node_modules/.bin/strapux install ${path} ${options}`, path, false)
        // await runBashCommand(`node_modules/strapux/bin/strapux-cli.js install ${path} ${options}`, path, false)
        console.log(`\r\n✨ Sucessfully installed Strapux!`)
        console.log(``)
        if (path !== workingDir) {
            console.log(`   cd ${path}`)
        }
        console.log(`   npm run dev\r\n`)
        process.exit(0)
    } catch (err) {
        console.log(`\r\n${chalk.red("ERROR")}: ${err}\r\n${chalk.red.bold('x')} Failed to create Strapux Project`)
        // console.log(`Deleting setup files`)
        // await runBashCommand(`rm -rf ${path}`).catch(async () => await runBashCommand(`rm -rf ${path}`).catch())
    }
}

// runBashCommand(command:string, command-working-dir:string, show-output:boolean)
async function runBashCommand(command, cwd = workingDir, hide = false) {
    hide = hide ? 'ignore' : 'inherit'
    cmd = command.split(' ')[0]
    args = command.split(' ').splice(1)
    // console.log(cmd)
    // console.log(args)
    return await execa(cmd, args, {
        cwd,
        stdio: hide
    })
}
