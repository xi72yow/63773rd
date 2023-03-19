#!/usr/bin/env bash

#@ThisIsTenou  https://github.com/ThisIsTenou/makemkv-autorip-script/blob/master/autorip.sh

SOURCEDRIVE="$1"
SCRIPTROOT="$(dirname """$(realpath "$0")""")"
OUTPUTDIR="$SCRIPTROOT/output"

SOURCEMMKVDRIVE=$(makemkvcon --robot --noscan --cache=1 info disc:9999 | grep "$SOURCEDRIVE" | grep -o -E '[0-9]+' | head -1)

if [ -z "$SOURCEMMKVDRIVE" ]; then
    echo "[ERROR] $SOURCEDRIVE: Make-MKV Source Drive is not defined."
    exit 1
fi

if [ -z "$SOURCEDRIVE" ]; then
    echo "[ERROR] Source Drive is not defined."
    echo "        When calling this script manually, make sure to pass the drive path as a variable: ./ripper.sh [DRIVE]"
    exit 1
fi
setcd -i "$SOURCEDRIVE" | grep --quiet 'Disc found'
if [ ! $? ]; then
    echo "[ERROR] $SOURCEDRIVE: Source Drive is not available."
    exit 1
fi

echo "[INFO] $SOURCEDRIVE: Started ripping process"

DISKTITLERAW=$(blkid -o value -s LABEL "$SOURCEDRIVE")
DISKTITLERAW=${DISKTITLERAW// /_}
NOWDATE=$(date +"%F_%H-%M-%S")
DISKTITLE="${DISKTITLERAW}_-_$NOWDATE"

mkdir -p "$OUTPUTDIR/$DISKTITLE"
mkdir -p "${SCRIPTROOT}/logs"

makemkvcon mkv --messages="${SCRIPTROOT}/logs/${NOWDATE}_$DISKTITLERAW.log" --noscan --robot disc:"$SOURCEMMKVDRIVE" all "${OUTPUTDIR}/${DISKTITLE}"
if [ $? -eq 0 ]; then
    echo "[INFO] $SOURCEDRIVE: Ripping finished (exit code $?), ejecting"
else
    echo "[ERROR] $SOURCEDRIVE: RIPPING FAILED (exit code $?), ejecting. Please check the logs under ${SCRIPTROOT}/logs/${NOWDATE}_${DISKTITLERAW}.log"
fi

while setcd -i "$SOURCEDRIVE" | grep --quiet 'Disc found'; do
    echo "[INFO] $SOURCEDRIVE: Drive is not ejected, waiting 10 seconds"
    sleep 10
    eject "$SOURCEDRIVE"
done
