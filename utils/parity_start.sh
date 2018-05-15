#!/bin/bash
parity --networkid 1900 --ui-interface 128.199.237.167 --ui-no-validation --nodiscover --ipcpath "./parity.ipc" --ipc-apis "web3,eth,net,parity,parity_accounts,traces,rpc,personal" --jsonrpc-apis "web3,eth,net,parity,traces,rpc,personal" --chain dev --author "0x9f4bbf8d36cab8ba461c51d1231565ef7cd225db" ui
