import { program, Option } from 'commander'
import prompts from 'prompts'
import createFuzzySearch from '@nozbe/microfuzz'
import * as fs from 'node:fs'
import { homedir } from 'node:os'
import * as path from 'node:path'

const getAuthKeyFromEnv = () => {
  return process.env.TAILSCALE_AUTH_KEY || null
}

const validatePath = (input) => {
  if (input.startsWith('~/')) {
    input = path.join(homedir(), input.slice(2))
  }

  return fs.existsSync(input) || 'Please enter a valid path'
}
  
const validateIP = (input) => {
  const re = /\d{0,3}\.\d{0,3}\.\d{0,3}\.\d{0,3}(\d{1,3})?/

  return re.test(input) ? true : 'error'
}

const timeZones = Intl.supportedValuesOf('timeZone')
const prepareTimeZones = (timeZones) => {
  return timeZones.map((zone) => {
    return { title: zone, value: zone }
  })
}

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
    type: getAuthKeyFromEnv() ? null : 'text',
    name: 'tailscaleAuthKey',
    parameter: '-T, --tailscale-auth-key <string>',
    description: 'Tailscale auth key',
    message: 'Enter your Tailscale authorization key:',
    initial: '',
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
    type: 'toggle',
    name: 'exitNode',
    message: 'Should this Pi be an exit node?',
    initial: false,
    active: 'yes',
    inactive: 'no',
  },
  {
    type: 'autocomplete',
    name: 'timeZone',
    parameter: '-Z, --time-zone <string>',
    description: 'timezone',
    message: 'Enter your timezone:',
    initial: 'America/Denver',
    choices: prepareTimeZones(timeZones),
    suggest: (input, choices) => {
      const fuzzySearch = createFuzzySearch.default(timeZones, { strategy: 'aggressive' })
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
    message: (prev, values) => `Enter password for ${values.user}:`,
  },
  {
    type: 'text',
    name: 'sshKey',
    parameter: '-K, --ssh-key <string>',
    description: 'SSH key to use',
    message: 'Public SSH key:',
    initial: '~/.ssh/id_ed25519.pub',
    validate: validatePath,
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
    message: (prev, values) => `Password for wireless network "${values.ssid}":`,
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

  if (getAuthKeyFromEnv()) {
    cliInput['tailscaleAuthKey'] = getAuthKeyFromEnv()
  }

  prompts.override(cliInput)
  const response = await prompts(options)

  return response
}

export default wizard
