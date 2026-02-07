import { program, Option } from 'commander'
import prompts from 'prompts'

const timeZones = Intl.supportedValuesOf('timeZone')
const options = [
//  {
//    name: 'dryRun',
//    parameter: '-D, --dry-run',
//    description: 'display what would have been written',
//    question: 'Perform a dry run?',
//    default: false,
//    choices: [
//      {
//        name: 'Yes',
//        value: true,
//      },
//      {
//        name: 'No',
//        value: false,
//      },
//    ],
//    prompt: select
//  },
//  {
//    name: 'file',
//    parameter: '-F, --file <string',
//    description: 'file name to write to',
//    question: 'Enter file to save to:',
//    default: 'cloud-init.yml',
//    prompt: input
//  },
//  {
//    name: 'hostname',
//    parameter: '-H, --hostname <string>',
//    description: 'hostname for the Pi',
//    question: 'Enter hostname:',
//    prompt: input
//  },
//  {
//    name:  'user',
//    parameter: '-U, --user <string>',
//    description: 'unprivileged user name',
//    question: 'Enter unprivileged user:',
//    prompt: input,
//  },
//  {
//    name:  'userPassword',
//    parameter: '-P, --user-password <string>',
//    description: 'unprivileged user password',
//    question: 'Enter password for unprivileged user:',
//    prompt: password,
//  },
  {
    type: 'toggle',
    name: 'useWireless',
    default: false,
    message: 'Connect to a wireless network?',
    initial: true,
    active: 'yes',
    inactive: 'no',
  },
  {
    type: (prev, values) => values.useWireless === true ? 'text' : null,
    name:  'ssid',
    parameter: '-S, --ssid <string>',
    description: 'wireless network to use',
    message: 'Connect to which wireless network?',
  },
  {
    type: (prev, values) => values.useWireless === true ? 'password' : null,
    name:  'ssidPassword',
    parameter: '-W, --ssid-password <string',
    description: 'password for wireless network',
    message: 'Password for wireless network:',
  },
]

const collectFromCLI = () => {
  let filtered = {}

  /**
   * not all options are intended to be assignable via CLI parameters and
   * an easy way to filter them is by explicitly assigning a `parameter`
   * option for `commander` to consume
   */
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
  const cliInput = collectFromCLI()

  /**
   * if the user passes either or both `-S` or `-W` as a parameter, assume
   * they want wireless connectivity
   */
  if (cliInput['ssid'] !== undefined || cliInput['ssidPassword'] !== undefined) {
    cliInput['useWireless'] = true
  }

  prompts.override(cliInput)
  const response = await prompts(options)

  return response
}

export default wizard
