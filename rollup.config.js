export default [{
  input: "./src/pqm.mjs",
  output: {
    file: "./build/es/pqm.mjs",
    format: "es"
  }
}, {
  input: "./src/pqm.mjs",
  output: {
    file: "./build/cjs/pqm.cjs",
    format: "cjs"
  }
}, {
  input: "./src/pqm.mjs",
  output: {
    file: "./build/iife/pqm.js",
    format: "iife",
    name: "pqm"
  }
}];
