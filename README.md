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

Installing and importing PQM
--------------------------------------------------------------------------------

### Importing the module

PQM uses the ES6 module scheme by default, to import use the following line:

```javascript
import pqm from "pqm";
```

If adding it to an html file ensure that you use the following syntax:

```html
<script src="path/to/pqm.js" type="module"></script>
```

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
unit "collisions" where the wrong unit might accidentally be used. Note that
quantities with a zero offset such as `degC`, `degF` and gauge pressures cannot
have a prefix added to them when you create a quantity.

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

| Unit Symbol | Description                                                    |
| ----------- |:-------------------------------------------------------------- |
| 1           | Unit non-dimensional quantity                                  |
| %           | Non dimensional percent (100 % == 1)                           |
| kg          | Kilogram, SI unit for mass, same as `[k]g`                     |
| g           | Gram, unit of mass defined as 1e-3 kg                          |
| u           | Atomic Mass Unit, approximately the mass of one proton or neutron |
| AMU         | Atomic Mass Unit, same as 'u'                                  |
| grain       | Grain, mass equivalent to a single ideal seed of a cereal, in particular wheat or barley |
| ozm         | Ounce Mass, imperial unit equal to 1/16 of a Pound Mass        |
| lbm         | Pound Mass, primary unit of mass in the imperial and US customary unit system |
| stone       | Stone, imperial unit equal to 14 Pounds Mass                   |
| sg          | Slug, same as 'slug'                                           |
| cwt         | Short Hundredweight, mass unit typically used in the US that is equal to 100 lbm |
| uk_cwt      | Long Hundredweight, mass unit typically used in the UK that is equal to 8 stone |
| ton         | Ton, US customary mass unit that is equal to 2000 lbm          |
| uk_ton      | UK Ton, English customary mass unit that is equal to 20 Long Hundredweight or 160 Stone |
| slug        | Slug, Imperial unit defined as 1 lbf / Standard Gravity        |
| m           | Meter, SI Unit for length                                      |
| ang         | Angstrom, Unit of measure equal to 10^-10 meters               |
| picapt      | Pica Point, length used in typography equal to 1/12 of a pica  |
| pica        | Pica, length used in typography equal to 1/6 of an inch        |
| in          | Inch, Imperial unit of length equal to 1/12 of a foot          |
| ft          | Foot, Standard Imperial unit of length                         |
| yd          | Yard, Imperial unit of length equal to 3 foot                  |
| ell         | Ell / Cubit, Approximate length of a man's arm from elbow to the tip of the fingers |
| mi          | Mile, Imperial unit of length equal to 5280 ft                 |
| survey_mi   | Survey Mile, Imperial unit of length equal to 5280 Survey Feet |
| Nmi         | Nautical Mile, Length approximately 1/60 of a degree of latitude, formally defined as 1852 meters |
| league      | League, originally represented the distance a person could walk in one day. The most recent common usage was in maritime where it is equal to 3 nautical miles |
| ly          | Light Year, the length of travel of light in one year, used in astronomical scales |
| parsec      | Parsec, defined as 648 000 / pi Astronomical units             |
| survey_ft   | Survey Foot, Very close to a foot of length but defined as 1200/3937 meters instead of 0.3048 meters |
| au          | Astronomical Unit, approximate distance from the Earth to the Sun |
| sec         | Second, time that is Approximately 1/86400 of a stellar day, formally defined based on the duration of 9 192 631 770 state transitions of the caesium-133 atom at 0 K |
| s           | Second, same as 'sec'                                          |
| min         | Minute, defined as 60 seconds                                  |
| hr          | Hour, defined as 60 minutes                                    |
| day         | Day, defined as 24 hours                                       |
| yr          | Year, defined as 365 days                                      |
| stellar_day | Stellar Day, approximate time for the earth to make one rotation |
| K           | Kelvin, SI unit of temperature with 0 defined as absolute zero |
| degF        | Degrees Fahrenheit, Temperature scale that is approximately 32 at the melting point of ice and 212 at the boiling point of water |
| deltaF      | Change in temperature as measured in Degrees Fahrenheit, this unit does not have a 0 offset similar to 'degF' and thus is sometimes more useful in computations |
| degC        | Degrees Celsius, temperature unit with a similar scale to Kelvin, but with the 0 approximately defined as the melting point of ice |
| deltaC      | Change in temperature measured in Celsius, this unit does not have a 0 offset similar to 'degC' and thus is sometimes more useful in computations |
| Rank        | Rankine, temperature units with the same scale as Fahrenheit but with 0 at absolute 0 |
| Reau        | Reaumur, temperature scale that is approximately 0 at the melting point of ice and 80 at the boiling point of water |
| deltaReau   | Change in temperature as measured in Reaumurs                  |
| mph         | Miles per Hour, velocity at which a mile is traveled every hour |
| knot        | Knot, velocity at which a Nautical mile is traveled every hour |
| admkn       | Admiralty Knot, knot based on the old UK definition of a Nautical mile (1853.184 m) |
| c           | Speed of Light, unit of velocity defined by how fast light travels |
| grav        | Standard Gravity, approximate acceleration of gravity at the surface of the earth |
| galileo     | Galileo, CGS Unit for acceleration                             |
| Pa          | Pascal, SI unit for pressure defined as 1 N/m^2                |
| mmHg        | Millimeter of mercury, pressure defined as the pressure applied by 1 mm of Hg at 1 standard gravity |
| Torr        | Torr, Slightly different definition of Millimeter of mercury, very close to the same scale |
| psi         | Pounds per square inch, unit for pressure defined as lbf / in^2 |
| atm         | Atmosphere, pressure that is approximately the mean air pressure at sea level |
| bar         | Bar, unit of pressure defined as 100 000 Pa. This makes it very close to 1 Atmosphere |
| inHg        | Inches of Mercury, pressure defined as the pressure applied by 1 inch of Hg at 1 standard gravity |
| Ba          | Barye, CGS unit for pressure                                   |
| Pa-g        | Gauge version of the Pascal, with a zero offset at atmospheric pressure |
| kPa-g       | Gauge version of the [k]Pa, with a zero offset at atmospheric pressure |
| bar-g       | Gauge version of bar, with a zero offset at atmospheric pressure |
| psi-g       | Gauge version of psi, with a zero offset at atmospheric pressure |
| N           | Newton, SI unit for force defined as 1 [k]g m / s^2            |
| dyn         | Dyne, CGS unit for force defined as 1 g [c]m / s^2             |
| gf          | Gram force, defined as the amount of force exerted by standard gravity on a 1 gram mass |
| pond        | Pond, same as Gram Force (gf)                                  |
| lbf         | Pounds force, defined as the amount of force exerted by standard gravity on a 1 lbm mass |
| ozf         | Ounce Force, equal to 1/16 lbf                                 |
| J           | Joule, SI unit for energy defined as 1 N m                     |
| eV          | Electron Volt, Energy gain of an electron after passing through a 1 Volt potential |
| erg         | Erg, CGS unit for energy defined as 1 dyn cm                   |
| cal         | Calorie / Kilocalorie, based on the amount of energy to raise the temperature of 1 kg of water 1 degree Celsius. Defined in The Fifth International Conference on the Properties of Steam (London, July 1956) "International Table". Note that there is also a "thermochemical" definition which differs slightly. |
| BTU         | British Thermal Unit, defined as the amount of energy to raise the temperature of 1 lbm of water 1 degree Fahrenheit. Based on the "International Table" (see definition of "cal") |
| Wh          | Watt-hour, amount of energy accumulated by 1 Watt over an hour |
| HPh         | Horsepower-hour, amount of energy accumulated by 1 HP over an hour |
| ft-lb       | Foot-pound, Torque unit defined as 1 ft lbf                    |
| W           | Watt, SI unit for energy, defined as 1 J / s                   |
| PS          | Metric Horsepower, defined as the amount of power to raise a mass of 75 [k]g against standard gravity over a distance of 1 meter in one second              |
| HP          | Mechanical Horsepower, defined as 33 000 ft lbf / min          |
| P           | Poise, CGS unit for dynamic viscosity                          |
| St          | Stokes, GGS unit for kinematic viscosity                       |
| L           | Liter, Unit of volume that is defined as 1 [d]m^2 or 1e-3 m^3  |
| tsp         | Teaspoon, US Customary volume unit that is close to 5 mL       |
| tspm        | Metric teaspoon, volume measurement that is exactly 5 mL       |
| tbs         | Tablespoon, US Customary volume unit that is defined as 3 tsp  |
| fl_oz       | Fluid Ounce, US Customary volume unit that is defined as 2 tbs |
| cup         | Cup, US Customary volume unit that is defined as 8 fluid ounces |
| pt          | Pint, US Customary volume unit that is defined as 2 cups       |
| uk_pt       | UK Pint, Imperial volume unit defined as 20 imperial ounces    |
| qt          | Quart, US Customary volume unit that is defined as 2 pints     |
| uk_qt       | UK Quart, Imperial volume unit defined as 2 UK pints           |
| gal         | Gallon, US Customary volume unit that is defined as 4 quarts   |
| uk_gal      | UK Gallon, Imperial volume unit defined as 4 UK quarts         |
| bushel      | US Bushel, very old unit of volume that is associated with agricultural production, about 2150.42 in^3 |
| barrel      | Oil Barrel, volume unit used in the us oil industry            |
| MTON        | Measurement Ton, volume unit commonly used in the freight industry equal to 40 f^3 |
| GRT         | Gross Register Tonnage, volume unit commonly used in the freight industry equal to 100 f^3 |
| ar          | Are, area unit that is equal to 1/100 hectares or 100 m^2      |
| Morgen      | Morgen, traditionally the area able to be plowed in a single day by a single bladed plow and a Ox or horse, it now is approximately equal to 1/4 of a hectare |
| acre        | US Acre, unit of area traditionally defined as the amount of area that could be plowed in one day by a yoke of oxen. Still in use in the US                    |
| us_acre     | US Acre, same as 'acre' (common alternative)                   |
| uk_acre     | UK Acre, unit of area traditionally defined as the amount of area that could be plowed in one day by a yoke of oxen, slightly different than the US Acre. Used in the UK until 1995 |
| ha          | Hectare, standard international unit for measurement of the area of land, equal to 1000 m^3 |
| bit         | Bit, one bit of information that can take one of 2 states (on/off, 0/1, high/low) |
| b           | Bit, common abbreviation for 'bit'                             |
| byte        | Byte, equal to 8 bits of information, commonly used in modern computing architectures |
| B           | Byte (common abbreviation)                                     |
| word        | Word, equal to 16 bits or 2 bytes                              |
| baud        | Baud, rate of data transmission                                |
| A           | Ampere, SI unit for electric current defined as exactly 1 C/s  |
| C           | Coulomb, SI Unit for electric charge defined as the amount of charge of equal to exactly 6.2415093E+18 elementary charges |
| e           | Elementary Charge, The electric charge carried by a single proton |
| V           | Volt, derived SI unit for electric potential, can be defined as J/C |
| ohm         | Ohm, derived SI unit for electrical resistance                 |
| F           | Farad, derived SI Unit of electrical capacitance               |
| H           | Henry, derived SI unit for inductance                          |
| S           | Siemens, derived SI unit for electrical conductance, equal to 1 / ohm |
| Wb          | Weber, SI unit for magnetic flux defined as 1 [k]g m^2 / (s^2 A) |
| Mx          | Maxwell, CGS unit for magnetic flux defined as 1 g [c]m^2 / (s^2 A) |
| T           | Tesla, SI unit for magnetic flux density defined as 1 Wb / m^2 |
| Gs          | Gauss, CGS unit for magnetic flux density defined as 1 Mx / [c]m^2 |
| ga          | Gauss, same as 'Gs' (common alternative)                       |
| mol         | Mole, SI unit for amount of substance defined by exactly 6.02214076E+23 elementary entities of said substance |
| cd          | Candela, SI unit for luminous intensity in a given direction defined by taking the fixed numerical value of the luminous efficacy of monochromatic radiation of frequency 540E+12 Hz |
| lm          | Lumen, SI derived unit of luminous flux, a measure of the total quantity of visible light emitted by a source. 1 lm = 1 cd sr |
| lx          | Lux, the SI derived unit of illuminance, measuring luminous flux per unit area. 1 lx = 1 lm/m^2) |
| footcandle  | Footcandle, common symbols: lc and ft-c . Non-SI unit of illuminance or light intensity. 1 footcandle = 1 lm / ft^2 |
| footlambert | Footlambert, common symbols: fL, fl, ft-L. 1 footlambert = 1/π cd / ft^2 |
| lambert     | Lambert, common symbols: L, la, Lb. Non-SI unit of luminance. 1 lambert = 1/π cd / \[c\]m^2 |
| phot        | Phot, common symbol: ph. CGS unit of illuminance               |
| stilb       | Stilb, common symbol: sb. CGS unit of luminance                |
| rad         | Radian, Dimensionless SI unit defined as the ratio of the radius of a circular arc to the radius of the arc. Typically used to describe angles |
| sr          | Steradian, "square radian" is the SI unit of solid angle. Analogous to the radian, a solid angle of 1 sr, projected onto a unit sphere will have unit area |
| rev         | Revolutions, dimensionless quantity describing one revolution of periodic motion |
| deg         | Degree, dimensionless quantity equal to 1/360 of a revolution  |
| arcmin      | Arc Minute, rotational quantity defined as 1/60 of a degree    |
| arcsec      | Arc Second, rotational quantity defined as 1/60 of an Arc Minute or 1/3600 of a degree |
| Hz          | Hertz, unit of frequency defined as 1/sec                      |
| rpm         | Revolutions per Minute, unit of frequency defined as 1 rev/min |
| Bq          | Becquerel, SI unit for radiation activity                      |
| Gy          | Gray, SI unit for radiation absorbed dose                      |
| Sv          | Sievert, SI unit for radiation equivalent dose                 |
| R           | Rontgen, conventional unit for radiation exposure              |
| RAD         | Radiation Absorbed Dose, conventional unit for radiation absorbed dose |
| rem         | Rem, conventional unit for radiation equivalent dose           |
| Ci          | Curie, conventional unit for radiation activity                |

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
