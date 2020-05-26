#!/bin/bash
cp ./src/pqm.js ./build/node/pqm.mjs
sed "s:export default pqm;:module.exports = pqm;:g" ./src/pqm.js > ./build/node/pqm.cjs
cp ./src/pqm.js ./build/browser/pqm.js
sed "s:export default pqm;::g" ./src/pqm.js > ./build/browser/pqm-iife.js