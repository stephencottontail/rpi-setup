import { encrypt } from 'unixcrypt'

const mkPasswordBlock = (userPassword) => {
  const lock_passwd = false
  
  if (userPassword) {
    const hashed_password = encrypt(userPassword, '$6$rounds=4096')
    const password = `
    lock_passwd: ${lock_passwd}
    hashed_passwd: ${hashed_password}`

    return password
  } else {
    const password = `
    lock_passwd: ${lock_passwd}
`

    return password
  }
}

const mkAuthorizedKeysBlock = (sshKey) => {
  const key = sshKey // TODO: Read the file
  const ssh_authorized_keys = `
    ssh_authorized_keys:
      - ${key}`

  return ssh_authorized_keys
}

const mkWirelessBlock = (useStatic, useWireless, wirelessIP, router, nameservers, ssid, ssidPassword) => {
  let useDHCP
  let staticBlock

  if (!useWireless) {
    return ''
  }

  if (useStatic) {
    useDHCP = false
    staticBlock = `
      addresses: [${wirelessIP}]
      gateway4: ${router}
      nameservers:
        addresses: [${nameservers}]
`
  } else {
    useDHCP = true
    staticBlock = ''
  }

  const wireless = `
  wifis:
    renderer: NetworkManager
    wlan0:
      dhcp4: ${useDHCP}
      regulatory-domain: "US"
      access-points:
        "${ssid}":
          password: "${ssidPassword}"
      optional: true
      ${staticBlock}`

  return wireless
}

const mkEthernetBlock = (useStatic, ethernetIP, router, nameservers) => {
  let useDHCP
  let staticBlock

  if (useStatic) {
    useDHCP = false
    staticBlock = `
      addresses: [${ethernetIP}]
      gateway4: ${router}
      nameservers:
        addresses: [${nameservers}]`
  } else {
    useDHCP = true
    staticBlock = ''
  }

  const ethernet = `
  ethernets:
    renderer: NetworkManager
    eth0:
      dhcp4: ${useDHCP}
      regulatory-domain: "US"
      ${staticBlock}`

  return ethernet
}

const generate = (options) => {
  const {
    dryRun,
    hostname,
    timeZone,
    user,
    userPassword,
    sshKey,
    useStatic,
    ethernetIP,
    router,
    nameservers,
    useWireless,
    ssid,
    ssidPassword,
    wirelessIP
  } = options;
  const userdataHeader = `#cloud-config`
  const userdataBody = `
hostname: ${hostname}
manage_etc_hosts: true

timezone: ${timeZone}

users:
  - name: ${user}
    groups: users,sudo
    shell: /bin/bash
    ${mkPasswordBlock(userPassword)}
    ${mkAuthorizedKeysBlock(sshKey)}
    sudo: ALL=(ALL) ALL

enable_ssh: true
ssh_pwauth: false
disable_root: true`
  const networkConfigBody = `
network:
  version: 2
  ${mkWirelessBlock(useStatic, useWireless, wirelessIP, router, nameservers, ssid, ssidPassword)}
  ${mkEthernetBlock(useStatic, ethernetIP, router, nameservers)}`
  const output = `
${userdataHeader}
${userdataBody}
===
${networkConfigBody}`

  return output
}

export default generate
