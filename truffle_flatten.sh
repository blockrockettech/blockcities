#!/usr/bin/env bash

node ./node_modules/.bin/truffle-flattener ./contracts/Migrations.sol > ./contracts-flat/Migrations.sol;

node ./node_modules/.bin/truffle-flattener ./contracts/BlockCitiesVendingMachine.sol > ./contracts-flat/BlockCitiesVendingMachine.sol;
