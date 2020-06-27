/**
 * Test script that tests conversions against the transcribed NIST table in
 * the 'tables' folder. This test can only be run in Node.js since it requires
 * access to these CSV files.
 */

import fs from "fs";

//import pqm from "../build/es/pqm.mjs";
import pqm from "../src/pqm.mjs";

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

  // Test the files in unitdata/nist811
  totalFailures += testTables("unitdata/nist811/Acceleration.csv");
  totalFailures += testTables("unitdata/nist811/Angle.csv");
  totalFailures += testTables("unitdata/nist811/Area.csv");
  totalFailures += testTables("unitdata/nist811/ElectricityAndMagnetism.csv");
  totalFailures += testTables("unitdata/nist811/Energy.csv");
  totalFailures += testTables("unitdata/nist811/FlowRate.csv");
  totalFailures += testTables("unitdata/nist811/Force.csv");
  totalFailures += testTables("unitdata/nist811/FuelConsumption.csv");
  totalFailures += testTables("unitdata/nist811/Heat.csv");
  totalFailures += testTables("unitdata/nist811/Length.csv");
  totalFailures += testTables("unitdata/nist811/Luminosity.csv");
  totalFailures += testTables("unitdata/nist811/Mass.csv");
  totalFailures += testTables("unitdata/nist811/Power.csv");
  totalFailures += testTables("unitdata/nist811/PressureAndStress.csv");
  totalFailures += testTables("unitdata/nist811/Radiology.csv");
  totalFailures += testTables("unitdata/nist811/TemperatureDelta.csv");
  totalFailures += testTables("unitdata/nist811/Time.csv");
  totalFailures += testTables("unitdata/nist811/Velocity.csv");
  totalFailures += testTables("unitdata/nist811/Viscosity.csv");
  totalFailures += testTables("unitdata/nist811/Volume.csv");

  if (totalFailures > 0) {
    throw `${totalFailures} failed unit conversions`;
  } else {
    console.log("All conversions matched successfully");
  }
}

export default testConversions;
