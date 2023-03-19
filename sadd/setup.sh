#!/usr/bin/env bash

DIR="$(pwd)"
WRKDIR="$(mktemp -d)"
NUMPROC="$(cat /proc/cpuinfo | grep proc | wc -l)"

# FFmpeg
mkdir makemkv
cd makemkv/
wget http://ffmpeg.org/releases/ffmpeg-4.4.3.tar.bz2
tar -xjvf ffmpeg-4.4.3.tar.bz2
cd ffmpeg-4.4.3/
make clean
./configure --prefix=/tmp/ffmpeg --enable-gpl --enable-nonfree --enable-static --disable-shared --enable-pic --disable-x86asm --disable-all --disable-autodetect --disable-everything --enable-swresample --enable-avcodec --enable-encoder=flac,aac,ac3,ac3_fixed --enable-libfdk-aac --enable-decoders
make
make install
cd ..

# MakeMKV

# Detect version from website
VERSION="$(curl --silent "http://www.makemkv.com/download/" 2>&1 | egrep -o 'MakeMKV ([^ ]*) for' | sed 's/MakeMKV //' | sed 's/ for//' | sed '/now/d' | uniq)"

#Download
wget "http://www.makemkv.com/download/makemkv-bin-${VERSION}.tar.gz"
wget "http://www.makemkv.com/download/makemkv-oss-${VERSION}.tar.gz"

#Mkv oss
tar -xzvf "makemkv-oss-${VERSION}.tar.gz"
cd "makemkv-oss-${VERSION}/"
make clean
CFLAGS="-std=gnu++11" PKG_CONFIG_PATH="/tmp/ffmpeg/lib/pkgconfig" ./configure --disable-gui
make
make install
cd ..

#Mkv bin
tar -xzvf "makemkv-bin-${VERSION}.tar.gz"
cd "makemkv-bin-${VERSION}/"
mkdir tmp
echo "accepted" >tmp/eula_accepted
make
make install
ldconfig

makemkvcon

cd ~

# Detect beta-key from forums
REG_KEY="$(curl --silent "http://www.makemkv.com/forum2/viewtopic.php?f=5&t=1053" 2>&1 | egrep -o 'class="codecontent">([^<]*)' | sed 's/class="codecontent">//')"

# Apply current beta key (overrides settings!)
echo "app_Key = \"${REG_KEY}\"" >./.MakeMKV/settings.conf

# Disable Update Check Phone Home
echo "app_UpdateEnable = \"0\"" >./.MakeMKV/settings.conf

# automation string
echo "-sel:all,+sel:audio&(ger),-sel:(havemulti),-sel:mvcvideo,-sel:special,=100:all,-10:ger" >./.MakeMKV/settings.conf

echo sg >/etc/modules-load.d/sg.conf
