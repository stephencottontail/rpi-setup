import { program, Option } from 'commander'
import { input, select } from '@inquirer/prompts'

const timeZones = Intl.supportedValuesOf('timeZone')
const options = [
  {
    name: 'dryRun',
    parameter: '-D, --dry-run',
    description: 'display what would have been written',
    question: 'Perform a dry run?',
    default: false,
    choices: [
      {
        name: 'Yes',
        value: true,
      },
      {
        name: 'No',
        value: false,
      },
    ],
    prompt: select
  },
  {
    name: 'file',
    parameter: '-F, --file <string',
    description: 'file name to write to',
    question: 'Enter file to save to:',
    default: 'cloud-init.yml',
    prompt: input
  },
  {
    name: 'hostname',
    parameter: '-H, --hostname <string>',
    description: 'hostname for the Pi',
    question: 'Enter hostname:',
    prompt: input
  },
//  {
//    name:  'user',
//    description: 'unprivileged user name',
//    prompt: 'input',
//  },
//  {
//    name:  'userPassword',
//    description: 'unprivileged user password',
//    prompt: 'password',
//  },
//  {
//    name:  'ssid',
//    description: 'wireless network to use',
//    prompt: 'input',
//  },
//  {
//    name:  'ssidPassword',
//    description: 'password for wireless network',
//    prompt: 'password',
//  },
]

const collectFromCLI = () => {
  let filtered = {}
  let answers = {}

  filtered = options.filter((option) => {
    return typeof option.parameter !== 'undefined'
  })

  for (const option of filtered) {
    program.addOption(new Option(option.parameter, option.description).default(option.default !== undefined ? option.default : undefined))
  }

  program.parse()
  return program.opts()
}

export async function wizard() {
  let filtered = {}
  let answers = {}
  let output = {}
  const cliInput = collectFromCLI()

  filtered = options.filter((option) => {
    return cliInput[option.name] === undefined
  })

  for (const option of filtered) {
    const answer = await option.prompt(
      {
        message: option.question,
        choices: option.choices,
      }
    )

    answers[option.name] = answer
  }

  return { ...cliInput, ...answers }
}

export default wizard
