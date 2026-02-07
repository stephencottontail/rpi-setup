import wizard from './src/wizard.js'

(async () => {
  const options = await wizard()

  console.log('index', options)
})().catch((err) => {
  console.error(err)
})
