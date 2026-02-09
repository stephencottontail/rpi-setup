#!/usr/bin/env node

import wizard from './src/wizard.js'
import generate from './src/generate.js'
import * as fs from 'node:fs/promises'

(async () => {
  const options = await wizard()
  const generatedFiles = generate(options)
  const trimmed = generatedFiles.map(str => str.split(/\r?\n/).filter(line => line.trim() !== '').join('\n'))

  if (options.dryRun) {
      const output = `
=== user-data
${trimmed[0]}
=== network-config
${trimmed[1]}`

    console.log(output)
  } else {
    fs.writeFile('./user-data', `${trimmed[0]}\n`, (err) => {
      if (err) {
	throw 'Writing file "user-data" failed'

	return
      }
    })

    fs.writeFile('./network-config', `${trimmed[1]}\n`, (err) => {
      if (err) {
	throw 'Writing file "network-config" failed'

	return
      }
    })
  }
})().catch((err) => {
  console.error(err)
})
