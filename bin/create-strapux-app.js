#!/usr/bin/env node

const {
    create
} = require('../main.js')

const version = require('../package.json').version
const program = require('commander')
const fs = require('fs')
const cwd = process.cwd()

; //init cli
(() => {
    program
        .version(version)
        .option('-o, --oneclick', 'one click install')
        .option('--freshy-install', 'WARNING deletes path directory before installing')
        .usage('[path] [options]')
        .description('if no path provided uses current directory.')
        .action(async (options) => {
            // console.log(options.args[0])
            const path = options.args[0] ? cwd + '/' + options.args[0] : cwd
            // console.log('cwd', cwd)
            // console.log('path', path)
            if (path === cwd) {
                const dirEmpty = await fs.readdirSync(cwd).length === 0
                if (!dirEmpty) {
                    console.log('Path must be empty')
                    process.exit(1)
                }
            }
            console.clear()
            if (options.oneclick) {
                console.log(`Oneclick passed, sit back and roll one...`)
            }
            console.log(`✨ Installing Strapux App!`)
            create(path, options)
        })
    program.parse(process.argv)
})()
