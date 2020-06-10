Physical Quantities and Measures (PQM)
================================================================================

PQM is a node.js and browser javascript library for dealing with numbers with
units like "10 meters". With it you can create variables that represent these
physical quantities and use them for math just like a normal numeric variable.

PQM is designed to be simple, lightweight and fast. In addition:
* It has no dependencies 
* The entire module, including unit definitions live in a single small file
* Quantity objects require a strict unit definition that eliminates the 
  possibility of "unit collisions" that plague many other libraries of 
  this type
* Conversion factors are tested against conversions defined in 
  [Special Publication 811: NIST Guide to the SI](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9)

Comparison to similar packages
--------------------------------------------------------------------------------

| Feature                       | pqm      | js-quantities | convert-units | mathjs    | unitmath |
|:----------------------------- | -------- | ------------- | ------------- | --------- | -------- |
| __Overview__                                                                                    |
| Version Tested                | 0.2.0    | 1.7.5         | 2.3.4         | 7.0.0     | 0.8.5    |
| Number of Dependencies        | 0        | 0             | 2             | 8         | 1        |
| Number of Dependents          | 0        | 39            | 143           | 984       | 0        |
| Unpacked Size                 | 216 kB   | 585 kB        | 106 kB        | 10.1 MB   | 522 kB   |
| Minified Size (BundlePhobia)  | 13.6 kB  | 30.1 kB       | 23.8 kB       | 623.5 kB  | 34.1 kB  |
| Node (CommonJS)               | Yes      | Yes           | Yes           | Yes       | Yes      |
| Browser                       | Yes      | Yes           | No            | Yes       | Probably |
| ES Module                     | Yes      | Yes           | Yes           | Yes       | Yes      |
| Support for Unit Prefixes     | Yes      | Yes           | Limited       | Yes       | Yes      |
| Number of Base Units Supported| 186      | 187           | 61            | 162       | 135      |
| Define Custom Units           | Yes      | No            | No            | Yes       | Yes      |
| Tracks input units            | No       | Yes           | No            | Yes       | Yes      |
| Support For Basic Math        | Yes      | Yes           | No            | Yes       | Yes      |
| Test Coverage *               | 70%      | Good          | Good          | Good      | 99%      |
| __Supported Operators__                                                                         |
| Add / Subtract                | Yes      | Yes           | No            | Yes       | Yes      |
| Multiply / Divide             | Yes      | Yes           | No            | Yes       | Yes      |
| Raise Power                   | Yes      | No            | No            | Yes       | Yes      |
| Square Root                   | No       | No            | No            | Yes       | Yes      |
| Comparison Operators          | Yes      | Yes           | No            | == only   | Yes      |
| Works with arrays             | No       | Yes           | No            | Yes       | No       |
| __Benchmarks__                                                                                  |
| Module load time              | 3.2 ms   | 4.5  ms       | 14.7 ms       | 366 ms    | 39.5 ms  |
| Simple Conversion (mL -> gal) | 0.38 ms  | 5.0 ms        | 0.27 ms       | 0.34 ms   | 0.40 ms  |
| Compound Unit Conversion      | 0.50 ms  | 5.0 ms        | N/A           | 0.44 ms   | 0.50 ms  |
| Chained Math Operations (multiple of floating point equivalent) | 8.5x | 50x | N/A | 22x | 24x | 

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

Unit prefixes such as kilo (k) or micro (m) can be added to units by enclosing 
them in brackets. The brackets are required to decrease the complexity and 
increase performance of this module, as well as eliminating the possibility of 
unit "collisions" where the wrong unit might accidentally be used.

```javascript
let q = pqm.quantity(10, "[k]m / [m]s");
```

### Notes on quantity creation

At the bottom of this readme there is a table of all units supported by PQM,
use it as a reference and use the unit symbols there for best results. Be aware
that unit names are _case sensitive_ and no aliases are provided (to avoid 
further avoid unit collision). For example a `rad` is a Radian and a `RAD` is
a Radiation Absorbed Dose.

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

There are a few temperature units that have zero offsets. This means that 0 is 
not the same in these units as it is in the SI base unit (Kelvin, "K"). The two
most widely used of these units are `degC` (Degrees Celsius) and `degF`
(Degrees Fahrenheit). These units are limited in what operations can be done to
them. There are also two complimentary units `deltaC` and `deltaF` that 
represent changes in temperature that do not have these restrictions, but do 
not convert the way it is normally expected that these units convert. The table 
below gives the available operations for each type of unit.

| Operation | `deg` unit behavior                     | Example                |
| --------- |:--------------------------------------- |:---------------------- |
| `in`      | Can be converted to any compatible unit | 0 degC -> 32 degF      |
| `add`     | Allowed, but only with delta unit       | 10 degC + 10 deltaC -> 20 degC |
| `sub`     | Allowed, subtracting a delta unit will preserve the zero offset, subtracting a zero offset unit will create a new delta unit | 20 degC - 10 deltaC -> 10 degC </br> 20 degC - 10 degC -> 10 deltaC |
| `mul`     | Not allowed                             |                        |
| `div`     | Not allowed                             |                        |
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

Also note that you cannot use prefixes with zero offset units, doing so will 
result in an error.

Rotational Units
--------------------------------------------------------------------------------
Traditionally, a 'rotation' is not treated as a base dimension in the SI units
of measure, and units that describe a rotation such as `rad` and `deg` are 
defined as unitless. PQM does actually add a rotation base dimension and does
not treat these as unitless because it is seen as a tragic loss of information.
This decision does create a few instances where the library may not appear to 
behave as expected by someone used to the SI convention.

For example, conversions from `rad / s` and `rpm` to Hz are perfectly fine if
rotation is not treated as a base dimension, but in PQM you will get an error. 
The issue here is that there is an implicit full rotation assumed in the
conversion from `rad / s` to `Hz` that is usually divided out as a conversion 
factor of `2π`. The trick with PQM is to make this conversion explicit as in 
the following example:

```javascript
let revPerSec = pqm.quantity(2*Math.PI, "rad / s");
let hz = pqm.quantity(1.0, "Hz");

revPerSec.eq(hz) // error

let oneRev = pqm.quantity(1.0, "rev");
revPerSec.div(oneRev).eq(hz); // true
```

Table of available units
--------------------------------------------------------------------------------

| Unit Name               | Symbol        | Aliases  | Description                                                | 
| ----------------------- | ------------- | -------- | ---------------------------------------------------------- | 
| One                     | 1             |          | Unit non-dimensional quantity                              | 
| Percent                 | %             |          | Non dimensional percent (100 % == 1)                       | 
| Gram                    | g             |          | unit of mass defined as 1e-3 kg                            | 
| Atomic Mass Unit        | u             | AMU      | The approximate mass of one proton or neutron              | 
| Grain                   | grain         |          | Mass approximately equivalent to a single ideal seed of a cereal, in particular wheat or barley | 
| Ounce                   | ozm           |          | US and Imperial unit equal to 1/16 of a Pound Mass         | 
| Pound                   | lbm           |          | US and Imperial primary unit of mass                       | 
| Stone                   | stone         |          | Imperial unit equal to 14 Pounds Mass                      | 
| Slug                    | sg            | slug     | US and Imperial unit defined as 1 lbf / Standard Gravity   | 
| Short Hundredweight     | cwt           |          | Typically used in the US, equal to 100 lbm                 | 
| Short Pennyweight       | dwt           |          | From the weight of an English penny in the Middle Ages, equal to 24 grains or 1/20 of a troy ounce | 
| Long Hundredweight      | uk_cwt        |          | Typically used in the UK, equal to 8 stone                 | 
| Ton                     | ton           |          | US customary unit equal to 2000 lbm                        | 
| UK Ton                  | uk_ton        |          | English customary unit that is equal to 20 Long Hundredweight or 160 Stone | 
| Metric Ton              | metric_ton    | tonne    | Sometimes seen as 'tonne', this mass equals 1000 kg        | 
| Carat                   | carat         |          | Equal to 200 mg, typically used to measure gemstones       | 
| Assay Ton               | assay_ton     |          | Equal to 29 1/6 grams, often used to measure the ores of precious metals | 
| Denier                  | denier        |          | Linear density used in textiles, the linear density of a single strand of silk is approx. 1 denier | 
| Tex                     | tex           |          | Linear density equal to 1 g / km, mainly used for measuring fiber products | 
| Meter                   | m             |          | SI standard unit for length                                | 
| Angstrom                | ang           |          | Equal to 10^-10 meters, often used to express the size of atoms and molecules | 
| Pica Point              | picapt        |          | Used in typography, equal to 1/12 of a pica                | 
| Pica                    | pica          |          | Used in typography, equal to 1/6 of an inch                | 
| Inch                    | in            |          | US and Imperial unit of length equal to 1/12 of a foot     | 
| Foot                    | ft            |          | Standard US and Imperial unit of length                    | 
| Yard                    | yd            |          | US and Imperial unit of length equal to 3 foot             | 
| Ell/Cubit               | ell           |          | Approximate length of a man's arm from elbow to the tip of the fingers | 
| Survey Mile             | survey_mi     |          | US Customary unit equal to 5280 Survey Feet                | 
| Nautical Mile           | nmi           | Nmi      | Approximately 1/60 of a degree of latitude, formally defined as 1852 meters | 
| League                  | league        |          | Originally represented the distance a person could walk in one day, the most recent common usage was in maritime where it is equal to 3 nautical miles | 
| Light Year              | ly            |          | Represents the distance light travels in one year in a vacuum, used in astronomical scales | 
| Parsec                  | parsec        |          | Defined as 648 000 / pi astronomical units (au)            | 
| Survey Foot             | survey_ft     |          | Slightly different definition of foot defined as 1200/3937 meters instead of 0.3048 meters | 
| Astronomical Unit       | au            |          | Approximate distance from the Earth to the Sun             | 
| Chain                   | chain         |          | US customary unit equal to 66 survey ft, sometimes the unit may be based on the internation foot rather than the survey foot changing the definition slightly | 
| Link                    | link          |          | US Customary unit of length equal to 1/100 of a chain      | 
| Rod                     | rod           |          | US Customary unit of length equal to 1/4 of a chain        | 
| Furlong                 | furlong       |          | US Customary unit of length equal to 10 chains             | 
| Fathom                  | fathom        |          | Equal to 6 international foot, typically used to measure depth in maritime applications | 
| US Fathom               | us_fathom     |          | US Customary Fathom, appox. equal to 6 survey foot         | 
| Fermi                   | fermi         |          | Equal to 10^-15 m, Used in nuclear physics and named after physicist Enrico Fermi who was one of the founders of the field | 
| Kayser/Wavenumber       | kayser        |          | Reciprocal of 1 cm, used in spectroscopy and chemistry to represent the number of wavelengths per cm | 
| Second                  | s             | sec      | Approximately 1/86400 of a stellar day, formally defined based on the duration of 9 192 631 770 state transitions of the caesium-133 atom at 0 K | 
| Minute                  | min           |          | Defined as 60 seconds                                      | 
| Hour                    | hr            |          | defined as 60 minute                                       | 
| Day                     | day           |          | Approximately equal to the amount of time for the earth to rotate on it's axis, formally defined as 24 hours | 
| Year                    | yr            |          | Approximately equal to the amount of time for the earth to make one orbit around the sun, formally defined as 365 days | 
| Shake                   | shake         |          | Informal metric unit equal to 10^-8 seconds, often used in nuclear physics | 
| Kelvin                  | K             |          | SI standard unit with 0 defined as absolute zero           | 
| Degrees Fahrenheit      | degF          |          | Temperature scale that is approximately 32 at the melting point of ice and 212 at the boiling point of water | 
| Degrees Celsius         | degC          |          | Temperature unit with a similar scale to Kelvin, but with the 0 approximately defined as the melting point of ice | 
| Delta Celsius           | deltaC        |          | Change in temperature measured in Celsius, this unit does not have a 0 offset similar to 'degC' and thus is sometimes more useful in computations | 
| Rankine                 | Ra            | Rank,deltaF | Units with the same scale as Fahrenheit, but with 0 at absolute 0 | 
| Reaumur                 | Reau          |          | Temperature scale that is approximately 0 at the melting point of ice and 80 at the boiling point of water | 
| Delta Reaumur           | deltaReau     |          | Change in temperature as measured in Reaumurs              | 
| Mile per Hour           | mph           |          | Velocity at which a mile is traveled every hour            | 
| Knot                    | knot          |          | Velocity at which a Nautical mile is traveled every hour   | 
| Admirality Knot         | admkn         |          | Knot based on the old UK definition of a Nautical mile (1853.184 m) | 
| Speed of Light          | c             |          | velocity defined by how fast light travels in a vacuum     | 
| Standard Gravity        | grav          |          | Approximate acceleration of gravity at the surface of the earth | 
| Galileo                 | galileo       |          | CGS system standard unit for acceleration                  | 
| Pascal                  | Pa            |          | SI standard unit for pressure defined as 1 N/m^2           | 
| Meter of Mercury        | mHg           |          | The pressure applied by 1 m of mercury at 1 standard gravity, more commonly used as mmHg or cmHg | 
| Meter of Water          | mH2O          |          | The pressure applied by 1 m of water at 1 standard gravity, more commonly used as mmH2O or cmH2O | 
| Torr                    | Torr          |          | Slightly different definition of mmHg, but very close to the same scale | 
| Pound per Square Inch   | psi           |          | US and Imperial unit of pressure defined as 1 lbf / in^2   | 
| Atmosphere              | atm           |          | Approximately the mean air pressure at sea level           | 
| Bar                     | bar           |          | Defined as 100 000 Pa, which is very close to 1 atmosphere | 
| Inch of Mercury         | inHg          |          | The pressure applied by 1 inch of mercury at 1 standard gravity | 
| Inch of Water           | inH2O         |          | The pressure applied by 1 inch of water at 1 standard gravity | 
| Foot of Mercury         | ftHg          |          | The pressure applied by 1 foot of mercury at 1 standard gravity | 
| Foot of Water           | ftH2O         |          | The pressure applied by 1 foot of water at 1 standard gravity | 
| Barye                   | Ba            |          | CGS standard unit for pressure                             | 
| Gauge Pascal            | Pa-g          |          | Pascal with a zero offset at atmospheric pressure          | 
| Gauge Bar               | bar-g         |          | Bar with a zero offset at atmospheric pressure             | 
| Gauge PSI               | psi-g         |          | psi with a zero offset at atmospheric pressure             | 
| Newton                  | N             |          | SI standard unit for force defined as 1 kg m / s^2         | 
| Dyne                    | dyn           |          | CGS standard unit for force defined as 1 g [c]m / s^2      | 
| Gram Force              | gf            | pond     | Defined as the amount of force exerted by standard gravity on a 1 gram mass | 
| Pound Force             | lbf           |          | Defined as the amount of force exerted by standard gravity on a 1 lbm mass | 
| Ounce Force             | ozf           |          | Equal to 1/16 lbf                                          | 
| Poundal                 | pdl           |          | Force unit in the foot-pound-second system equal to 1 lbm ft / s^2 | 
| Ton Force               | ton-force     |          | Equal to 2000 lbf                                          | 
| Joule                   | J             |          | SI standard unit for energy defined as 1 N m               | 
| Electron Volt           | eV            |          | Energy gain of an electron after passing through a 1 Volt potential | 
| Erg                     | erg           |          | CGS standard unit of energy defined as 1 dyn cm            | 
| Kilocalorie/Calorie     | cal           |          | Based on the amount of energy needed to raise the temperature of 1 kg of water 1 degree Celsius, defined in The Fifth International Conference on the Properties of Steam (London, July 1956) 'International Table' | 
| British Thermal Unit    | BTU           |          | Based on the amount of energy needed to raise the temperature of 1 lbm of water 1 degree Fahrenheit, defined in The Fifth International Conference on the Properties of Steam (London, July 1956) 'International Table' | 
| Watt-hour               | Wh            |          | Amount of energy dissipated by 1 Watt source over an hour  | 
| Horse Power Hour        | HPh           |          | Amount of energy dissipated by a 1 HP source over an hour  | 
| Foot Pound-force        | ft-lb         | ft-lbf   | Defined as 1 ft x 1 lbf, typically used to describe torques rather than energy | 
| R Value (SI)            | RSI           |          | Thermal insulation defined as 1 K m^2 / W                  | 
| R Value (Foot Pound)    | RIP           |          | Thermal insulation defined as 1 Ra ft^2 hr / BTU           | 
| Clothing                | clo           |          | Thermal insulation unit used in clothing design, defined as the amount of insulation that allows a person at rest to maintain thermal equilibrium in an 21 degC, normally ventilated room | 
| Tog                     | tog           |          | Thermal insulation unit defined as exactly 0.1 K m^2 / W   | 
| Watt                    | W             |          | SI standard unit for energy, defined as 1 J / s            | 
| Metric Horsepower       | PS            |          | Defined as the amount of power to raise a mass of 75 kg against standard gravity over a distance of 1 meter in one second | 
| Mechanical Horsepower   | HP            |          | Defined as 33 000 ft lbf / min                             | 
| Poise                   | P             |          | CGS unit for dynamic viscosity                             | 
| Rhe                     | rhe           |          | CGS unit for fluidity, equal to exactly 1 P^-1             | 
| Stokes                  | St            |          | CGS unit for kinematic viscosity                           | 
| Liter                   | L             |          | Volume defined as 1 [d]m^3 or 10^-3 m^3                    | 
| Teaspoon                | tsp           |          | US Customary volume unit that is close to 5 mL             | 
| Metric Teaspoon         | tspm          |          | Based on the US Teaspoon, but defined as exactly 5 mL      | 
| Tablespoon              | tbs           |          | US Customary volume unit that is defined as 3 tsp          | 
| Fluid Ounce             | fl_oz         |          | US Customary volume unit that is defined as 2 tbs          | 
| UK Fluid Ounce          | uk_fl_oz      |          | Imperial unit approximately equal to the volume of 1 avoirdupois ounce of water | 
| Cup                     | cup           |          | US Customary volume unit that is defined as 8 fluid ounces | 
| Pint                    | pt            |          | US Customary volume unit that is defined as 2 cups         | 
| UK Pint                 | uk_pt         |          | Imperial volume unit defined as 20 imperial ounces         | 
| Quart                   | qt            |          | US Customary volume unit that is defined as 2 pints        | 
| UK Quart                | uk_qt         |          | Imperial volume unit defined as 2 UK pints                 | 
| Gallon                  | gal           |          | US Customary volume unit that is defined as 4 quarts       | 
| UK Gallon               | uk_gal        |          | Imperial volume unit defined as 4 UK quarts                | 
| Bushel                  | bushel        |          | Very old unit of volume that is associated with agricultural production, about 2150.42 in^3 | 
| Oil Barrel              | bbl           | barrel   | Defined internationally as 42 US Gallons, typically used in the oil industry | 
| Measurement Ton         | MTON          |          | Commonly used in the freight industry, equal to 40 ft^3    | 
| Gross Register Tonnage  | GRT           |          | commonly used in the freight industry equal to 100 ft^3    | 
| Gill                    | gill          |          | US Customary unit of volume equal to 4 US fluid ounces     | 
| UK Gill                 | uk_gill       |          | Imperial unit equal to 5 Imperial (UK) fluid ounces        | 
| Peck                    | peck          |          | US Customary unit for non-fluid volume, defined as 2 dry gallons | 
| Dry Gallon              | dry_gal       |          | US Customary unit for non-fluid volume, defined as exactly 268.8025 cubic inches | 
| Dry Quart               | dry_qt        |          | US Customary unit for non-fluid volume, defined as 1/4 of a dry gallon | 
| Dry Pint                | dry_pt        |          | US Customary unit for non-fluid volume, defined as 1/8 of a dry gallon | 
| Stere                   | stere         |          | Equal to exactly 1 m^3, typically used to measure large quantities of firewood | 
| Are                     | ar            |          | Equal to 1/100 hectares or 100 m^2                         | 
| Morgen                  | morgen        |          | Traditionally the area able to be plowed in a single day by a single bladed plow and an ox or horse, it now is approximately equal to 1/4 of a hectare | 
| Acre                    | acre          | us_acre  | Traditionally defined as the amount of area that could be plowed in one day by a yoke of oxen, still in use in the US | 
| UK Acre                 | uk_acre       |          | Slightly different than the US Acre, used in the UK until 1995 | 
| Hectare                 | ha            |          | Internationally used metric unit for measurement of the area of land, equal to 1000 m^3 | 
| Barn                    | barn          |          | Equal to 10^-28 m^2, originally used in nuclear physics for expressing the cross sectional area of nuclei and nuclear reactions | 
| Bit                     | b             | bit      | Basic unit of information that can take one of 2 states (on/off, 0/1, high/low) | 
| Byte                    | B             | byte     | Equal to 8 bits of information, commonly used in modern computing architectures | 
| Word                    | word          |          | Equal to 16 bits or 2 bytes                                | 
| Double Word             | dword         |          | Equal to 32 bits, 4 bytes or 2 words                       | 
| Baud Rate               | baud          |          | Rate of data transmission equal to 1 bit / second          | 
| Ampere                  | A             |          | SI standard unit for electric current, equal to 1 C/s      | 
| Coulomb                 | C             |          | SI standard unit for electric charge defined as the amount of charge of exactly 6.2415093E+18 elementary charges | 
| Elementary Charge       | e             |          | The electric charge carried by a single proton             | 
| Volt                    | V             |          | Derived SI unit for electric potential, can be defined as J/C | 
| Ohm                     | ohm           |          | Derived SI unit for electrical resistance                  | 
| Farad                   | F             |          | Derived SI unit of electrical capacitance                  | 
| Henry                   | H             |          | Derived SI unit for inductance                             | 
| Siemens                 | S             | mho      | Derived SI unit for electrical conductance, equal to 1 / ohm | 
| Weber                   | Wb            |          | SI unit for magnetic flux defined as 1 kg m^2 / (s^2 A)    | 
| Maxwell                 | Mx            |          | CGS unit for magnetic flux defined as 1 g cm^2 / (s^2 A)   | 
| Tesla                   | T             |          | SI unit for magnetic flux density defined as 1 Wb / m^2    | 
| Gauss                   | Gs            | gs       | CGS unit for magnetic flux density defined as 1 Mx / cm^2  | 
| Franklin                | Fr            |          | Standard unit of electrical charge in the EMU-CGS units of measure | 
| Gilbert                 | Gi            |          | Obsolete unit used in EMU-CGS systems to measure magnetization, dimensionally equivalent to the Amp | 
| Oersted                 | Oe            |          | CGS unit of auxiliary magnetic field                       | 
| Mole                    | mol           |          | SI standard unit for an amount of substance, defined as exactly 6.02214076E+23 elementary entities (usually molecules) | 
| Candela                 | cd            |          | SI standard unit for luminous intensity in a given direction defined by taking the fixed numerical value of the luminous efficacy of monochromatic radiation of frequency 540E+12 Hz | 
| Lumen                   | lm            |          | SI derived unit of luminous flux, a measure of the total quantity of visible light emitted by a source. 1 lm = 1 cd sr | 
| Lux                     | lx            |          | SI derived unit of illuminance, measuring luminous flux per unit area. 1 lx = 1 lm/m^2) | 
| Footcandle              | footcandle    |          |                                                            | 
| Footlambert             | footlambert   |          | Non-SI unit of illuminance or light intensity. 1 footcandle = 1 lm / ft^2 | 
| Lambert                 | lambert       |          | Non-SI unit of luminance. 1 lambert = 1/π cd / cm^2        | 
| Phot                    | phot          |          | CGS unit of illuminance                                    | 
| Stilb                   | stilb         |          | CGS unit of luminance                                      | 
| Radian                  | rad           |          | Defined as the ratio of the radius of a circular arc to the radius of the arc, typically used to describe angles | 
| Steradians              | sr            |          | A 'square radian' is a unit of solid angle analogous to the radian, a solid angle of 1 sr projected onto a unit sphere will have unit area | 
| Revolution              | rev           |          | Angle describing one full revolution around an axis        | 
| Degree                  | deg           |          | Angle measurement equal to 1/360 of a revolution           | 
| Arc Minute              | arcmin        |          | Angle measurement defined as 1/60 of a degree              | 
| Arc Second              | arcsec        |          | Angle measurement defined as 1/60 of a arc minue           | 
| Revolutions per Minute  | rpm           |          | Rotational frequency describing the number of revolution around an axis in a minute | 
| Hertz                   | Hz            |          | Frequency defined as 1/sec                                 | 
| Becquerel               | Bq            |          | SI derived unit for radiation activity                     | 
| Gray                    | Gy            |          | SI derived unit for radiation absorbed dose                | 
| Sievert                 | Sv            |          | SI unit for radiation equivalent dose, although dimensionally equivalent to Gy, it also includes a weighting function for types of radiation effects on human cells, and is thus not exactly equal | 
| Rontgen                 | R             |          | Conventional unit for radiation exposure                   | 
| Radiation Absorbed Dose | RAD           |          | Conventional unit for radiation absorbed dose              | 
| Roentgen Equivalent Man | rem           |          | Conventional unit for radiation equivalent dose            | 
| Curie                   | Ci            |          | Conventional unit for radiation activity                   | 


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
