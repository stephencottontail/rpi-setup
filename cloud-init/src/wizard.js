import { program, Option } from 'commander'
import prompts from 'prompts'
import createFuzzySearch from '@nozbe/microfuzz'

const validateIP = (input) => {
  const re = /\d{0,3}\.\d{0,3}\.\d{0,3}\.\d{0,3}(\d{1,3})?/

  return re.test(input) ? true : 'error'
}

const timeZones = Intl.supportedValuesOf('timeZone')
const options = [
  {
    type: 'toggle',
    name: 'dryRun',
    parameter: '-D, --dry-run',
    description: 'display what would have been written',
    message: 'Perform a dry run?',
    initial: true,
    active: 'yes',
    inactive: 'no',
  },
  {
    type: 'text',
    name: 'file',
    parameter: '-F, --file <string',
    description: 'file name to write to',
    message: 'Enter file to save to:',
    initial: 'cloud-init.yml',
  },
  {
    type: 'text',
    name: 'hostname',
    parameter: '-H, --hostname <string>',
    description: 'hostname for the Pi',
    message: 'Enter hostname:',
    initial: 'raspberrypi',
  },
  {
    type: 'autocomplete',
    name: 'timeZone',
    parameter: '-Z, --time-zone <string>',
    description: 'timezone',
    message: 'Enter your timezone:',
    initial: '',
    choices: timeZones,
    suggest: (input, choices ) => {
      const fuzzySearch = createFuzzySearch.default(choices, { strategy: 'aggressive' })
      const results = fuzzySearch(input)
      const output = results.map((result) => {
        return result.item
      })
      
      return Promise.resolve(output)
    },
    validate: value => timeZones.includes(value),
  },
  {
    type: 'text',
    name:  'user',
    parameter: '-U, --user <string>',
    description: 'unprivileged user name',
    message: 'Enter unprivileged username:',
    initial: 'pi',
  },
  {
    type: 'password',
    name:  'userPassword',
    parameter: '-P, --user-password <string>',
    description: 'unprivileged user password',
    message: 'Enter password for unprivileged user:',
  },
  {
    type: 'toggle',
    name: 'useStatic',
    message: 'Set a static IP address?',
    initial: true,
    active: 'yes',
    inactive: 'no',
  },
  {
    type: (prev, values) => values.useStatic === true ? 'text' : null,
    name: 'ethernetIP',
    message: 'IP address (with subnet mask in CIDR notation):',
    initial: '',
    validate: validateIP,
  },
  {
    type: (prev, values) => values.useStatic === true ? 'text' : null,
    name: 'router',
    message: 'Router:',
    initial: '',
    validate: validateIP,
  },
  {
    type: (prev, values) => values.useStatic === true ? 'text' : null,
    name: 'nameservers',
    message: 'DNS server:',
    initial: '',
    validate: validateIP,
  },
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
  {
    type: (prev, values) => values.useWireless === true && values.useStatic === true ? 'text' : null,
    name: 'wirelessIP',
    message: 'IP address for wireless connection (with subnet mask in CIDR notation):',
    initial: '',
    validate: validateIP,
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
