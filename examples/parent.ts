import { exec } from 'node:child_process'
exec('node --import=@poppinss/ts-exec examples/main.ts', {}, (_, stdout, stderr) => {
  console.log(stderr)
  console.log(stdout)
})
