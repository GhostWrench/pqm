#!/bin/sh

# Generate the unit documentation table
echo "Create ./doc/unittable.md"
node ./script/genunittable.mjs
# Generate the unit definitions file from the unit database
echo "Create ./src/unitdefs.mjs"
node ./script/genunitobj.mjs
# Rollup the code into the build folder
echo "Rollup code versions into single file"
node ./node_modules/rollup/dist/bin/rollup -c
# Minifiy all code
node ./node_modules/terser/bin/terser "./build/es/pqm.mjs" -o "./build/es/pqm.min.js"
node ./node_modules/terser/bin/terser "./build/cjs/pqm.cjs" -o "./build/cjs/pqm.min.cjs"
node ./node_modules/terser/bin/terser "./build/iife/pqm.js" -o "./build/iife/pqm.min.js"
