#!/usr/bin/env node
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const appDir = `${__dirname}/dist/tangerine-client`
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
const fs = require('fs-extra')
const go = async _ => {
    let cmd = ``

    console.log('')
    console.log('Preparing assets')
    console.log('')

    await fs.remove(`"${appDir}/assets"`)

    console.log('')
    console.log('Syncing assets...')
    console.log('')

    cmd = `sync-files -w ${process.cwd()} ${appDir}/assets`

    console.log('')
    console.log(cmd)
    console.log('')

    exec(cmd).catch(console.log)

    sleep(1500)

    console.log('')
    console.log(`Starting tangy app`)
    console.log('')

    cmd = `cd ${appDir} && serve -p 8008`

    console.log('')
    console.log(cmd)
    console.log('')

    console.log('')
    console.log('')
    console.log('')
    console.log('')
    console.log('  In a browser, open http://localhost:8008')

    await exec(cmd)
        .then(console.log)
        .catch(console.log)
}
go()
