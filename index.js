const core     = require('@actions/core')
const glob     = require('@actions/glob')
const renderer = require('./renderer')
const path     = require('path')
const fs       = require('fs').promises



// most @actions toolkit packages have async methods
async function run() {
  try {
    const input = core.getInput('input', {required: true})
    const output = core.getInput('output')
    const hard_fail = core.getInput('hard-fail') !== 'false'

    if(output)
      await fs.mkdir(output, {recursive: true})

    const globOptions = {
      followSymbolicLinks: core.getInput('follow-symbolic-links').toLowerCase() !== 'false'
    }

    const globber = await glob.create(input, globOptions)
    for await (const file of globber.globGenerator()) {
      let stat = await fs.stat(file)
      if(!stat.isFile())
        continue

      let handle = await fs.open(file, 'r+')
      
      const data = await handle.readFile('utf8')

      console.log(`===== ORIGINAL: ${file} ======`)
      console.log(data)

      const rendered = renderer.render(data, /\$\{([A-Z_-]+)\}/gm, hard_fail)

      console.log("===== PROCESSED ======")
      console.log(rendered)

      if(output) {
        await handle.close();

        const basename = path.basename(file)
        const outputName = path.join(output, basename)
        handle = await fs.open(outputName, 'w+')
      }

      let tmp = await handle.write(rendered, 0)
      await handle.truncate(tmp.bytesWritten)
      await handle.close();
    }
    
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
