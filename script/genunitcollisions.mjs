import fs from "fs";

// Read the unit database
let dbfile = fs.readFileSync("src/data/unitdb.json");
let fulldb = JSON.parse(dbfile);
let prefixes = Object.keys(fulldb.prefixes);
let unitdb = fulldb.units;

console.log("Number of total base units: " + Object.keys(unitdb).length);

let collisiondb = new Object();

// Loop and look for collisions
for (let primarySymbol in unitdb) {
  if (!unitdb.hasOwnProperty(primarySymbol)) {
    continue;
  }
  if (primarySymbol == "$schema") {
    continue;
  }

  let allSymbols;
  if (unitdb[primarySymbol].hasOwnProperty("aliases")) {
    allSymbols = [...unitdb[primarySymbol]["aliases"]];
    allSymbols.push(primarySymbol);
  } else {
    allSymbols = [primarySymbol];
  }

  for (let symIdx in allSymbols) {
    addToDb("", allSymbols[symIdx]);

    for (let prefixIdx in prefixes) {
      addToDb(prefixes[prefixIdx], allSymbols[symIdx]);
    }
  }
}

// Take out all non collisions
for (let key in collisiondb) {
  if (collisiondb[key].length < 2) {
    delete collisiondb[key];
  }
}

// Write to a file
console.log(collisiondb);

function addToDb(prefix, symbol) {
  
  let fullSymbol;
  let abbrSymbol;
  if (prefix) {
    fullSymbol = "[" + prefix + "]" + symbol;
    abbrSymbol = prefix + symbol;
  } else {
    fullSymbol = symbol;
    abbrSymbol = symbol;
  }
  if (!collisiondb.hasOwnProperty(abbrSymbol)) {
    collisiondb[abbrSymbol] = [fullSymbol];
  } else {
    collisiondb[abbrSymbol].push(fullSymbol);
  }
}
