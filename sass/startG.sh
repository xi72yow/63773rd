#!/usr/bin/env bash

mkdir -p $HOME/output

ALLSRX=$(ls /dev/sr*)
ALLSGX=$(ls /dev/sg*)

#create device list
DEVICELIST=""

for i in $ALLSRX; do
    echo "Adding $i to device list"
    DEVICELIST="$DEVICELIST --device=$i:$i"
done

for i in $ALLSGX; do
    echo "Adding $i to device list"
    DEVICELIST="$DEVICELIST --device=$i:$i"
done

echo "Starting container"

echo "docker run -d --rm --net=none \
    --name=\"63773r\" \
    --volume=$HOME/output:/app/output:rw \
    $DEVICELIST \
    ghcr.io/xi72yow/63773rd:latest"

docker run -d --rm --net=none \
    --name="63773r" \
    --volume=$HOME/output:/app/output:rw \
    $DEVICELIST \
    ghcr.io/xi72yow/63773rd:latest
