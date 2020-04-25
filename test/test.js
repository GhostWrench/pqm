/** 
 * All tests for PQM
 */

results = document.getElementById('results');

runTest("Add two quantities together", results, function() {
    let v1 = new pqm.Quantity(1, {length: 1});
    let v2 = new pqm.Quantity(2, {length: 1});
    let v3 = new pqm.Quantity(3, {length: 1});
    let sum = v1.add(v2);
    if (!sum.equals(v3, 1e-10)) {
        return "Addition of two quantities failed"
    }
    return "Pass";
});