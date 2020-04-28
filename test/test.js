/** 
 * All tests for PQM
 */

results = document.getElementById('results');

runTest("Test basic arithmetic functions", results, function() {
    let v1 = new pqm.Quantity(1, {length: 1});
    let v2 = new pqm.Quantity(2, {length: 1});
    // Addition
    let expectedSum = new pqm.Quantity(3, {length: 1});
    let sum = v1.add(v2);
    if (!sum.equals(expectedSum, 1e-10)) {
        return "Addition of two quantities failed";
    }
    // Subtraction
    let expectedDiff = new pqm.Quantity(-1, {length: 1});
    let diff = v1.subtract(v2);
    if (!diff.equals(expectedDiff, 1e-10)) {
        return "Subtraction of two quantities failed";
    }
    // Multiplication
    let expectedProd = new pqm.Quantity(2, {length: 2});
    let prod = v1.multiply(v2);
    if (!prod.equals(expectedProd, 1e-10)) {
        return "Multiplication of two quantities failed";
    }
    // Division
    let expectedQuot = new pqm.Quantity(0.5);
    let quot = v1.divide(v2);
    if (!quot.equals(expectedQuot, 1e-10)) {
        return "Division of two quantities failed";
    }
    // Exponentiation
    let expectedExpn = new pqm.Quantity(4, {length: 2});
    let expn = v2.power(2);
    if (!expn.equals(expectedExpn, 1e-10)) {
        return "Exponentiation by integer failed";
    } 
    // All tests passed, return Pass value
    return "Pass";
});

// Test various operations and conversions
runTest("Add and convert simple units", results, function() {
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

runTest("Subtract and convert simple units", results, function() {
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

runTest("Multiply and convert simple units", results, function() {
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

runTest("Divide and convert simple units", results, function() {
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

runTest("Raise power and convert simple units", results, function() {
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

runTest("Raise power and multiply complex units", results, function() {
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

runTest("Raise power and divide complex units", results, function() {
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

runTest("Multiply complex units and convert", results, function() {
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
