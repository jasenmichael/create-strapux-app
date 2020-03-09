#!/usr/bin/env node

// const child_process = require('child_process')
const fs = require("fs")
const validFilename = require('valid-filename')
const execa = require('execa');

const workingDir = process.cwd()
const projectName = process.argv[2]
const projectDir = `${workingDir}/${projectName}`
const argv = process.argv.slice('2')

console.log('workingDir', workingDir)
console.log('projectName', projectName)
console.log('projectDir', projectDir)
console.log('argv', argv)

async function init() {
    if (argv[1] === '--freshy-install' && fs.existsSync(projectDir)) {
        // ----todo--- prompt to delete
        console.log(`deleting and reinstalling ${projectName}`)
        // await child_process.execSync(`rm -rf ${projectDir}`)
        await execa.command(`rm -rf ${projectDir}`)
    }
    if (argv[0]) { // check project-name passed
        if (validFilename(projectName)) { // check if project-name is a valid filename
            // check if project-name not exist, create and install
            if (!fs.existsSync(projectDir)) {
                console.log('Creating Strapux project in', projectDir)
                await createStrapuxApp(projectDir)
                process.exit(0)
            } else { // project-directory exists, exit.
                console.log('project diretory', `"${projectName}"`, 'exists')
                process.exit(0)
            }
        } else { // invalid project-directory filename
            console.log('invalid directory name')
            process.exit(1)
        }
    } else { // project-name not passed
        console.log('project directory name required')
        process.exit(1)
    }
}
init()

async function createStrapuxApp(path) {
    console.log(path)
    await execa.command(`mkdir ${path}`)
    await runBashCommand('npm init -y', path)
    await runBashCommand('npm i /home/me/dev/new-strapux', path)
    // await runBashCommand('npm i github:jasenmichael/strapux', path)
    await runBashCommand(`node_modules/.bin/strapux install ${path}`, path)
}


async function runBashCommand(command, cwd) {
    cmd = command.split(' ')[0]
    args = command.split(' ').splice(1)
    console.log(cmd)
    console.log(args)
    await execa(cmd, args, {
        cwd,
        stdio: 'inherit'
    })
}
