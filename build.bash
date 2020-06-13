#!/bin/bash

# Generate the unit documentation table
eval "node './script/genunittable.mjs'"
# Generate the unit definitions file from the unit database
eval "node './script/genunitobj.mjs'"
# Rollup the code into the build folder
eval "node_modules/rollup/dist/bin/rollup -c"
# Minifiy all code
eval "node_modules/terser/bin/terser './build/es/pqm.mjs' -o './build/es/pqm.min.js'"
eval "node_modules/terser/bin/terser './build/cjs/pqm.cjs' -o './build/cjs/pqm.min.cjs'"
eval "node_modules/terser/bin/terser './build/iife/pqm.js' -o './build/iife/pqm.min.js'"

#sed "s:export default pqm;:module.exports = pqm;:g" ./src/pqm.mjs > ./build/commonjs/pqm.cjs
#sed "s:export default pqm;::g" ./src/pqm.mjs > ./build/iife/pqm.js