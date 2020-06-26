/** 
 * Definition of all tests common (node and browser) tests for PQM
 */

import pqm from "../src/pqm.mjs";
//import pqm from "../build/es/pqm.mjs";

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
    if (Array.isArray(v3.in("ft"))) {
      return "Scalar operation returned an array";
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
    if (Array.isArray(v3.in("ft"))) {
      return "Scalar operation returned an array";
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
    if (Array.isArray(v3.in("ft^2"))) {
      return "Scalar operation returned an array";
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
    if (Array.isArray(v3.in("ft"))) {
      return "Scalar operation returned an array";
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
    if (Array.isArray(v2.in("m^2"))) {
      return "Scalar operation returned an array";
    }
    let unity = pqm.quantity(1);
    if (!v1.pow(0).eq(unity)) {
      "Power of zero did not return unity";
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

  failures += runner("Take the root value of a unit", div, function() {
    let q1 = pqm.quantity(64, "m^6 / s^6");
    if (!q1.root(2).eq(pqm.quantity(8, "m^3 / s^3"), 1e-6)) {
      return "Square root failed";
    }
    if (!q1.root(3).eq(pqm.quantity(4, "m^2 / s^2"), 1e-6)) {
      return "Cube root failed";
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
    let gauge = pqm.quantity(10, "[k]Pa-g");
    let gauge2 = pqm.quantity(20, "[k]Pa-g");
    if (!gauge.add(abs).eq(gauge2)) {
      return "Addition of zero offset with abs failed";
    }
    if (!gauge.sub(abs).eq(atm)) {
      return "Subtraction of zero offset with abs failed";
    }
    if (!gauge2.sub(gauge).eq(abs)) {
      return "Subtraction of two zero offset quantities failed";
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

  failures += runner("Test use of rotational units", div, function() {
    let revPerSec = pqm.quantity(2*Math.PI, "rad / s");
    let hz = pqm.quantity(1.0, "Hz");
    if (!revPerSec.eq(hz)) {
      return "Rotational unit to Hz conversion failed";
    }
    return "Pass";
  });

  failures += runner("Ensure that math operations are atomic", div, function() {
    let q1 = pqm.quantity(5.0, "mph");
    let q1c = q1.copy();
    let q2 = pqm.quantity(10.0, "mph");
    let q2c = q2.copy();
    let tol = pqm.quantity(1e-3, "mph");
    // Test addition
    let result = q1.add(q2);
    if (!result.eq(pqm.quantity(15, "mph"), tol) || !q1.eq(q1c) || !q2.eq(q2c)) {
      return "Addition is not atomic";
    }
    // Test subtraction
    result = q1.sub(q2);
    if (!result.eq(pqm.quantity(-5, "mph")) || !q1.eq(q1c) || !q2.eq(q2c)) {
      return "Subtraction is not atomic";
    }
    // Test multiplication
    tol = pqm.quantity(1e-3, "mph^2");
    result = q1.mul(q2);
    if (!result.eq(pqm.quantity(50.0, "mph^2"), tol) || !q1.eq(q1c) || !q2.eq(q2c)) {
      return "Multiplication is not atomic";
    }
    // Test division
    tol = pqm.quantity(1e-3);
    result = q1.div(q2);
    if (!result.eq(pqm.quantity(0.5), tol) || !q1.eq(q1c) || !q2.eq(q2c)) {
      return "Division is not atomic"; 
    }
    // Test exponentiation
    tol = pqm.quantity(1e-3, "mph^3");
    result = q2.pow(3);
    if (!result.eq(pqm.quantity(1000, "mph^3"), tol) || !q1.eq(q1c) || !q2.eq(q2c)) {
      return "Exponentiation is not atomic";
    }
    return "Pass";
  });

  failures += runner("Test units without explict prefix", div, function() {
    // Test single prefix detection
    let q1 = pqm.quantity(1, "[k]m / [m]s");
    let q2 = pqm.quantity(1, "km / ms");
    if (!q1.eq(q2)) {
      return "Prefix detection failed";
    }
    // Test single prefix detection with collision
    q1 = pqm.quantity(1, "min");
    q2 = pqm.quantity(1, "[m]in");
    if (q1.sameDimensions(q2)) {
      return "Prefix detection with collision failed";
    }
    // Test two letter prefix detection
    q1 = pqm.quantity(1, "[Ki]B");
    q2 = pqm.quantity(1, "KiB");
    if (!q1.eq(q2)) {
      return "Prefix with two letter detection failed";
    }
    return "Pass";
  });

  failures += runner("Ensure array and non-array ops return array", div, function() {
    const scalar = pqm.quantity(1, "m^2");
    const arr = pqm.quantity([1], "m^2");
    const operation = [
      "add",
      "subtract",
      "multiply",
      "divide",
      "power",
      "root",
    ];
    const result = [
      scalar.add(arr),
      arr.sub(scalar),
      scalar.mul(arr),
      arr.div(scalar),
      arr.pow(2),
      arr.root(2),
    ];
    const expected = [
      pqm.quantity([2], "m^2"),
      pqm.quantity([0], "m^2"),
      pqm.quantity([1], "m^4"),
      pqm.quantity([1]),
      pqm.quantity([1], "m^4"),
      pqm.quantity([1], "m"),
    ];
    for (let opIdx=0; opIdx<operation.length; opIdx++) {
      if (!result[opIdx].eq(expected[opIdx]).every((val) => val)) {
        return "Array " + operation[opIdx] + " failed";
      }
      if (!Array.isArray(result[opIdx].inSI()[0])) {
        return "Array " + operation[opIdx] + " did not return an array";
      }
    }
    return "Pass";
  });

  failures += runner("Test complex math with arrays", div, function() {
    const A = pqm.quantity([1, 2, 3], "m / s");
    const B = pqm.quantity([1, 2, 3], "[k]g");
    const C = pqm.quantity([1, 2, 3], "s");
    const D = pqm.quantity([1, 2], "m / s");
    let part1 = A.mul(B).div(C);
    let part2 = A.mul(B).div(C);
    let part3 = A.mul(B).div(C);
    let result = part1.add(part2).sub(part3).pow(4).root(2);
    let expected = pqm.quantity([1, 4, 9], "N^2");
    if (!result.eq(expected).every((val) => val)) {
      return "Complex array math failed";
    }
    if (!fails(() => {A.add(D)})) {
      return "Allowed operation on mismatched arrays";
    }
    return "Pass";
  });

  failures += runner("Convert quantities to a string", div, function() {
    const sq = pqm.quantity(1000, "mm");
    if (sq.toString() != "1 m") {
      return "Scalar to SI string failed"
    }
    const aq = pqm.quantity([1000, 2000, 4000], "[m]m");
    let strSI = aq.toString();
    if (strSI != "[1,2,4] m") {
      return "Array to SI string failed";
    }
    let strkm = aq.toString("km");
    if (strkm != "[0.001,0.002,0.004] km") {
      return "Array to km string failed";
    }
    return "Pass";
  });

  failures += runner("Check user quantity construction errors", div, function() {
    if (!fails(() => {pqm.quantity(1, "[GG]m")})) {
      return "Allowed invalid prefix";
    }
    if (!fails(() => {pqm.quantity(1, "[k]bugs")})) {
      return "Allowed use of invalid unit";
    }
    if (!fails(() => {pqm.quantity(1, "[k]")})) {
      return "Allowed ill-defined unit";
    }
    if (!fails(() => {pqm.quantity(1, "[k]m^d")})) {
      return "Allowed bad unit power";
    }
    if (!fails(() => {pqm.quantity(1, "1 / s / s")})) {
      return "Allowed double division unit creation";
    }
    if (!fails(() => {pqm.quantity(1, "degC / Pa-g")})) {
      return "Allowed compound unit with offsets";
    }
    return "Pass";
  });

  failures += runner("Check user input for math", div, function() {
    let Ra = pqm.quantity(1, "Ra");
    let degF = pqm.quantity(1, "degF");
    let ft = pqm.quantity(1, "ft");
    let negative_ft2 = pqm.quantity(-1, "ft^2");
    if (!fails(() => {Ra.add(degF)})) {
      return "Bad addition allowed (variant 1)";
    }
    if (!fails(() => {Ra.add(ft)})) {
      return "Bad addition allowed (variant 2)";
    }
    if (!fails(() => {Ra.sub(ft)})) {
      return "Bad subtraction allowed";
    }
    if (!fails(() => {degF.mul(degF)})) {
      return "Bad multiplication allowed (variant 1)";
    }
    if (!fails(() => {degF.mul(ft)})) {
      return "Bad multiplication allowed (variant 2)";
    }
    if (!fails(() => {degF.inv()})) {
      return "Bad invert allowed";
    }
    if (!fails(() => {degF.div(degF)})) {
      return "Bad division allowed";
    }
    if (!fails(() => {ft.pow([2, 3])})) {
      return "Bad power allowed (variant 1)";
    }
    if (!fails(() => {ft.pow(1.2)})) {
      return "Bad power allowed (variant 2)";
    }
    if (!fails(() => {degF.pow(2)})) {
      return "Bad power allowed (variant 3)";
    } 
    if (!fails(() => {Ra.root([2,3])})) {
      return "Bad root allowed (variant 1)";
    }
    if (!fails(() => {Ra.root(1.2)})) {
      return "Bad root allowed (variant 2)";
    }
    if (!fails(() => {Ra.root(0)})) {
      return "Bad root allowed (variant 3)";
    }
    if (!fails(() => {negative_ft2.root(2)})) {
      return "Bad root allowed (variant 4)";
    }
    if (!fails(() => {ft.root(2)})) {
      return "Bad root allowed (variant 5)";
    }
    if (!fails(() => {ft.in("kg")})) {
      return "Allowed conversion to different type";
    }
    return "Pass";
  });

  failures += runner("Check user inputs for comparisons", div, function() {
    let ft = pqm.quantity(1, "ft");
    let inch = pqm.quantity(1, "in");
    let kg = pqm.quantity(1, "kg");
    let g = pqm.quantity(1, "grav");
    let degF = pqm.quantity(32, "degF");
    let degC = pqm.quantity(0, "degC")
    if (!fails(() => {ft.eq(kg)})) {
      return "Allowed compare between unlike quantities";
    }
    if (!fails(() => {ft.eq(inch, kg)})) {
      return "Allowed compare with unlike tolerance";
    }
    if (!fails(() => {degC.eq(degF, degC)})) {
      return "Allowed "
    }
    if (!fails(() => {degC.eq(degF, 0.01)})) {
      return "Allowed fractional tolerance for unit with zero offset";
    }
    if (ft.compare(inch, inch, false) instanceof Array) {
      return "Scalar comparison returned an array";
    } 
    return "Pass";
  });

  failures += runner("Check output of 'with' function", div, function() {
    let ft = pqm.quantity(1, "ft");
    let sec = pqm.quantity(1, "s^2");
    if (!fails(() => {ft.with(["K", "kg"])})) {
      return "Allowed 'with' conversion with incompatible units";
    }
    if (ft.div(sec).with(["ft", "s"])[1] != "ft / s^2") {
      return "with function did not return correct units";
    }
    return "Pass";
  });

  failures += runner("Test user defined units", div, function() {
    pqm.define("unity");
    pqm.define("dblmeter", 2, "m");
    pqm.define("offmeter", 1, "m", 10);
    let unity = pqm.quantity(1, "unity");
    let dblmeter = pqm.quantity(1, "dblmeter");
    let offmeter = pqm.quantity(1, "offmeter");
    // Test addition
    let expected = pqm.quantity(12, "m");
    if (!offmeter.add(dblmeter).eq(expected)) {
      return "Operation on user defined units did not work";
    }
    expected = pqm.quantity(10, "m");
    if (!offmeter.mul(unity).eq(expected)) {
      return "Operation on user defined units did not work";
    }
    if (!fails(() => {pqm.define("m", 2, "ft")})) {
      return "Allowed redefinition of existing unit";
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

/**
 * Simple utility function that returns true when the provided operation 
 * throws and error, otherwise it returns false
 * 
 * @param {function} func Operation to perform as a closure
 * 
 * @returns {boolean} True if error is thrown, false if it is not
 */
function fails(func) {
  try {
    func()
    return false;
  } catch (err) {
    return true;
  }
}

export default testBasics;
