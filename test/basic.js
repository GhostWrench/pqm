/** 
 * Definition of all tests common (node and browser) tests for PQM
 */

import pqm from "../src/pqm.js";

/**
 * Function to run all tests for PQM. Running this function in 
 * 
 * @param {Element} div If running in the browser, this is a div where test
 *                      information can be inserted.
 */
function testBasics(div) {

  let failures = 0;

  // Test various operations and conversions
  failures += runner("Add and convert simple units", div, function () {
    let v1 = pqm.quantity(10, "ft");
    let v2 = pqm.quantity(10, "yd");
    let v3 = v1.add(v2);
    let expected = pqm.quantity(40, "ft");
    if (!v3.eq(expected)) {
      return "Add equals failed";
    }
    if (v3.in("ft") != 40) {
      return "Add in failed"
    }
    return "Pass";
  });

  failures += runner("Subtract and convert simple units", div, function () {
    let v1 = pqm.quantity(10, "ft");
    let v2 = pqm.quantity(10, "yd");
    let v3 = v1.sub(v2);
    let expected = pqm.quantity(-20, "ft");
    if (!v3.eq(expected)) {
      return "Subtract equals failed";
    }
    if (v3.in("ft") != -20) {
      return "Subtract in failed";
    }
    return "Pass";
  });

  failures += runner("Multiply and convert simple units", div, function () {
    let v1 = pqm.quantity(10, "ft");
    let v2 = pqm.quantity(10, "yd");
    let v3 = v1.mul(v2);
    let expected = pqm.quantity(300, "ft^2");
    if (!v3.eq(expected, 1e-10)) {
      return "Multiply equals failed";
    }
    if (v3.in("ft^2") != 300) {
      return "Multiply in failed";
    }
    return "Pass";
  });

  failures += runner("Divide and convert simple units", div, function () {
    let v1 = pqm.quantity(60, "ft^2");
    let v2 = pqm.quantity(10, "yd");
    let v3 = v1.div(v2);
    let expected = pqm.quantity(2, "ft");
    if (!v3.eq(expected, 1e-10)) {
      return "Division equals failed"
    }
    if (Math.abs(v3.in("ft") - 2) >= 1e-10) {
      return "Division in failed";
    }
    return "Pass";
  });

  failures += runner("Raise power and convert simple units", div, function () {
    let v1 = pqm.quantity(1, "[c]m");
    let v2 = v1.pow(2);
    let expected = pqm.quantity(0.0001, "m^2");
    if (!v2.eq(expected)) {
      return "Power equals failed";
    }
    if (v2.in("m^2") != 0.0001) {
      return "Power in failed";
    }
    return "Pass";
  });

  failures += runner("Raise power and multiply complex units", div, function () {
    let v1 = pqm.quantity(1, "A");
    let v2 = pqm.quantity(10, "ohm");
    let v3 = v1.pow(2).mul(v2);
    let expected = pqm.quantity(10, "W");
    if (!v3.eq(expected)) {
      return "I^2 R equals failed";
    }
    if (v3.in("W") != 10) {
      return "I^2 R in failed";
    }
    return "Pass";
  });

  failures += runner("Raise power and divide complex units", div, function () {
    let v1 = pqm.quantity(1, "V");
    let v2 = pqm.quantity(0.1, "[m]ohm");
    let v3 = v1.pow(2).div(v2);
    let expected = pqm.quantity(10, "[k]W");
    if (!v3.eq(expected, 1e-10)) {
      return "V^2 / R failed equals";
    }
    if (Math.abs(v3.in("[k]W") - 10) >= 1e-10) {
      return "V^2 / R failed in";
    }
    return "Pass";
  });

  failures += runner("Multiply complex units and convert", div, function () {
    let v1 = pqm.quantity(10, "N");
    let v2 = pqm.quantity(10, "m");
    let v3 = v1.mul(v2);
    let expected = pqm.quantity(100, "J");
    if (!v3.eq(expected)) {
      return "F * D failed equals";
    }
    if (v3.in("J") != 100) {
      return "F * D failed in";
    }
    return "Pass";
  });

  failures += runner("Quantity inversion and unit-less quantities", div, function () {
    let v1 = pqm.quantity(10, "m");
    let v2 = v1.inv();
    let v3 = pqm.quantity(1).div(v1);
    let expected = pqm.quantity(0.1, "1 / m");
    if (!v2.eq(expected)) {
      return "Invert (type 1) equals did not work";
    }
    if (v2.in("1 / m") != 0.1) {
      return "Invert (type 1) in did not work";
    }
    if (!v3.eq(expected)) {
      return "Invert (type 2) equals did not work";
    }
    if (v3.in("1 / m") != 0.1) {
      return "Invert (type 2) in did not work";
    }
    return "Pass";
  });

  failures += runner("Test standard temperature conversions", div, function () {
    let cold1 = pqm.quantity(0, "degC");
    let cold2 = pqm.quantity(32, "degF");
    let tolerance = pqm.quantity(0.1, "deltaC");
    let expectedCold = pqm.quantity(273.15, "K");
    if (!cold1.eq(cold2, tolerance)) {
      return "Cold C and F values did not match";
    }
    if (!cold1.eq(expectedCold, tolerance)) {
      return "Cold C and K values did not match";
    }
    return "Pass";
  });

  failures += runner("Test delta temperature conversions", div, function () {
    let q1 = pqm.quantity(9, "deltaF");
    let q2 = pqm.quantity(5, "deltaC");
    if (!q1.eq(q2, 0.1)) {
      return "Temperature delta C and F did not convert correctly";
    }
    let q3 = pqm.quantity(1, "1 / s");
    let expected = pqm.quantity(5, "K / s");
    if (!q2.mul(q3).eq(expected)) {
      return "Temperature multiplication failed";
    }
    return "Pass";
  });

  failures += runner("Test offset unit math with gauge pressures", div, function() {
    let atm = pqm.quantity(1.0, "atm");
    let abs = pqm.quantity(10, "[k]Pa");
    let gauge = pqm.quantity(10, "kPa-g");
    let gauge2 = pqm.quantity(20, "kPa-g");
    if (!gauge.add(abs).eq(gauge2)) {
      return "Addition of zero offset with abs failed";
    }
    if (!gauge.sub(abs).eq(atm)) {
      return "Subtraction of zero offset with abs failed";
    }
    if (!gauge2.sub(gauge).eq(abs)) {
      return "Subraction of two zero offset quantities failed";
    }
    if (atm.in("Pa-g") != 0) {
      return "Conversion from abs to zero offset failed";
    }
    return "Pass";
  });

  failures += runner("Test comparison operators", div, function () {
    let q1 = pqm.quantity(1, "m");
    let q2 = pqm.quantity(101, "[c]m");
    let smallTolerance = pqm.quantity(1, "[m]m");
    let largeTolerance = pqm.quantity(2, "[c]m");
    if (!q1.lt(q2, smallTolerance)) {
      return "Less than operation failed";
    }
    if (!q2.gt(q1, smallTolerance)) {
      return "Greater than operation failed";
    }
    if (!q2.lte(q1, largeTolerance)) {
      return "Less than or equals failed";
    }
    if (!q1.gte(q2, largeTolerance)) {
      return "Greater than or equals failed";
    }
    return "Pass";
  });

  failures += runner("Test user defined units", div, function () {
    pqm.define("foobar", 10, "league / day");
    pqm.define("barfoo", 0.1, "day / league");
    let q = pqm.quantity(1, "foobar / barfoo");
    let expected = pqm.quantity(100, "league^2 / day^2");
    if (!q.eq(expected, 1e-10)) {
      return "Failed custom unit creation";
    }
    return "Pass";
  });

  failures += runner("Test the 'with' function", div, function () {
    // Units with multiple 
    let m4 = pqm.quantity(100000000, "[c]m^4");
    let test = m4.with(["K", "m", "s", "rad"]);
    if (test[0] != 1) {
      return "Function 'with()' magnitude conversion failed";
    }
    if (test[1] != "m^4") {
      return "Function 'with()' unit conversion failed";
    }
    let newtonInv = pqm.quantity(1, "s^2 / [k]g m");
    test = newtonInv.with(["[k]g", "m", "s", "N"]);
    if (test[0] != 1) {
      return "Function 'with()' magnitude conversion failed";
    }
    if (test[1] != "1 / N") {
      return "Function with() unit conversion failed"
    }
    let cms = pqm.quantity(1, "m / s");
    test = cms.with(["[k]m",  "[k]s"]);
    if (test[0] != 1) {
      return "Function 'with()' magnitude conversion failed";
    }
    if (test[1] != "[k]m / [k]s") {
      return "Function 'with()' unit conversion failed";
    }
    return "Pass";
  });

  failures += runner("Test standard conversions", div, function() {
    let newton = pqm.quantity(1, "N");
    let test = newton.inSI();
    if (test[0] != 1) {
      return "SI magnitude conversion failed";
    }
    if (test[1] != "N") {
      return "SI unit conversion failed";
    }
    test = newton.inCGS();
    if (!(Math.abs(test[0] - 1.0e5) < 1e-10)) {
      return "CGS magnitude conversion failed";
    }
    if (test[1] != "dyn") {
      return "CGS unit conversion failed";
    }
    test = newton.inUS();
    if (!(Math.abs(test[0] - 0.224809) < 1e-6)) {
      return "US Customary magnitude conversion failed";
    }
    if (test[1] != "lbf") {
      return "US Customary unit conversion failed";
    }
    return "Pass";
  });

  // Throw error if any of the tests failed
  if (failures > 0) {
    throw `${failures} tests failed`;
  } else {
    console.log("All basic tests passed");
  }
};

/**
 * Utility function to run a test function and report the results
 * 
 * @param {string} name Name of the test represented by the 'func' input
 * @param {Element} div Div to put the results of the test into. Pass in 
 *                      undefined if results should be displayed to the console
 *                      only (nodejs)
 * @param {function} func Function to be run. Must take no inputs and outputs a
 *                        string that can be either "Pass" if the test has 
 *                        passed or some other message if the test has failed.
 * 
 * @returns {number} Indication of whether the test has passed (0) or 
 *                   failed (1)
 */
function runner(name, div, func) {
  let result = "";
  let returnValue = 0;
  try {
    result = func();
    if (result != "Pass") {
      returnValue = 1;
    }
  } catch (err) {
    result = err.message;
    returnValue = 1;
  }
  if (div) {
    let divChild = document.createElement('div');
    let testTitle = document.createElement('h2');
    testTitle.append(document.createTextNode(name));
    divChild.append(testTitle);
    let testResult = document.createElement('p');
    testResult.append(document.createTextNode(result));
    divChild.append(testResult);
    if (result == "Pass") {
      divChild.classList.add('pass');
    } else {
      divChild.classList.add('fail');
    }
    div.append(divChild);
  }
  console.log(`${name}: ${result}`);
  return returnValue;
}

export default testBasics;
