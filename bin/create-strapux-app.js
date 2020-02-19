#!/usr/bin/env node

const child_process = require('child_process')
const fs = require("fs")
const validFilename = require('valid-filename')

const strapuxRepo = "https://github.com/jasenmichael/strapux.git"
const workingDir = process.cwd()
const projectName = process.argv[2]
const projectDir = `${workingDir}/${projectName}`

async function install() {
    if (process.argv[3] === '--freshy-install' && fs.existsSync(projectDir)) {
        // ----todo--- prompt to delete
        console.log(`deleting and reinstalling ${projectName}`)
        await runBashCommand(`rm -rf ${projectDir}`)
    }
    // check project-name passed
    if (process.argv[2]) {
        // check if project-directory is a valid filename
        if (validFilename(projectName)) {
            // check if project-directory not exist, and clone
            if (!fs.existsSync(projectDir)) {
                console.log('Creating Strapux project in', projectDir)
                // clone strapux repo in and create project-directory
                const command = `git clone ${strapuxRepo} ${projectName}`
                await runBashCommand(command)
                console.log('\r\n', 'Strapux cloned - now creating project..')
                const strapuxCli = `${projectDir}/bin/cli.js`
                await runBashScript(strapuxCli, [projectName, "--install-from-npx"])
                process.exit(0)
            } else { // project-directory exists, exit.
                console.log('project diretory', `"${projectName}"`, 'exists')
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
install()

async function runBashScript(script, args) {
    console.log('running bash script -', script, args.join(' '), '\r\n')
    child_process.execFileSync(script, args, {
        stdio: 'inherit'
    })
}

async function runBashCommand(cmd) {
    console.log(cmd)
    child_process.execSync(cmd)
}

// function execShellCommand(cmd) {
//     const exec = require('child_process').exec
//     console.log('running shell command script -', cmd, '\r\n')
//     return new Promise((resolve, reject) => {
//         exec(cmd, (error, stdout, stderr) => {
//             if (error) {
//                 console.warn(error)
//             }
//             resolve(stdout ? stdout : stderr)
//         })
//     })
// }
