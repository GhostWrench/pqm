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