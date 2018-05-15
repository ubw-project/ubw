#!/bin/bash
sudo apt-get update && apt-get upgrade
sudo apt-get install -y postgresql postgresql-contrib git build-essential libssl-dev

sudo locale-gen "en_US.UTF-8"
sudo dpkg-reconfigure locales
sudo -i -u postgres
createdb testdb
exit


# install nvm and node and npm
curl https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash
cd ubw-api
source ~/.profile
nvm install 7.2.0
nvm alias default 7.2.0
npm install