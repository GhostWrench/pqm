Physical Quantities and Measures (PQM)
================================================================================

PQM is a node.js and browser javascript library for dealing with numbers with
units like "10 meters". With it you can create variables that represent these
physical quantities and use them for math just like a normal numeric variable.

PQM is designed to be simple, lightweight and fast. In addition:
* It has no dependencies
* Provides definitions for nearly 200 common units, as well as providing the
  ability for the user to define their own
* The minified and zipped module is less than 6 kB
* Quantity objects have an optional strict unit definition that eliminates the 
  possibility of "unit collisions" that plague many other libraries of 
  this type
* Arrays are fully supported for more efficient processing
* Conversion factors are tested against conversions defined in 
  [Special Publication 811: NIST Guide to the SI](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9)

Comparison to similar packages
--------------------------------------------------------------------------------

| Feature                       | pqm      | js-quantities | convert-units | mathjs    | unitmath |
|:----------------------------- | -------- | ------------- | ------------- | --------- | -------- |
| __Overview__                                                                                    |
| Version Tested                | 0.4.4    | 1.7.5         | 2.3.4         | 7.0.0     | 0.8.5    |
| Number of Dependencies        | 0        | 0             | 2             | 8         | 1        |
| Number of Dependents          | 0        | 39            | 143           | 984       | 0        |
| Unpacked Size                 | 216 kB   | 585 kB        | 106 kB        | 10.1 MB   | 522 kB   |
| Minified & GZip Size          | 5.7 kB   | 8.8 kB        | 5.8  kB       | 152.0 kB  | 9.7  kB  |
| Node (CommonJS)               | Yes      | Yes           | Yes           | Yes       | Yes      |
| Browser                       | Yes      | Yes           | No            | Yes       | Probably |
| ES Module                     | Yes      | Yes           | Yes           | Yes       | Yes      |
| Support for Unit Prefixes     | Yes      | Yes           | Limited       | Yes       | Yes      |
| Number of Base Units Supported| 193      | 187           | 61            | 162       | 135      |
| Define Custom Units           | Yes      | No            | No            | Yes       | Yes      |
| Tracks input units            | No       | Yes           | No            | Yes       | Yes      |
| Support For Basic Math        | Yes      | Yes           | No            | Yes       | Yes      |
| Test Coverage                 | 78%      | Unknown       | Unknown       | Unknown   | 99%      |
| __Supported Operators__                                                                         |
| Add / Subtract                | Yes      | Yes           | No            | Yes       | Yes      |
| Multiply / Divide             | Yes      | Yes           | No            | Yes       | Yes      |
| Raise Power                   | Yes      | No            | No            | Yes       | Yes      |
| Root                          | Yes      | No            | No            | Yes       | Yes      |
| Comparison Operators          | Yes      | Yes           | No            | == only   | Yes      |
| Works with arrays             | Yes      | Yes           | No            | Yes       | No       |
| __Benchmarks__                                                                                  |
| Module load time              | 1.9 ms   | 4.5 ms        | 14.7 ms       | 366 ms    | 39.5 ms  |
| Simple Conversion (mL -> gal) | 0.60 ms  | 5.0 ms        | 0.27 ms       | 0.34 ms   | 0.40 ms  |
| Compound Unit Conversion      | 0.75 ms  | 5.0 ms        | N/A           | 0.44 ms   | 0.50 ms  |
| Math Operations               | 0.18 ms  | 50x           | N/A           | 22x       | 24x      |
| Math with length 1000 Arrays  | 4.5 ms   | 


Installing and importing PQM
--------------------------------------------------------------------------------

### Installation

`npm install pqm`

### Importing the module

PQM provides both ESM and CommonJS packages upon installation:

```javascript
// ESM
import pqm from "pqm";
```

```javascript
// CommonJS
var pqm = require("pqm");
```

If using PQM in a browser, the ESM module can be used directly:

```html
<script src="path/to/pqm.js" type="module"></script>
```

Or a simple IIFE package can be found in `build\iife\pqm.js`.


Creation of Basic Quantity Variables
--------------------------------------------------------------------------------

### Create a basic quantity

Use the `pqm.quantity` constructor to create a physical quantity

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

By combining units with "/", all units after the division will be inverted,
do not use parenthesis.

```javascript
let q = pqm.quantity(10, "g m^2 / s^3");
```

The above is equivalent to the following expression using negative powers:

```javascript
let q = pqm.quantity(10, "g m^2 s^-3");
```

### Create a quantity with unit prefixes

Prefixes such as kilo (`k`) or micro (`m`) can be added to any unit. The 
preferred syntax for doing so is to enclose the prefix in brackets in front of
the unit. For instance use `[k]g` instead of `kg`. There are multiple reasons
for this convention.

1) Using brackets will give your code a slight performance boost
2) You will completely avoid 'unit collision' where you might use the wrong 
   unit on accident. Consider `min` (minute) vs. `[m]in` (milliinch)
3) Your units will be explicit and easy to read

Of course, if you would prefer not to use brackets, the quantity function will
try to figure out what prefix-unit pair you meant by trial and error.

```javascript
let q = pqm.quantity(10, "[k]m / [m]s");
```

Here is the full list of unit collisions to be aware of

| Unit Symbol | Returns                    | Does Not Return       |
| ----------- | -------------------------- | --------------------- |
| `ppt`       | `ppt` (Parts per Trillion) | `[p]pt` (pico-pint)   |
| `min`       | `min` (Minute)             | `[m]in` (milli-inch)  |
| `nmi`       | `nmi` (Nautical Mile)      | `[n]mi` (nano-mile)   |
| `Gs`        | `Gs` (Gauss)               | `[G]s` (Giga-second)  |
| `PS`        | `PS` (Metric Horsepower)   | `[P]S` (Peta-Siemens) |
| `dword`     | `dword` (Double Word)      | `[d]word` (deci-word) |


### Notes on quantity creation

[This is a table of all units supported by PQM](doc/unittable.md), use it as 
a reference for all the available units provided by this package. Be aware
that unit names are _case sensitive_. For example a `rad` is a Radian and a 
`RAD` is a Radiation Absorbed Dose.


Convert quantities to a different unit of measure
--------------------------------------------------------------------------------

The value of a quantity can be obtained in any equivalent unit using the `in`
function.

```javascript
let q = pqm.quantity(1, "[k]m");
q.in("m"); // 1000.0
q.in("ft"); // 3280.839895013123
```

While users are always encouraged to use the `in` function for conversion,
there are other variants of this function that convert quantities to a human
readable form that are easier to use. Namely:

| Function     | Attempts to convert the quantity to                |
| ------------ |:-------------------------------------------------- |
| `inSI()`     | SI Base and derived unit representation            |
| `inCGS()`    | CGS (centimeter, gram second) unit representation  |
| `inUS()`     | US Customary unit representation                   |
| `toString()` | String in SI Unit systems                          |

Because of the many different ways that units can be represented, these 
functions may not always give you an answer that is appropriate. But they are
useful for troubleshooting and understanding what the current state of a 
quantity is, so they have been included in PQM. Also note that only `inSI` can
represent any quantity. Other functions may throw errors if they cannot be used
to fully represent the quantity.


Perform math operations on physical quantities
--------------------------------------------------------------------------------

Adding and subtracting units which are dimensionally equivalent

```javascript
let q1 = pqm.quantity(1, "m");
let q2 = pqm.quantity(10, "[c]m");

q1.add(q2).in("[c]m"); // 110
q1.sub(q2).in("[c]m"); // 90
```

Multiplying and dividing quantities with any other quantity or scalar

```javascript
let q1 = pqm.quantity(10, "m / s");
let q1 = pqm.quantity(5, "s");

q1.mul(50).in("m / s"); // 500
q1.mul(q2).in("m"); // 50
q1.div(q2).in("m / s^2"); // 2
```

Raise quantities to an integer power

```javascript
let q = pqm.quantity(1000, "m");
q.pow(2).in("[k]m^2"); // 1
```

Inverting a quantity

```javascript
let q1 = pqm.quantity(10, "m");

q1.inv().in("1 / m"); // 0.1
```

Definition of Custom Physical Quantities
--------------------------------------------------------------------------------
There are many units which are not included by default in the PQM module. 
Fortunately, users are allowed to define their own units. Take the following
example that adds the "thermochemical" definitions of Calorie (cal) and 
British Thermal Unit (BTU) which differ slightly from the standard versions.

```javascript
pqm.define("cal_th", 4.184, "J"); // By definition
pqm.define("BTU_th", 1, "cal_th deltaF lbm / deltaC g");

console.log(pqm.quantity(1, "BTU").in("J")); // 1055.05585262
console.log(pqm.quantity(1, "BTU_th").in("J")); // 1054.3502644888652
```

Comparisons of Quantities
--------------------------------------------------------------------------------

The following table describes the various comparison operators available 

| Function | Operation                  |
| -------- |:-------------------------- |
| eq       | Equal `==`                 |
| lt       | Less than `<`              |
| lte      | Less than or equal `<=`    |
| gt       | Greater than `>`           |
| gte      | Greater than or equal `>=` |

Each of these operators takes another quantity and a tolerance. The tolerance 
determines how close in magnitude two quantities can be to be considered equal.
This tolerance can be provided as another compatible quantity, or as a percent
of the left (calling) quantity. If a tolerance is not provided, 0 percent will
be assumed. For example:

```javascript
let q1 = pqm.quantity(1000, "[m]m / s");
let q2 = pqm.quantity(1001, "[m]m / s");
let q3 = pqm.quantity(1003, "[m]m / s");
let absoluteTolerance = pqm.quantity(2, "[m]m / s");

q1.eq(q2) // false
q1.eq(q2, absoluteTolerance); // = true
q1.lt(q2, absoluteTolerance); // = false
q1.lt(q3, absoluteTolerance); // = true
q1.eq(q2, 1e-6); // = false
q1.eq(q2, 1e-2); // = true
```

More comparison examples

```javascript
let q1 = pqm.quantity(10, "m");
let q2 = pqm.quantity(10, "m^2");

q1.eq(q2); // error
q1.pow(2).eq(q2); // false
q1.pow(2).gt(q2); // true
q1.pow(2).div(10).eq(q2, 1e-6); // true
```

Note on temperatures and other units with zero offsets
--------------------------------------------------------------------------------

There are a few temperature and pressure units that have zero offsets. This 
means that 0 is not the same in these units as it is in the SI base unit 
(Kelvin, "K"). The two most widely used of these units are `degC` 
(Degrees Celsius) and `degF` (Degrees Fahrenheit). These units are limited in 
what operations can be done to them. There are also two complimentary units 
`deltaC` and `deltaF` that represent changes in temperature that do not have 
these restrictions, but do not convert the way it is normally expected that 
these units convert. The table below gives the available operations for each 
type of unit.

| Operation | `deg` unit behavior                     | Example                |
| --------- |:--------------------------------------- |:---------------------- |
| `in`      | Can be converted to any compatible unit | 0 degC -> 32 degF      |
| `add`     | Allowed, but only with delta unit       | 10 degC + 10 deltaC -> 20 degC |
| `sub`     | Allowed, subtracting a delta unit will preserve the zero offset, subtracting a zero offset unit will create a new delta unit | 20 degC - 10 deltaC -> 10 degC </br> 20 degC - 10 degC -> 10 deltaC |
| `mul`     | Allowed only with unit-less quantity    | 10 degC * 10 -> 100 degC |
| `div`     | Allowed only with unit-less quantity    | 10 degC / 2 -> 5 degC  |
| `inv`     | Not allowed                             |                        |
| `pow`     | Not allowed                             |                        |
| Comparison operators (`eq`, `lt`, `lte`, `gt`, `gte`) | Allowed, but only with absolute tolerances | 10 degC > 32 degF -> true |

It is recommended that the use of `deg` units be for simple conversions and that
if more advanced math or compound units are needed, use the `delta` version of 
the units. However, be careful, as they may not convert as expected:

```javascript
let zeroDeltaC = pqm.quantity(0, "deltaC");
let someDeltaF = pqm.quantity(32, "deltaF");
let absoluteZero = pqm.quantity(0, "K");

zeroDeltaC.eq(absoluteZero); // = true
zeroDeltaC.eq(someDeltaF); // = false

let freezingDegC = pqm.quantity(0, "degC");

freezingDegC.in("deltaC"); // = 273.15
```

Using arrays
--------------------------------------------------------------------------------

Full support for arrays is available, when crunching large amounts of data, it 
is much more efficient to use quantity arrays. A quantity array can be created
the same way a normal quantity is created using the `quantity` constructor:

```javascript
let qarr1 = pqm.quantity([1,2,3], "m / s^2");
let qarr2 = pqm.quantity([1,4,3], "m / s^2");
```

Array quantities use any of the math operations available to scalar quantities,
but the `in`, `inSI` and comparison functions like `eq` will return an array
rather than a number or boolean value.

```javascript
qarr1.in("[k]m / s^2"); // [1e-3, 2e-3, 3e-3]
qarr1.eq(qarr2); // [true, false, true]
```

Operations such as `add`, `sub`, `mul` operate slightly differently depending
on their inputs.

  1. For two array of the same length, the operation is done element-wise
  2. For a scalar (or length 1 array) with an array, the scalar is applied
     through the full array.

For example:

```javascript
qarr1.add(qarr2).in("m / s^2"); // [2, 6, 6]
let scalar = pqm.quantity(2, "[k]g");
let len1 = pqm.quantity([2], "m");
scalar.mul(qarr1).in("N"); // [2, 4, 6]
qarr1.div(len1).in("1 / s^2"); // [0.5, 1, 1.5]
```

Finally, note that any operation with an array will result in an array value,
even if the array is of length one. This may necessitate a change in the 
calling code if it is expecting a number instead of an array.

```javascript
scalar.in("g"); // 1000
scalar.mul(len1).in("g m"); // [1000]
```

Table of available units
--------------------------------------------------------------------------------

[Link](doc/unittable.md)


Table of available unit prefixes
--------------------------------------------------------------------------------

| Prefix symbol | Name  | Modifying Value |
| ------------- | ----- | --------------- |
| y             | yocto | 1e-24           |
| z             | zepto | 1e-21           |
| a             | atto  | 1e-18           |
| f             | femto | 1e-15           |
| p             | pico  | 1e-12           |
| n             | nano  | 1e-9            |
| u             | micro | 1e-6            |
| m             | milli | 1e-3            |
| c             | centi | 1e-2            |
| d             | deci  | 1e-1            |
| da            | deca  | 1e1             |
| h             | hecto | 1e2             |
| k             | kilo  | 1e3             |
| M             | mega  | 1e6             |
| G             | giga  | 1e9             |
| T             | tera  | 1e12            |
| P             | peta  | 1e15            |
| E             | exa   | 1e18            |
| Z             | zetta | 1e21            |
| Y             | yotta | 1e24            |
| Ki            | kibi  | 2^10            |
| Mi            | mebi  | 2^20            |
| Gi            | gibi  | 2^30            |
| Ti            | tebi  | 2^40            |
| Pi            | pebi  | 2^50            |
| Ei            | exbi  | 2^60            |
| Zi            | zebi  | 2^70            |
| Yi            | yobi  | 2^80            |
