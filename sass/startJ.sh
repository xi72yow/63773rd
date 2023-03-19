#!bin/bash

docker volume create jellyfin-config
#docker volume prune

docker run -d \
    --name=jellyfin \
    -e PUID=1000 \
    -e PGID=1000 \
    -e TZ=Europe/Berlin \
    -p 8096:8096 \
    --volume jellyfin-config:/config \
    -v "$HOME/Mediathek:/data/tvshows" \
    --restart unless-stopped \
    lscr.io/linuxserver/jellyfin:latest
