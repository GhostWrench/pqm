/** 
 * Definition of all tests for PQM
 */

import pqm from "../src/pqm.js";

/**
 * Function to run all tests for PQM. Running this function in 
 * 
 * @param {Element} div If running in the browser, this is a div where test
 *                      information can be inserted.
 */
function runAllTests(div) {

    let failures = 0;

    // Test various operations and conversions
    failures += runner("Add and convert simple units", div, function() {
        let v1 = pqm.quantity(10, "ft");
        let v2 = pqm.quantity(10, "yd");
        let v3 = v1.add(v2);
        let expected = pqm.quantity(40, "ft");
        if (!v3.equals(expected)) {
            return "Add equals failed";
        }
        if (v3.in("ft") != 40) {
            return "Add in failed"
        }
        return "Pass";
    });

    failures += runner("Subtract and convert simple units", div, function() {
        let v1 = pqm.quantity(10, "ft");
        let v2 = pqm.quantity(10, "yd");
        let v3 = v1.subtract(v2);
        let expected = pqm.quantity(-20, "ft");
        if (!v3.equals(expected)) {
            return "Subtract equals failed";
        }
        if (v3.in("ft") != -20) {
            return "Subtract in failed";
        }
        return "Pass";
    });

    failures += runner("Multiply and convert simple units", div, function() {
        let v1 = pqm.quantity(10, "ft");
        let v2 = pqm.quantity(10, "yd");
        let v3 = v1.multiply(v2);
        let expected = pqm.quantity(300, "ft^2");
        if (!v3.equals(expected, 1e-10)) {
            return "Multiply equals failed";
        }
        if (v3.in("ft^2") != 300) {
            return "Multiply in failed";
        }
        return "Pass";
    });

    failures += runner("Divide and convert simple units", div, function() {
        let v1 = pqm.quantity(60, "ft^2");
        let v2 = pqm.quantity(10, "yd");
        let v3 = v1.divide(v2);
        let expected = pqm.quantity(2, "ft");
        if (!v3.equals(expected, 1e-10)) {
            return "Division equals failed"
        }
        if (Math.abs(v3.in("ft") - 2) >= 1e-10) {
            return "Division in failed";
        }
        return "Pass";
    });

    failures += runner("Raise power and convert simple units", div, function() {
        let v1 = pqm.quantity(1, "[c]m");
        let v2 = v1.power(2);
        let expected = pqm.quantity(0.0001, "m^2");
        if (!v2.equals(expected)) {
            return "Power equals failed";
        }
        if (v2.in("m^2") != 0.0001) {
            return "Power in failed";
        }
        return "Pass";
    });

    failures += runner("Raise power and multiply complex units", div, function() {
        let v1 = pqm.quantity(1, "A");
        let v2 = pqm.quantity(10, "ohm");
        let v3 = v1.power(2).multiply(v2);
        let expected = pqm.quantity(10, "W");
        if (!v3.equals(expected)) {
            return "I^2 R equals failed";
        }
        if (v3.in("W") != 10) {
            return "I^2 R in failed";
        }
        return "Pass";
    });

    failures += runner("Raise power and divide complex units", div, function() {
        let v1 = pqm.quantity(1, "V");
        let v2 = pqm.quantity(0.1, "[m]ohm");
        let v3 = v1.power(2).divide(v2);
        let expected = pqm.quantity(10, "[k]W");
        if (!v3.equals(expected, 1e-10)) {
            return "V^2 / R failed equals";
        }
        if (Math.abs(v3.in("[k]W") - 10) >= 1e-10) {
            return "V^2 / R failed in";
        }
        return "Pass";
    });

    failures += runner("Multiply complex units and convert", div, function() {
        let v1 = pqm.quantity(10, "N");
        let v2 = pqm.quantity(10, "m");
        let v3 = v1.multiply(v2);
        let expected = pqm.quantity(100, "J");
        if (!v3.equals(expected)) {
            return "F * D failed equals";
        }
        if (v3.in("J") != 100) {
            return "F * D failed in";
        }
        return "Pass";
    });

    failures += runner("Quantity inversion and unitless quantities", div, function() {
        let v1 = pqm.quantity(10, "m");
        let v2 = v1.invert();
        let v3 = pqm.quantity(1).divide(v1);
        let expected = pqm.quantity(0.1, "1 / m");
        if (!v2.equals(expected)) {
            return "Invert (type 1) equals did not work";
        }
        if (v2.in("1 / m") != 0.1) {
            return "Invert (type 1) in did not work";
        }
        if (!v3.equals(expected)) {
            return "Invert (type 2) equals did not work";
        }
        if (v3.in("1 / m") != 0.1) {
            return "Invert (type 2) in did not work";
        }
        return "Pass";
    });

    failures += runner("Test standard temperature conversions", div, function() {
        let cold1 = pqm.quantity(0, "degC");
        let cold2 = pqm.quantity(32, "degF");
        let expectedCold = pqm.quantity(273.15, "K");
        if (!cold1.equals(cold2, 0.1)) {
            return "Cold C and F values did not match";
        }
        if (!cold1.equals(expectedCold, 0.1)) {
            return "Cold C and K values did not match";
        }
        return "Pass";
    });

    failures += runner("Test delta temperature conversions", div, function() {
        let q1 = pqm.quantity(9, "deltaF");
        let q2 = pqm.quantity(5, "deltaC");
        if (!q1.equals(q2, 0.1)) {
            return "Temperature delta C and F did not convert correctly";
        }
        let q3 = pqm.quantity(1, "1 / s");
        let expected = pqm.quantity(1, "K / s");
        if (!q2.multiply(q3).equals(expected)) {
            return "Temperature multiplication failed";
        }
        return "Pass";
    });

    if (failures > 0) {
        throw `${failures} tests failed`;
    } else {
        console.log("All tests passed");
    }
};

/**
 * Utility functio    // Check to make sure the unit offsets are compatible
    if ((this.getOffset() == 0 && convertQuantity.getOffset() != 0)) {
      throw ("Quantities without an offset may not be converted to units " +
             "with an offset");
    }n to run a test function and report the results
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

export default runAllTests;
