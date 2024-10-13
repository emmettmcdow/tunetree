# tunetree
linktree but for your music!

## Kamal
```bash
alias kamal='docker run -it --rm -v "${PWD}:/workdir" -v "/run/host-services/ssh-auth.sock:/run/host-services/ssh-auth.sock" -e SSH_AUTH_SOCK="/run/host-services/ssh-auth.sock" -v /var/run/docker.sock:/var/run/docker.sock ghcr.io/basecamp/kamal:latest'
kamal deploy -c=config/backend.yml
kamal deploy -c=config/frontend.yml
```
## Domain
on godaddy

## Web
on hetzner

## Analytics
Google Analytics on emmett.mcdow@gmail.com

