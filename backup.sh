#!/bin/bash
mkdir -p ~/backup
pg_dump --dbname=postgresql://postgres:postgres@127.0.0.1:5432/testdb > ~/backup/db_dump
zip -r ~/backup/eth.zip ~/.ethereum/keystore
cp ./config/default.json ~/backup/
zip -r ~/backup-$(date "+%Y.%m.%d").zip ~/backup
scp ~/backup-$(date "+%Y.%m.%d").zip root@67.207.81.82:~/backups/
rm -rf ~/backup
rm ~/backup*.zip
