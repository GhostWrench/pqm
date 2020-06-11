/**
 * This script generates the unit definition object that is used in code from 
 * the unit definitions in src/data/unitdb.json. 
 */

import fs from "fs";

const dimensionTypes = [
  "mass",
  "length",
  "time",
  "temperature",
  "current",
  "substance",
  "luminosity",
  "information",
  "rotation"
];

let unitdb = JSON.parse(fs.readFileSync("src/data/unitdb.json"));
let code = "/**\n" +
           " * Autogenerated module containing unit definitions, do not edit. \n" +
           " * Instead, edit src/data/unitdb.json and then generate this file \n" +
           " * using 'node script/genunitobj.mjs' \n" +
           " */\n\n" +
           "const units = {\n";

for (let mainSym in unitdb) {
  if (!unitdb.hasOwnProperty(mainSym)) {
    continue;
  }
  if (mainSym == "$schema") {
    continue;
  }
  // Get the definition of the unit in string form
  let unitDef = "{" +
                "\"s\": " + unitdb[mainSym].scale.toExponential(20) + ", ";
  let dimArr = "[";
  for (let dimIdx=0; dimIdx<dimensionTypes.length; dimIdx++) {
    if (unitdb[mainSym].dimensions.hasOwnProperty(dimensionTypes[dimIdx])) {
      dimArr += unitdb[mainSym].dimensions[dimensionTypes[dimIdx]].toString() + ",";
    } else {
      dimArr += "0,";
    }
  }
  dimArr += "]";
  unitDef += ("\"d\": " + dimArr);
  if (unitdb[mainSym].hasOwnProperty("offset")) {
    unitDef += ", \"o\": " + unitdb[mainSym].offset.toExponential(20);
  }
  unitDef += "},\n";
  // Create an array with the unit and aliases to loop through
  let allSyms;
  if (unitdb[mainSym].aliases) {
    allSyms = new Array(unitdb[mainSym].aliases.length);
    allSyms[0] = mainSym;
    for (let ii=0; ii<unitdb[mainSym].aliases.length; ii++) {
      allSyms[ii+1] = unitdb[mainSym].aliases[ii];
    }
  } else {
    allSyms = [mainSym];
  }
  // Loop through all the symbols
  for (let symIdx=0; symIdx<allSyms.length; symIdx++) {
    let line = "  \"" + allSyms[symIdx] + "\" : " + unitDef;
    code += line;
  }
}

code += "};\n\n";
code += "export default units;\n";

fs.writeFileSync("src/unitdefs.mjs", code);
