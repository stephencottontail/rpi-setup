import wizard from './src/wizard.js'
import generate from './src/generate.js'

(async () => {
  const options = await wizard()

  console.log('generate', generate(options))
})().catch((err) => {
  console.error(err)
})
