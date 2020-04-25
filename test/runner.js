/**
 * Function to run a test function and report the results into a div
 * 
 * @param {string} name Name of the test represented by the 'func' input
 * @param {Element} div Div to put the results of the test into
 * @param {function} func Function to be run. Must take no inputs and outputs a
 *                        string that can be either "Pass" if the test has 
 *                        passed or some other message if the test has failed.
 */
function runTest(name, div, func) {
    let result = "";
    try {
        result = func();
    } catch (err) {
        result = err.message;
    }
    divChild = document.createElement('div');
    testTitle = document.createElement('h2');
    testTitle.append(document.createTextNode(name));
    divChild.append(testTitle);
    testResult = document.createElement('p');
    testResult.append(document.createTextNode(result));
    divChild.append(testResult);
    if (result == "Pass") {
        divChild.classList.add('pass');
    } else {
        divChild.classList.add('fail');
    }
    div.append(divChild);
}