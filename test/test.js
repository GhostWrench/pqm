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
    return "Pass";
});