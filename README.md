Physical Quantities and Measures (PQM)
================================================================================

PQM is a node.js and browser javascript library for dealing with numbers with
units like "10 meters". With it you can create variables that represent these
physical quantities and use them for math just like a normal numeric variable.

In addition PQM is designed to be simple, lightweight and fast. It has no 
dependencies and the entire module, including unit definitions live in a 
single file that is ~1000 total lines. It also requires a strict definition of 
units that eliminates the possiblity of "unit collisions" that plauge many 
other libraries of this type.

Create a physical quantity variable
--------------------------------------------------------------------------------

### Importing the module

PQM uses the ES6 module scheme by default, to import use the following line:

```javascript
import pqm from "pqm";
```

### Create a basic quantity

Use the `pqm.quantity` constructor to create a physial quantity

```javascript
let q = pqm.quantity(10, "m");
```

### Create a quantity with compound units

By raising the power of the unit:

```javascript
let q = pqm.quantity(10, "m^2");
```

By combining units:

```javascript
let q = pqm.quantity(10, "g m^2");
```

By combining uints with "/", all units after the division will be inverted,
do not use parenthesis.

```javascript
let q = pqm.quantity(10, "g m^2 / s^3");
```

The above is equivalent to the following expression using negative powers:

```javascript
let q = pqm.quantity(10, "g m^2 s^-3");
```

### Create a quantity with unit prefixes

Unit prefixes such as "k" or "m" can be added to units by enclosing them in 
brackets. The brackets are required to decrease the complexity and increase
performance of this module, as well as eliminating the possiblility of unit
"collisions" where the wrong unit might accidentally be used.

```javascript
let q = pqm.quantity(10, "[k]m / [m]s");
```

Convert quantities to a different unit of measure
--------------------------------------------------------------------------------

The value of a quantity can be obtained in any equivalent unit using the "in"
function.

```javascript
let q = pqm.quantity(1, "[k]m");
q.in("m"); // 1000.0
q.in("ft"); // 3280.839895013123
```

Perform math operations on physical quantities
--------------------------------------------------------------------------------

Adding and subtracting units which are dimensionally equivalent

```javascript
let q1 = pqm.quantity(1, "m");
let q2 = pqm.quantity(10, "[c]m");

q1.add(q2).in("[c]m"); // 110
q1.subtract(q2).in("[c]m"); // 90
```

Multiplying and dividing quantities with any other quantity or scalar

```javascript
let q1 = pqm.quantity(10, "m / s");
let q1 = pqm.quantity(5, "s");

q1.multiply(50).in("m / s"); // 500
q1.multiply(q2).in("m"); // 50
q1.divide(q2).in("m / s^2"); // 2
```

Raise quantities to an integer power

```javascript
let q = pqm.quantity(1000, "m");
q.power(2).in("[k]m^2"); // 1
```

Compare two quantities for equality

```javascript
let q1 = pqm.quantity(10, "m");
let q2 = pqm.quantity(10, "m^2");

q1.equals(q2); // false
q1.power(2).equals(q2); // false
q1.power(2).divide(10).equals(q2); // true
```

Inverting a quantity

```javascript
let q1 = pqm.quantity(10, "m");
let q2 = pqm.quantity(0.1, "1 / m");

q1.invert().equals(q2); // True
