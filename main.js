const fs = require('fs')
const execa = require('execa')

module.exports = {
    create: async (path, options) => {
        //  delete dir if fresh install
        const dirExist = fs.existsSync(path)
        if (options.freshyInstall && dirExist) {
            console.log(`Fresh install, deleting ${path}`)
            await execa.command(`rm -rf ${path}`)
        }

        // if dirExist, check dir empty
        if (!options.freshyInstall && dirExist) {
            const dirEmpty = fs.readdirSync(path).length === 0

            // console.log('dirEmpty', dirEmpty)
            if (!dirEmpty) {
                console.log('Path not empty, exiting')
                process.exit(1)
            }
        } else {
            // create path dir
            console.log(`Re-creating dir ${path}`)
            await execa.command(`mkdir ${path}`, {
                stdio: 'ignore',
            })
        }

        console.log('Init Strapux project')
        await execa.command(`npm init -y`, {
            stdio: 'ignore',
            cwd: path
        })
        await execa.command(`npm i strapux`, {
            stdio: 'ignore',
            cwd: path
        }).then(() => {
            // create(path)
            const oneclick = `${options.oneclick ? '--oneclick' : ''}`
            // const cmd = `./node_modules/strapux/bin/strapux-cli.js --path=${path} ${opts}` 
            const cmd = `./node_modules/.bin/strapux --path=${path} ${oneclick}`
            // const cmd = `./node_modules/strapux-cli/bin/strapux-cli.js -h` 
            console.clear()
            if (options.oneclick) {
                console.log(`Oneclick passed, sit back and roll one...`)
            }
            console.log(`✨ Creating Strapux project in ${path === process.cwd() ? '.' : path}`)
            execa.command(cmd, {
                stdio: 'inherit',
                cwd: path
            })
        })
    }
}
