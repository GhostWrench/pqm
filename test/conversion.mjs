/**
 * Test script that tests conversions against the transcribed NIST table in
 * the 'tables' folder. This test can only be run in Node.js since it requires
 * access to these CSV files.
 */

import fs from "fs";

import pqm from "../build/es/pqm.mjs";
//import pqm from "../src/pqm.mjs";

const globalTolerance = 1e-6;

function testConversions() {

  function testTables(filename) {
    console.log(`\nTesting conversions in ${filename}`);
    let data = fs.readFileSync(filename, () => {
      throw `Can't load file ${filename}`;
    }).toString().split("\n");
    let totalFailures = 0;
    for (let ii = 1; ii < data.length; ii++) {
      if (data[ii].trim() == "") {
        continue;
      }
      let line = data[ii].split(",");
      let convertFrom = line[0].split("(")[0].trim();
      let convertTo = line[1].split("(")[0].trim();
      let convertFactor = Number.parseFloat(line[2].trim());
      let pqmSupport = line[3].trim();
      let testPassed = true;
      if (pqmSupport === "true") {
        let q1 = pqm.quantity(1, convertFrom);
        let q2 = pqm.quantity(convertFactor, convertTo);
        if (q1.eq(q2, globalTolerance)) {
          testPassed = true;
        } else {
          testPassed = false;
          totalFailures += 1;
        }
        console.log(`1 ${convertFrom} == ${convertFactor} ${convertTo} -> ${testPassed}`);
      } else if (!(pqmSupport === "false")) {
        throw "'Included in PQM' column must be 'true' or 'false'";
      }
    }
    return totalFailures;
  }

  let totalFailures = 0;

  // Test the files in test/tables
  totalFailures += testTables("test/tables/Acceleration.csv");
  totalFailures += testTables("test/tables/Angle.csv");
  totalFailures += testTables("test/tables/Area.csv");
  totalFailures += testTables("test/tables/ElectricityAndMagnetism.csv");
  totalFailures += testTables("test/tables/Energy.csv");
  totalFailures += testTables("test/tables/FlowRate.csv");
  totalFailures += testTables("test/tables/Force.csv");
  totalFailures += testTables("test/tables/FuelConsumption.csv");
  totalFailures += testTables("test/tables/Heat.csv");
  totalFailures += testTables("test/tables/Length.csv");
  totalFailures += testTables("test/tables/Luminosity.csv");
  totalFailures += testTables("test/tables/Mass.csv");
  totalFailures += testTables("test/tables/Power.csv");
  totalFailures += testTables("test/tables/PressureAndStress.csv");
  totalFailures += testTables("test/tables/Radiology.csv");
  totalFailures += testTables("test/tables/TemperatureDelta.csv");
  totalFailures += testTables("test/tables/Time.csv");
  totalFailures += testTables("test/tables/Velocity.csv");
  totalFailures += testTables("test/tables/Viscosity.csv");
  totalFailures += testTables("test/tables/Volume.csv");

  if (totalFailures > 0) {
    throw `${totalFailures} failed unit conversions`;
  } else {
    console.log("All conversions matched successfully");
  }
}

export default testConversions;
