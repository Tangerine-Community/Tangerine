#!/usr/bin/env node

if (process.argv[2] === '--help') {
  console.log('')
  console.log('This command will overwrite keys already generated at ./data/id_rsa and ./data/id_rsa.pub')
  console.log('')
  console.log('Usage:')
  console.log('       generate-ssh-keys')
  process.exit()
}

const util = require('util');
const exec = util.promisify(require('child_process').exec)

async function go() {
  console.log("Generating an ssh key for the container to import private content sets.")
  try {
    await exec(`ssh-keygen -t rsa -b 4096 -f /root/.ssh/id_rsa-tmp -P "" -C "tangerine@${process.env.T_HOST_NAME}"`)
    await exec(`cat /root/.ssh/id_rsa-tmp > /root/.ssh/id_rsa`)
    await exec(`cat /root/.ssh/id_rsa-tmp.pub > /root/.ssh/id_rsa.pub`)
    await exec(`chmod 600 /root/.ssh/id_rsa`)
  } catch (e) { console.log(e) }
  process.exit()
}
go()

