#!/usr/bin/env bash

node ./node_modules/.bin/truffle-flattener ./contracts/Migrations.sol > ./contracts-flat/Migrations.sol;

node ./node_modules/.bin/truffle-flattener ./contracts/BlockCities.sol > ./contracts-flat/BlockCities.sol;

node ./node_modules/.bin/truffle-flattener ./contracts/BlockCitiesVendingMachineV2.sol > ./contracts-flat/BlockCitiesVendingMachineV2.sol;

node ./node_modules/.bin/truffle-flattener ./contracts/generators/LogicGeneratorV2.sol > ./contracts-flat/LogicGeneratorV2.sol;

node ./node_modules/.bin/truffle-flattener ./contracts/generators/CityGenerator.sol > ./contracts-flat/CityGenerator.sol;

node ./node_modules/.bin/truffle-flattener ./contracts/generators/ColourGenerator.sol > ./contracts-flat/ColourGenerator.sol;
