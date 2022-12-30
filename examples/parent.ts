import { exec } from 'node:child_process'
exec('node --loader=ts-node/esm examples/main.ts --ansi', {}, (_, stdout, stderr) => {
  console.log(stderr)
  console.log(stdout)
})
