-install noobs
-go throught setup, locale, ssh
-add wifi networks via gui
-sudo apt-get update
-install samba
--sudo apt-get install samba samba-common-bin -y
--sudo cp /etc/samba/smb.conf /etc/samba/smb.bak
--sudo nano /etc/samba/smb.conf

[PI2]
path = /mnt/usbstorage/TV
create mask = 0755
directory mask = 0755
read only = no
browseable = yes
public = yes
force user = pi
only guest = no

-install git
--sudo apt-get install git-core

-install node
--curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -
--sudo apt-get install -y build-essential python-dev python-rpi.gpio nodejs
OR
--wget http://node-arm.herokuapp.com/node_0.10.36-1_armhf.deb OR wget http://node-arm.herokuapp.com/node_latest_armhf.deb
--sudo dpkg -i node_0.10.36-1_armhf.deb
--node -v

-install brewbot
--git clone https://github.com/sryburn/brewbot.git
--cd brewbot
--npm install

-install 1-wire
sudo nano /boot/config.txt and then scrolling to the
bottom and add:
dtoverlay=w1-gpio
Then reboot with sudo reboot. When the Pi is back up and you're logged in again, type the
commands you see below into a terminal window. When you are in the 'devices' directory, the
directory starting '28-' may have a different name, so cd to the name of whatever directory is there.

sudo modprobe w1-gpio
sudo modprobe w1-therm
cd /sys/bus/w1/devices
ls


HLT		 28-000006740ce7	blue
MASH     28-000006744eb8	black
BOIL  	 28-00000673b5b3	green
CHILLER  28-000006743ab7	red