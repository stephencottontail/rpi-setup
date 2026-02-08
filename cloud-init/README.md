# cloud-init #

Bootstraps the Pi, setting up Tailscale in the process. Intended to be run after flashing the image to the SD card, but before the first boot.

## Usage ##

## Options ##

### --dry-run ###

```
-D, --dry-run
```

- Display what would be written
- Defaults to true

### --hostname ###

```
-H, --hostname <string>
```

- Sets the hostname for the Pi
- Defaults to 'raspberry'

### --time-zone ###

```
-Z, --time-zone <string>
```

- Sets the IANA time zone for the Pi
- Defaults to 'America/Denver'

### --user ###

```
-U, --user <string>
```

- Creates a non-root user
- Defaults to 'pi'

### --user-password ###

```
-P, --user-password <string>
```

- Sets the password for the newly-created user
- Defaults to blank
- Please consider the security implications of having no password. Any attacker who can gain access to this user can easily become root.

### --ssh-key ###

```
-K, --ssh-key <path>
```

- The path to the SSH key to install
- Defaults to '~/.ssh/id_ed25519.pub'

### --ssid ###

```
-S, --ssid <string>
```

- Sets the wireless network to use
- Defaults to none
- If you set either this option or `-W`, it is assumed you want wireless connectivity

### --ssid-password ###

```
-W, --ssid-password <string>
```

- Password for the wireless network
- Defaults to none
- If you set either this option or `-S`, it is assumed you want wireless connectivity
