// Load the performance testing modules
const {
  performance,
  PerformanceObserver
} = require('perf_hooks');

// Create an observer to test function call performance
const obs = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach((entry) => {
    console.log(`${entry[0]} -> `, entry.duration);
  });
  //obs.disconnect();
});
obs.observe({ entryTypes: ['function'], buffered: true });


// To let load time override the require function
const mod = require('module');
//mod.Module.prototype.require =
//  performance.timerify(mod.Module.prototype.require);
require = performance.timerify(require);

// Call and test performance
const pqm = require("../build/cjs/pqm.cjs");

// Function to define and convert a complex quantity
function defineAndConvertInner(message) {
  let value = pqm.quantity(1.0, "[k]g m^2 / [m]s K");
  return value.in("BTU [k]s / deltaF");
}
const defineAndConvert = performance.timerify(defineAndConvertInner);

// Call and test performance
defineAndConvert("Define And Convert");

// Function to do a lot of math operations
const A = pqm.quantity(10.0, "[k]g");
const B = pqm.quantity(5.0, "[c]m");
const C = pqm.quantity(10.0 ,"s");
// 4*(A * B^2 / C^2) * 2*(A * B^2 / C^2) - (3*(A * B^2 / C^2) * (A * B^2 / C^2))
function doUnitMathInner(message) {
  return (A.mul(B.pow(2)).div(C.pow(2))).mul(4).mul(
    (A.mul(B.pow(2)).div(C.pow(2))).mul(2)
  ).sub(
    (A.mul(B.pow(2)).div(C.pow(2))).mul(3).mul(
      (A.mul(B.pow(2)).div(C.pow(2)))
    )
  );
}
const doUnitMath = performance.timerify(doUnitMathInner);

// Call and test performance
doUnitMath("Do Unit Math");

// Function to convert a value to SI
const D = pqm.quantity(1.0, "1 [k]g lbm in ft [m]m yd / s min shake [m]s");
function doConversionInner(message) {
  return D.inSI();
}
const doConversion = performance.timerify(doConversionInner);

// Call and test performance
let convertedTo = doConversion("Do Conversion");
console.log(`${convertedTo[0]} ${convertedTo[1]}`);
