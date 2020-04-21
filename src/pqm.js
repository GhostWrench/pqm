/*******************************************************************************
* Library for dealing with physical quantities (numbers with units) in with 
* functions for parsing units from strings, converting, adding, subtracting, 
* multiplying and dividing by numbers with units attached.
*******************************************************************************/
const pqm = (function () {

  /**
   * Class representing a physical quantity, that can be used in various 
   * forms of arithmetic such as addition and multiplication.
   * 
   * @param {number} magnitude Relative magnitude from reference unit
   * @param {Object} dimensions Base dimensions of the unit
   * @param {number} offsets Base offsets from nominal of the unit (temperature 
   *                 scales only valid for units that do not have compound 
   *                 dimensions
   */
  function Quantity(magnitude, dimensions, offset) {

    // Allowed dimensions in the 'dimensions' input
    let allowedDimensions = [
      "mass",
      "length",
      "time",
      "temperature",
      "current",
      "substance",
      "luminosity",
      "information"
    ];

    this.magnitude = magnitude;
    // Make sure the supplied dimensions are valid
    this.numDimensions = 0;
    if (dimensions) {
      for (let dim in dimensions) {
        if (allowedDimensions.indexOf(dim) == -1) {
          throw ("Cannot create physical quantity with dimension '" + 
                 dim + "'");
        }
        this.numDimensions++;
      }
    } else {
      dimensions = {};
    }
    this.dimensions = dimensions;
    // Make sure that the supplied offsets are valid
    if (offset) {
      if (this.numDimensions != 1) {
        throw "Cannot create mixed dimensions with an offset!";
      }
    } else {
      offset = 0;
    }
    this.offset = offset;
  };

  /**
  * Getter function for the magnitude
  * 
  * @returns {number} Magnitude of the quantity
  */
  Quantity.prototype.getMagnitude = function() {
    return this.magnitude;
  };

  /**
  * Getter function for the dimensions
  * 
  * @returns {Object} Dimensions of the quantity
  */
  Quantity.prototype.getDimensions = function() {
    let copyDimensions = {};
    for (let dimension in this.dimensions) {
      copyDimensions[dimension] = this.dimensions[dimension];
    }
    return copyDimensions;
  };

  /**
  * Getter function for the offset
  * 
  * @returns {number} Zero offset of the quantity
  */
  Quantity.prototype.getOffset = function() {
    return this.offset;
  };

  /**
  * Getter function for the number of dimensions
  * 
  * @returns {number} Number of total dimensions of the quantity
  */
  Quantity.prototype.getNumDimensions = function() {
    return this.numDimensions;
  };

  /**
  * Make a copy of this physical quantity
  * 
  * @returns {Quantity} Copy of the Quantity
  */
  Quantity.prototype.copy = function() {
    let m = this.getMagnitude();
    let d = this.getDimensions();
    let o = this.getOffset();
    return new Quantity(m, d, o);
  };

  /**
  * Check to see if the units of a supplied physical quantity are the same as 
  * this one
  *
  * @param {Quantity} value Value to check for same dimensions
  * @return {boolean} True if same dimensions, false if not
  */
  Quantity.prototype.sameDimensions = function(value) {
    if (this.numDimensions != value.getNumDimensions()) {
      return false;
    }
    let valueDimensions = value.getDimensions();
    for (let dim in this.dimensions) {
      if (this.dimensions[dim] != valueDimensions[dim]) {
        return false;
      }
    }
    return true;
  };

  /**
  * Add physical quantities together, ignores the offset on the second unit
  *
  * @param {Quantity} value Value to add as a physical quantity
  * @return {Quantity} Added value
  */
  Quantity.prototype.add = function(value) {
    if (!this.sameDimensions(value)) {
      throw "Cannot add units that are not alike";
    }
    // Adding a value treats the second input value as a delta, in the case of 
    // units with offsets
    let newMagnitude = this.getMagnitude() + value.getMagnitude();
    return new Quantity(newMagnitude, this.getDimensions(), this.getOffset());
  };

  /**
  * Subtract physical quantities, ignores the offset on the second unit
  *
  * @param {Quantity} value Value to subtract
  * @return {Quantity} Result of the subtraction
  */
  Quantity.prototype.subtract = function(value) {
    if (!this.sameDimensions(value)) {
      throw "Cannot subtract units that are not alike";
    }
    // Same as addition, treat the second unit as a delta if has an offset
    let newMagnitude = this.getMagnitude() - value.getMagnitude();
    return new Quantity(newMagnitude, this.getDimensions(), this.getOffset());
  };

  /**
  * Multiply a physical quantity by a scalar or another physical quantity. 
  * When multiplying two quantities offset information will be discarded. When 
  * multiplying a quantity with a scalar offset information will be preserved 
  * (relative multiplication).
  *
  * @param {number|Quantity} value Value to multiply the physical quantity by
  * @return {Quantity} New Quantity object representing the new value
  */
  Quantity.prototype.multiply = function(value) {
    let newMagnitude = this.getMagnitude();
    let newDimensions = this.getDimensions();
    let newOffset = this.getOffset();
    if (typeof(value) == "number") {
      newMagnitude *= value;
    } else {
      newOffset = 0;
      newMagnitude *= value.getMagnitude();
      let valueDimensions = value.getDimensions();
      for (let dim in valueDimensions) {
        if (newDimensions.hasOwnProperty(dim)) {
          newDimensions[dim] += valueDimensions[dim];
          if (newDimensions[dim] == 0) {
            delete newDimensions[dim];
          }
        } else {
          newDimensions[dim] = valueDimensions[dim];
        }
      }
    }
    return new Quantity(newMagnitude, newDimensions, newOffset);
  };

  /**
  * Invert a physical quantity as 1/(old_quantity). this allows division by 
  * using the multiplication function. this operation also loses offset 
  * information.
  *
  * @return {Quantity} Inverted physical quantity
  */
  Quantity.prototype.invert = function() {
    let newMagnitude = 1.0 / this.getMagnitude();
    let newDimensions = this.getDimensions();
    for (let dim in newDimensions) {
      if (newDimensions[dim] != 0) {
        newDimensions[dim] = -newDimensions[dim];
      }
    }
    return (new Quantity(newMagnitude, newDimensions));
  };

  /**
  * Division, same as the multiplication by the inverse. this operation loses 
  * all offset information.
  *
  * @param {Quantity|number} value Value to divide by
  * @return {Quantity} New value that is the result of the division.
  */
  Quantity.prototype.divide = function(value) {
    let inverseValue;
    if (typeof(value) == "number") {
      inverseValue = 1/value;
    } else {
      inverseValue = value.invert();
    }
    return this.multiply(inverseValue);
  };

  /**
  * Raise the unit to the provided power
  * 
  * @param {number} power Integer power to raise the physical quantity to
  * @returns {Quantity} Physical quantity raised to provided power
  */
  Quantity.prototype.power = function(power) {
    if (!isInteger_(power)) {
      throw "Cannot have units with fractional powers";
    }
    if (this.getOffset() != 0 && power > 1) {
      throw "Cannot raise units with offsets to powers > 1";
    }
    if (power == 0) {
      return new Quantity(1);
    }
    let newMagnitude = Math.pow(this.getMagnitude(), power);
    let newDimensions = this.getDimensions();
    let newOffset = this.getOffset();
    for (let dim in newDimensions) {
      newDimensions[dim] *= power;
    }
    return new Quantity(newMagnitude, newDimensions, newOffset); 
  };

  /**
   * Check for equality with another quantity
   *
   * @param {Quantity} otherQuantity Other quantity to check for equality with
   * @param {number} decFrac Decimal fraction (sig figs) for equality check
   * @return {boolean} Returns true if quantities are equal, false if not
   */
  Quantity.prototype.equals = function(otherQuantity, decFrac) {
    if (!this.sameDimensions(otherQuantity)) {
      return false;
    } else if (!floatEq(this.getMagnitude(), otherQuantity.getMagnitude(), decFrac)) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Combined list of all units, conversion factors and unit descriptions
   * Each entry should have the following fields
   *
   * quant: Quantity value describing the unit
   * desc: A description of the unit
   */
  const standardUnits = {
    // Singular Unit
    "1": {
      quant: new Quantity(1),
      desc : "Unit non-dimensional quantity",
    },
    // Mass units
    kg: {
      quant: new Quantity(1, {mass: 1}),
      desc : "Kilogram, SI unit for mass, same as '[k]g'",
    },
    g: {
      quant: new Quantity(1e-3, {mass: 1}),
      desc : "Gram, unit of mass defined as 1e-3 kg",
    },
    u: {
      quant: new Quantity(1.66053878200000E-27, {mass: 1}),
      desc : ("Atomic Mass Unit, approximately the mass of one proton or " +
              "neutron"),
    },
    AMU: {
      quant: new Quantity(1.66053878200000E-27, {mass: 1}),
      desc : "Atomic Mass Unit, same as 'u'",
    },
    grain: {
      quant: new Quantity(6.47989100000000E-05, {mass: 1}),
      desc : ("Grain, mass equivalent to a single ideal seed of a cereal, " +
              "in particular wheat or barley"),
    },
    ozm: {
      quant: new Quantity(2.83495231250000E-02, {mass: 1}),
      desc : "Ounce Mass, imperial unit equal to 1/16 of a Pound Mass",
    },
    lbm: {
      quant: new Quantity(4.53592370000000E-01, {mass: 1}),
      desc : ("Pound Mass, primary unit of mass in the imperial and US " +
              "customary unit system"),
    },
    stone: {
      quant: new Quantity(6.35029318000000E+00, {mass: 1}),
      desc : "Stone, imperial unit equal to 14 Pounds Mass",
    },
    sg: {
      quant: new Quantity(1.45939029372064E+01, {mass: 1}),
      desc : "Slug, same as 'slug'",
    },
    cwt: {
      quant: new Quantity(4.53592370000000E+01, {mass: 1}),
      desc : ("Short Hundredweight, mass unit typically used in the US that " + 
              "is equal to 100 lbm"),
    },
    uk_cwt: {
      quant: new Quantity(5.08023454400000E+01, {mass: 1}),
      desc : ("Long Hundredweight, mass unit typically used in the UK that " +
              "is equal to 8 stone"),
    },
    ton: {
      quant: new Quantity(9.07184740000000E+02, {mass: 1}),
      desc : "Ton, US customary mass unit that is equal to 2000 lbm",
    },
    uk_ton: {
      quant: new Quantity(1.01604690880000E+03, {mass: 1}),
      desc : ("UK Ton, English customary mass unit that is equal to 20 Long " +
              "Hundredweight or 160 Stone"),
    },
    slug: {
      quant: new Quantity(1.45939029372064E+01, {mass: 1}),
      desc: "Slug, Imperial unit defined as 1 lbf / Standard Gravity",
    },
    // Length Units
    m: {
      quant: new Quantity(1, {length: 1}),
      desc : "Meter, SI Unit for length",
    },
    ang: {
      quant: new Quantity(1.00000000000000E-10, {length: 1}),
      desc : "Angstrom, Unit of measure equal to 10^-10 meters",
    },
    picapt: {
      quant: new Quantity(3.52777777777778E-04, {length: 1}),
      desc : "Pica Point, length used in typography equal to 1/12 of a pica",
    },
    pica: {
      quant: new Quantity(4.23333333333333E-03, {length: 1}),
      desc : "Pica, length used in typography equal to 1/6 of an inch",
    },
    "in": {
      quant: new Quantity(2.54000000000000E-02, {length: 1}),
      desc : "Inch, Imperial unit of length equal to 1/12 of a foot",
    },
    ft: {
      quant: new Quantity(3.04800000000000E-01, {length: 1}),
      desc : "Foot, Standard Imperial unit of length",
    },
    yd: {
      quant: new Quantity(9.14400000000000E-01, {length: 1}),
      desc : "Yard, Imperial unit of length equal to 3 foot",
    },
    ell: {
      quant: new Quantity(1.14300000000000E+00, {length: 1}),
      desc : ("Ell / Cubit, Approximate length of a man's arm from elbow " + 
              "to the tip of the fingers"),
    },
    mi: {
      quant: new Quantity(1.60934400000000E+03, {length: 1}),
      desc : "Mile, Imperial unit of length equal to 5280 ft",
    },
    survey_mi: {
      quant: new Quantity((1200/3937)*5280, {length: 1}),
      desc: "Survey Mile, Imperial unit of length equal to 5280 Survey Feet",
    },
    Nmi: {
      quant: new Quantity(1.85200000000000E+03, {length: 1}),
      desc : ("Nautical Mile, Length approximately 1/60 of a degree of " +
              "latitude, formally defined as 1852 meters"),
    },
    league: {
      quant: new Quantity(5.55600000000000E+03, {length: 1}),
      desc: ("League, originally represented the distance a person could " +
             "walk in one day. The most recent common usage was in maritime " +
             "where it is equal to 3 nautical miles"),
    },
    ly: {
      quant: new Quantity(9.46073047258080E+15, {length: 1}),
      desc : ("Light Year, the length of travel of light in one year, used " +
              "in astronomical scales"),
    },
    parsec: {
      quant: new Quantity(3.08567758128155E+16, {length: 1}),
      desc : "Parsec, defined as 648 000 / pi Astronomical units",
    },
    survey_ft: {
      quant: new Quantity(1200/3937, {length: 1}),
      desc : ("Survey Foot, Very close to a foot of length but defined as " +
              "1200/3937 meters instead of 0.3048 meters"),
    },
    au: {
      quant: new Quantity(1.49597870700000E+11, {length: 1}),
      desc: "Astronomical Unit, approximate distance from the Earth to the Sun",
    },
    // Time units
    sec: {
      quant: new Quantity(1, {time: 1}),
      desc : ("Second, time that is Approximately 1/86400 of a stellar day, " +
              "formally defined based on the duration of 9 192 631 770 state " +
              "transitions of the caesium-133 atom at 0 K"),
    },
    s: {
      quant: new Quantity(1, {time: 1}),
      desc : "Second, same as 'sec'",
    },
    min: {
      quant: new Quantity(6.00000000000000E+01, {time: 1}),
      desc : "Minute, defined as 60 seconds",
    },
    hr: {
      quant: new Quantity(3.60000000000000E+03, {time: 1}),
      desc : "Hour, defined as 60 minutes",
    },
    day: {
      quant: new Quantity(8.64000000000000E+04, {time: 1}),
      desc : "Day, defined as 24 hours",
    },
    yr: {
      quant: new Quantity(3.15576000000000E+07, {time: 1}),
      desc : "Year, defined as 365 days",
    },
    stellar_day: {
      quant: new Quantity(8.637641003520000E+04, {time: 1}),
      desc: "Stellar Day, approximate time for the earth to make one rotation",
    },
    K: {
      quant: new Quantity(1, {temperature: 1}),
      desc : "Kelvin, SI unit of temperature with 0 defined as absolute zero",
    },
    degF: {
      quant: new Quantity(5.55555555555543E-01, {temperature: 1}, 2.55372222222222E+02),
      desc: ("Fahrenheit, Temperature scale that is approximately 32 at the " +
             "melting point of ice and 212 at the boiling point of water"),
    },
    degC: {
      quant: new Quantity(1, {temperature: 1}, 2.73150000000000E+02),
      desc: ("Celsius, temperature unit with a similar scale to Kelvin, but " +
             "with the 0 approximately defined as the melting point of ice"),
    },
    Rank: {
      quant: new Quantity(5.55555555555543E-01, {temperature: 1}),
      desc: ("Rankine, temperature units with the same scale as Fahrenheit " +
             "but with 0 at absolute 0"),
    },
    Reau: {
      quant: new Quantity(1.25000000000000E+00, {temperature: 1}, 2.73150000000000E+02),
      desc: ("Reaumur, temperature scale that is approximately 0 at the " +
             "melting point of ice and 80 at the boiling point of water"),
    },
    // Velocity Units
    mph: {
      quant: new Quantity(4.47040000000000E-01, {length: 1, time: -1}),
      desc: "Miles per Hour, velocity at which a mile is traveled every hour",
    },
    kn: {
      quant: new Quantity(5.14444444444444E-01, {length: 1, time: -1}),
      desc: "Knot, velocity at which a Nautical mile is traveled every hour",
    },
    admkn: {
      quant: new Quantity(5.14773333333333E-01, {length: 1, time: -1}),
      desc: ("Admiralty Knot, knot based on the old UK definition of a " +
             "Nautical mile (1853.184 m)"),
    },
    c: {
      quant: new Quantity(2.99792458000000E+8, {length: 1, time: -1}),
      desc: ("Speed of Light, unit of velocity defined by how fast light " +
             "travels"),
    },
    // Acceleration Units
    grav: {
      quant: new Quantity(9.80665000000000E+00, {length: 1, time: -2}),
      desc: ("Standard Gravity, approximate acceleration of gravity at the " +
             "surface of the earth"),
    },
    // Pressure Units
    Pa: {
      quant: new Quantity(1, {mass: 1, length: -1, time: -2}),
      desc: "Pascal, SI unit for pressure defined as 1 N/m^2",
    },
    mmHg: {
      quant: new Quantity(1.33322000000000E+02, {mass: 1, length: -1, time: -2}),
      desc: ("Millimeter of mercury, pressure defined as the pressure " +
             "applied by 1 mm of Hg at 1 standard gravity"),
    },
    Torr: {
      quant: new Quantity(1.33322368421053E+02, {mass: 1, length: -1, time: -2}),
      desc: ("Torr, Slightly different definition of Millimeter of mercury, " +
             "very close to the same scale"),
    },
    psi: {
      quant: new Quantity(6.89475729316836E+03, {mass: 1, length: -1, time: -2}),
      desc: "Pounds per square inch, unit for pressure defined as lbf / in^2",
    },
    atm: {
      quant: new Quantity(1.01325000000000E+05, {mass: 1, length: -1, time: -2}),
      desc: ("Atmosphere, pressure that is approximately the mean air " +
             "pressure at sea level"),
    },
    bar: {
      quant: new Quantity(1.00000e5, {mass: 1, length: -1, time: -2}),
      desc: ("Bar, unit of pressure defined as 100 000 Pa. This makes it " +
             "very close to 1 Atmosphere"),
    },
    inHg: {
      quant: new Quantity(3.38638866666670E+03, {mass: 1, length: -1, time: -2}),
      desc: ("Inches of Mercury, pressure defined as the pressure applied " +
             "by 1 inch of Hg at 1 standard gravity"),
    },
    // Force Units
    N: {
      quant: new Quantity(1, {mass: 1, length: 1, time: -2}),
      desc: "Newton, SI unit for force defined as 1 [k]g m / s^2",
    },
    dyn: {
      quant: new Quantity(1.00000000000000E-05, {mass: 1, length: 1, time: -2}),
      desc: "Dyne, CGS unit for force defined as 1 g [c]m / s^2",
    },
    pond: {
      quant: new Quantity(9.80665000000000E-03, {mass: 1, length: 1, time: -2}),
      desc: ("Pond, force defined as the amount of force exerted by standard " +
             "gravity on a 1 [k]g mass"),
    },
    lbf: {
      quant: new Quantity(4.44822161526050E+00, {mass: 1, length: 1, time: -2}),
      desc: ("Pounds force, defined as the amount of force exerted by " +
             "standard gravity on a 1 lbm mass"),
    },
    ozf: {
      quant: new Quantity(2.78013850953781E-01, {mass: 1, length: 1, time: -2}),
      desc: "Ounce Force, equal to 1/16 lbf",
    },
    // Energy Units
    J: {
      quant: new Quantity(1, {mass: 1, length: 2, time: -2}),
      desc: "Joule, SI unit for energy defined as 1 N m",
    },
    eV: {
      quant: new Quantity(1.60217648700000E-19, {mass: 1, length: 2, time: -2}),
      desc: ("Electron Volt, Energy gain of an electron after passing " +
             "through a 1 Volt potential"),
    },
    erg: {
      quant: new Quantity(1.00000000000000E-07, {mass: 1, length: 2, time: -2}),
      desc: "Erg, CGS unit for energy defined as 1 dyn cm",
    },
    Cal: {
      quant: new Quantity(4.18680000000000E+00, {mass: 1, length: 2, time: -2}),
      desc: ("Calorie / Kilocalorie, defined as the amount of energy to " +
             "raise the temperature of 1 kg of water 1 degree Celsius"),
    },
    BTU: {
      quant: new Quantity(1.05505585262000E+03, {mass: 1, length: 2, time: -2}),
      desc: ("British Thermal Unit, defined as the amount of energy to " +
             "raise the temperature of 1 lbm of water 1 degree Fahrenheit"),
    },
    Wh: {
      quant: new Quantity(3.60000000000000E+03, {mass: 1, length: 2, time: -2}),
      desc: "Watt-hour, amount of energy accumulated by 1 Watt over an hour",
    },
    HPh: {
      quant: new Quantity(2.68451953769617E+06, {mass: 1, length: 2, time: -2}),
      desc: ("Horsepower-hour, amount of energy accumulated by 1 HP over " +
             "an hour"),
    },
    // Torque Units (same dimensions as energy)
    "ft-lb": {
      quant: new Quantity(1.35581794833140E+00, {mass: 1, length: 2, time: -2}),
      desc: "Foot-pound, Torque unit defined as 1 ft lbf",
    },
    // Power Units
    W: {
      quant: new Quantity(1, {mass: 1, length: 2, time: -3}),
      desc: "Watt, SI unit for energy, defined as 1 J / s",
    },
    PS: {
      quant: new Quantity(7.35498750000000E+02, {mass: 1, length: 2, time: -3}),
      desc: ("Metric Horsepower, defined as the amount of pwer to raise a " +
             "mass of 75 [k]g against standard gravity over a distance of 1 " +
             "meter in one second"),
    },
    HP: {
      quant: new Quantity(7.45699871582270E+02, {mass: 1, length: 2, time: -3}),
      desc: "Mechanical Horsepower, defined as 33 000 ft lbf / min",
    },
    // Volume units
    L: {
      quant: new Quantity(1.00000000000000E-03, {length: 3}),
      desc: "Liter, Unit of volume that is defined as 1 [d]m^2 or 1e-3 m^3",
    },
    tsp: {
      quant: new Quantity(4.92892159375000E-06, {length: 3}),
      desc: "Teaspoon, US Customary volume unit that is close to 5 mL",
    },
    tspm: {
      quant: new Quantity(5.00000000000000E-06, {length: 3}),
      desc: "Metric teaspoon, volume measurement that is exactly 5 mL",
    },
    tbs: {
      quant: new Quantity(1.47867647812500E-05, {length: 3}),
      desc: "Tablespoon, US Customary volume unit that is defined as 3 tsp",
    },
    fl_oz: {
      quant: new Quantity(2.95735295625000E-05, {length: 3}),
      desc: "Fluid Ounce, US Customary volume unit that is defined as 2 tbs",
    },
    cup: {
      quant: new Quantity(2.36588236500000E-04, {length: 3}),
      desc: "Cup, US Customary volume unit that is defined as 8 fluid ounces",
    },
    pt: {
      quant: new Quantity(4.73176473000000E-04, {length: 3}),
      desc: "Pint, US Customary volume unit that is defined as 2 cups",
    },
    uk_pt: {
      quant: new Quantity(5.68261250000000E-04, {length: 3}),
      desc: "UK Pint, Imperial volume unit defined as 20 imperial ounces",
    },
    qt: {
      quant: new Quantity(9.46352946000000E-04, {length: 3}),
      desc: "Quart, US Customary volume unit that is defined as 2 pints",
    },
    uk_qt: {
      quant: new Quantity(1.13652250000000E-03, {length: 3}),
      desc: "UK Quart, Imperial volume unit defined as 2 UK pints",
    },
    gal: {
      quant: new Quantity(3.78541178400000E-03, {length: 3}),
      desc: "Gallon, US Customary volume unit that is defined as 4 quarts",
    },
    uk_gal: {
      quant: new Quantity(4.54609000000000E-03, {length: 3}),
      desc: "UK Gallon, Imperial volume unit defined as 4 UK quarts",
    },
    bushel: {
      quant: new Quantity(3.52390701668800E-02, {length: 3}),
      desc: ("US Bushel, very old unit of volume that is associated with " +
             "agricultural production, about 2150.42 in^3"),
    },
    barrel: {
      quant: new Quantity(1.58987294928000E-01, {length: 3}),
      desc: "Oil Barrel, volume unit used in the us oil industry",
    },
    MTON: {
      quant: new Quantity(1.13267386368000E+00, {length: 3}),
      desc: ("Measurement Ton, volume unit commonly used in the freight " +
             "industry equal to 40 f^3"),
    },
    GRT: {
      quant: new Quantity(2.83168465920000E+00, {length: 3}),
      desc: ("Gross Register Tonnage, volume unit commonly used in the " +
             "freight industry equal to 100 f^3"),
    },
    // Area units
    ar: {
      quant: new Quantity(1.00000000000000E+02, {length: 2}),
      desc: "Are, area unit that is equal to 1/100 hectares or 100 m^2",
    },
    Morgen: {
      quant: new Quantity(2.50000000000000E+03, {length: 2}),
      desc: ("Morgen, traditionally the area able to be plowed in a single " +
             "day by a single bladed plow and a Ox or horse, it now is " +
             "approximately equal to 1/4 of a hectare"),
    },
    acre: {
      quant: new Quantity(4.04687260987425E+03, {length: 2}),
      desc: ("US Acre, unit of area traditionally defined as the amount of " +
             "area that could be plowed in one day by a yoke of oxen. Still " +
             "in use in the US"),
    },
    us_acre: {
      quant: new Quantity(4.04687260987425E+03, {length: 2}),
      desc: "US Acre, same as 'acre' (common alternative)",
    },
    uk_acre: {
      quant: new Quantity(4.04685642240000E+03, {length: 2}),
      desc: ("UK Acre, unit of area traditionally defined as the amount of " +
             "area that could be plowed in one day by a yoke of oxen, " +
             "slightly different than the US Acre. Used in the UK until 1995"),
    },
    ha: {
      quant: new Quantity(1.00000000000000E+04, {length: 2}),
      desc: ("Hectare, standard international unit for measurement of the " +
             "area of land, equal to 1000 m^3"),
    },
    // Information units
    bit: {
      quant: new Quantity(1, {information: 1}),
      desc: ("Bit, one bit of information that can take one of 2 states " +
             "(on/off, 0/1, high/low)"),
    },
    b: {
      quant: new Quantity(1, {information: 1}),
      desc: "Bit, common abbreviation for 'bit'",
    },
    byte: {
      quant: new Quantity(8, {information: 1}),
      desc: ("Byte, equal to 8 bits of information, commonly used in modern " +
             "computing architectures"),
    },
    B: {
      quant: new Quantity(8, {information: 1}),
      desc: "Byte (common abbreviation)",
    },
    word: {
      quant: new Quantity(16, {information: 1}),
      desc: "Word, equal to 16 bits or 2 bytes",
    },
    baud: {
      quant: new Quantity(1, {information:  1, time: -1}),
      desc: "Baud, rate of data transmission",
    },
    // Electro-magnetism units
    A: {
      quant: new Quantity(1, {current: 1}),
      desc: "Ampere, SI unit for electric current defined as exactly 1 C/s",
    },
    C: {
      quant: new Quantity(1, {current: 1, time: 1}),
      desc: ("Coulomb, SI Unit for electric charge defined as the amount of " +
             "charge of equal to exactly 6.2415093E+18 elementary charges"),
    },
    e: {
      quant: new Quantity(1.60217663400000E-19, {current: 1, time: 1}),
      desc: "Elementary Charge, The electric charge carried by a single proton",
    },
    V: {
      quant: new Quantity(1, {mass: 1, length: 2, current: -1, time: -3}),
      desc: ("Volt, derived SI unit for electric potential, can be defined " +
             "as J/C"),
    },
    ohm: {
      quant: new Quantity(1, {mass: 1, length: 2, time: -3, current: -2}),
      desc: "Ohm, derived SI unit for electrical resistance",
    },
    F: {
      quant: new Quantity(1, {time: 4, current: 2, length: -2, mass: -1}),
      desc: "Farad, derived SI Unit of electrical capacitance",
    },
    H: {
      quant: new Quantity(1, {length: 2, mass: 1, time: -2, current: -2}),
      desc: "Henry, derived SI unit for inductance",
    },
    S: {
      quant: new Quantity(1, {time: 3, current: 2, length: -2, mass: -1}),
      desc: ("Siemens, derived SI unit for electrical conductance, equal " +
             "to 1 / ohm"),
    },
    Wb: {
      quant: new Quantity(1, {mass: 1, length:2, time: -2, current: -1}),
      desc: "Weber, SI unit for magnetic flux defined as 1 [k]g m^2 / (s^2 A)",
    },
    Mx: {
      quant: new Quantity(1.0E-8, {mass: 1, length: 2, time: -2, current: -1}),
      desc: ("Maxwell, CGS unit for magnetic flux defined as 1 g [c]m^2 / " +
             "(s^2 A)"),
    },
    T: {
      quant: new Quantity(1, {mass: 1, current: -1, time: -2}),
      desc: "Tesla, SI unit for magnetic flux density defined as 1 Wb / m^2",
    },
    Gs: {
      quant: new Quantity(1.00000000000000E-04, {mass: 1, current: -1, time: -2}),
      desc: ("Gauss, CGS unit for magnetic flux density defined as 1 Mx / " +
             "[c]m^2"),
    },
    ga: {
      quant: new Quantity(1.00000000000000E-04, {mass: 1, current: -1, time: -2}),
      desc: "Gauss, same as 'Gs' (common alternative)",
    },
    // Substance Units
    mol: {
      quant: new Quantity(1, {substance: 1}),
      desc: ("Mole, SI unit for amount of substance defined by exactly " +
            "6.02214076E+23 elementary entities of said substance"),
    },
    // Luminosity Units
    cd: {
      quant: new Quantity(1, {luminosity: 1}),
      desc: ("Candela, SI unit for luminous intensity in a given direction " +
             "defined by taking the fixed numerical value of the luminous " +
             "efficacy of monochromatic radiation of frequency 540E+12 Hz"),
    },
    // Rotational units
    rad: {
      quant: new Quantity(1),
      desc: ("Radian, Dimensionless SI unit defined as the ratio of the " +
             "radius of a circular arc to the radius of the arc. Typically " +
             "used to describe angles"),
    },
    rev: {
      quant: new Quantity(2*Math.PI),
      desc: ("Revolutions, dimensionless quantity describing one revolution " +
             "of periodic motion"),
    },
    deg: {
      quant: new Quantity(Math.PI/180),
      desc: "Degree, dimensionless quantity equal to 1/360 of a revolution",
    },
    Hz: {
      quant: new Quantity(2*Math.PI, {time: -1}),
      desc: "Hertz, unit of frequency defined as 1 rev/sec",
    },
    rpm: {
      quant: new Quantity(2*Math.PI/60, {time: -1}),
      desc: "Revolutions per Minute, unit of frequency defined as 1 rev/min",
    },
  };

  return {
    Quantity: Quantity,
    units: standardUnits,
  };
})();
