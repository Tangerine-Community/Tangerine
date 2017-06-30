const { spawn } = require('child_process');
const ls = spawn(__dirname + '/tangy-build.sh', [__dirname]);
console.log('hi')

ls.stdout.on('data', (data) => {
  console.log(`${data}`);
});

ls.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
