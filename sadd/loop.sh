#!/usr/bin/env bash

#@ThisIsTenou  https://github.com/ThisIsTenou/makemkv-autorip-script/blob/master/wrapper.sh

mapfile -t drives < <(ls /dev/sr*)
echo "----------------------------"
printf "Found the following devices:\n"
printf '%s\n' "${drives[@]}"
echo "----------------------------"

for drive in "${drives[@]}"; do eject "$drive" & done

discstatus() {
    while true; do
        discinfo=$(setcd -i "$drive" 2>/dev/null)

        case "$discinfo" in
        *'Disc found'*)
            echo "[INFO] $drive: disc is ready" >&2
            unset repeatnodisc
            unset repeatemptydisc
            /bin/bash "./getter.sh" "$drive"
            sleep 10
            ;;
        *'not ready'*)
            echo "[INFO] $drive: waiting for drive to be ready" >&2
            unset repeatemptydisc
            sleep 5
            ;;
        *'is open'*)
            if [[ $repeatemptydisc -lt 3 ]]; then
                echo "[INFO] $drive: drive is open" >&2
                repeatemptydisc=$((repeatemptydisc + 1))
            fi
            sleep 5
            ;;
        *'No disc is inserted'*)
            if [[ $repeatnodisc -lt 3 ]]; then
                echo "[WARN] $drive: drive tray is empty" >&2
                repeatnodisc=$((repeatnodisc + 1))
            fi
            unset repeatemptydisc
            sleep 15
            ;;
        *)
            echo "[ERROR] $drive: Confused by setcd -i, bailing out" >&2
            unset repeatemptydisc
            eject "$drive"
            ;;
        esac
    done
}

for drive in "${drives[@]}"; do discstatus "$drive" & done
