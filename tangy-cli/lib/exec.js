var acp = require('async-child-process');
async function exec(cmd) {
  var package = await acp.execAsync(cmd);
  if (package.stderr) {
    console.log(stderr);
  }
  return package.stdout.trim();
}

module.exports = exec;


