#!/bin/bash
sed "s:export default pqm;:module.exports = pqm;:g" ./src/pqm.js > ./build/pqm-commonjs.js
sed "s:export default pqm;::g" ./src/pqm.js > ./build/pqm-iffe.js