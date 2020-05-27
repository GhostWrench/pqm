#!/bin/bash
sed "s:export default pqm;:module.exports = pqm;:g" ./src/pqm.mjs > ./build/commonjs/pqm.cjs
sed "s:export default pqm;::g" ./src/pqm.mjs > ./build/iife/pqm.js