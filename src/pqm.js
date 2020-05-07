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
        throw "Cannot create compound dimensions with an offset!";
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
  * @param {Quantity|number} other Other quantity to check for same dimensions
  * @return {boolean} True if same dimensions, false if not
  */
  Quantity.prototype.sameDimensions = function(other) {
    // Convert to a quantity if a number is supplied as input
    if (typeof(other) === "number") {
      other = new Quantity(other);
    }
    if (this.numDimensions != other.getNumDimensions()) {
      return false;
    }
    let otherDimensions = other.getDimensions();
    for (let dim in this.dimensions) {
      if (this.dimensions[dim] != otherDimensions[dim]) {
        return false;
      }
    }
    return true;
  };

  /**
  * Add physical quantities together
  *
  * @param {Quantity|number} other Value to add as a physical quantity, must
  *                                not have an offset.
  * 
  * @return {Quantity} Added value
  */
  Quantity.prototype.add = function(other) {
    // Convert to a quantity if a number is supplied as input
    if (typeof(other) === "number") {
      other = new Quantity(other);
    }
    if (!this.sameDimensions(other)) {
      throw "Cannot add units that are not alike";
    }
    if (this.offset != 0 && other.offset != 0) {
      throw ("Can only add quantities without an offsets to a quantity with " +
             "an offset. Example: 1 degC + 10 deltaC");
    }
    // Adding a value treats the second input value as a delta, in the case of 
    // units with offsets
    let newMagnitude = this.getMagnitude() + other.getMagnitude();
    return new Quantity(newMagnitude, this.getDimensions(), this.getOffset());
  };

  /**
  * Subtract physical quantities, ignores the offset on the second unit
  *
  * @param {Quantity} other Value to subtract
  * @return {Quantity} Result of the subtraction
  */
  Quantity.prototype.subtract = function(other) {
    // Convert to a quantity if a number is supplied as input
    if (typeof(other) === "number") {
      other = new Quantity(other);
    }
    if (!this.sameDimensions(other)) {
      throw "Cannot subtract units that are not alike";
    }
    if (this.offset != 0 && other.offset != 0) {
      throw ("Can only subtract quantities without an offsets to a quantity " +
             "with an offset. Example: 1 degC - 10 deltaC");
    }
    // Same as addition, treat the second unit as a delta if has an offset
    let newMagnitude = this.getMagnitude() - other.getMagnitude();
    return new Quantity(newMagnitude, this.getDimensions(), this.getOffset());
  };

  /**
  * Multiply a physical quantity by a scalar or another physical quantity. 
  *
  * @param {number|Quantity} other Value to multiply the physical quantity by
  * @return {Quantity} New Quantity object representing the new value
  */
  Quantity.prototype.multiply = function(other) {
    // Convert to a quantity if a number is supplied as input
    if (typeof(other) === "number") {
      other = new Quantity(other);
    }
    // Check if the offsets are compatible
    if (this.offset != 0 || other.offset != 0) {
      throw ("Cannot multiply dimensions with an offset, if using " +
             "temperatures consider using 'detlaC' or 'deltaF' instead");
    }
    let newMagnitude = this.getMagnitude();
    let newDimensions = this.getDimensions();
    let newOffset = this.getOffset();
    newOffset = 0;
    newMagnitude *= other.getMagnitude();
    let otherDimensions = other.getDimensions();
    for (let dim in otherDimensions) {
      if (newDimensions.hasOwnProperty(dim)) {
        newDimensions[dim] += otherDimensions[dim];
        if (newDimensions[dim] == 0) {
          delete newDimensions[dim];
        }
      } else {
        newDimensions[dim] = otherDimensions[dim];
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
    if (this.offset != 0) {
      throw ("Cannot invert dimensions with an offset, if using " +
             "temperatures consider using 'detlaC' or 'deltaF' instead");
    }
    let newMagnitude = 1.0 / this.getMagnitude();
    let newDimensions = this.getDimensions();
    for (let dim in newDimensions) {
      newDimensions[dim] = -newDimensions[dim];
    }
    return (new Quantity(newMagnitude, newDimensions));
  };

  /**
  * Division, same as the multiplication by the inverse. this operation loses 
  * all offset information.
  *
  * @param {Quantity|number} other Value to divide by
  * @return {Quantity} New value that is the result of the division.
  */
  Quantity.prototype.divide = function(other) {
    // Convert to a quantity if a number is supplied as input
    if (typeof(other) === "number") {
      other = new Quantity(other);
    }
    if (this.offset != 0 || other.offset != 0) {
      throw ("Cannot divide dimensions with an offset, if using " +
             "temperatures consider using 'detlaC' or 'deltaF' instead");
    }
    let inverseValue = other.invert();
    return this.multiply(inverseValue);
  };

  /**
  * Raise the unit to the provided power
  * 
  * @param {number} power Integer power to raise the physical quantity to
  * @returns {Quantity} Physical quantity raised to provided power
  */
  Quantity.prototype.power = function(power) {
    if (!Number.isInteger(power)) {
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
   * Compare physical quantity to another and return their relative magnitudes
   * 
   * @param {Quantity|number} other Other quantity to compare to
   * @param {number} tolerance Maximum difference between the two quantities 
   *                           that is still considered equal. default=0
   * 
   * @return {number} Number indicating the result of the comparison.
   *                    -1: other is less than this quantity
   *                     0: other is equal to this quantity within 
   *                        the provided tolerance
   *                     1: other is greater than this quantity
   */
  Quantity.prototype.compare = function(other, tolerance) {
    // Convert to a quantity if a number is supplied as input
    if (typeof(other) === "number") {
      other = new Quantity(other);
    }
    // Only quantities with the same units can be compared
    if (!this.sameDimensions(other)) {
      throw "Cannot compare quantities with unlike units";
    }

    // Do the comparison and return the result
    let thisMag = this.getMagnitude() + this.getOffset();
    let otherMag = other.getMagnitude() + other.getOffset();
    if (otherMag - thisMag < -tolerance) {
      return -1;
    } else if (otherMag - thisMag > tolerance) {
      return 1;
    } else {
      return 0;
    }
  };

  /**
   * Check for equality with another quantity
   *
   * @param {Quantity} other Other quantity to check for equality with
   * @param {number} tolerance Maximum difference between quantity magnitudes 
   *                           that can be considered equal. default=0
   * @return {boolean} Returns true if quantities are equal, false if not
   */
  Quantity.prototype.equals = function(other, tolerance) {
    return (this.compare(other, tolerance) == 0);
  }

  /**
  * Get the magnitude of the physical quantity with the supplied unit
  *
  * @param {string} unitString Unit to get the magnitude of the Quantity in 
  * @return {number} Magnitude of the quantity in the new unit
  */
  Quantity.prototype.in = function(unitString) {

    let convertQuantity = quantity(1, unitString);
    // Check for consistent units
    if (!this.sameDimensions(convertQuantity)) {
      throw "Cannot convert units that are not alike";
    }
    // Get the current magnitude without the offset
    var currentMagnitude = this.getMagnitude() + this.getOffset();
    // Subtract off the offset of the new unit
    var newMagnitude = currentMagnitude - convertQuantity.getOffset();
    // Finally, divide by the magnitude of the new unit
    var newMagnitude = newMagnitude / convertQuantity.getMagnitude();
    return newMagnitude;
  };

  /**
   * Combined list of all units, conversion factors and unit descriptions
   */
  const units = {
    // Singular Unit
    "1": new Quantity(1),
    // Mass units
    kg: new Quantity(1, {mass: 1}), // Only allowed "prefix unit" without prefix
    g: new Quantity(1e-3, {mass: 1}),
    u: new Quantity(1.66053878200000E-27, {mass: 1}),
    AMU: new Quantity(1.66053878200000E-27, {mass: 1}),
    grain: new Quantity(6.47989100000000E-05, {mass: 1}),
    ozm: new Quantity(2.83495231250000E-02, {mass: 1}),
    lbm: new Quantity(4.53592370000000E-01, {mass: 1}),
    stone: new Quantity(6.35029318000000E+00, {mass: 1}),
    sg: new Quantity(1.45939029372064E+01, {mass: 1}),
    cwt: new Quantity(4.53592370000000E+01, {mass: 1}),
    uk_cwt: new Quantity(5.08023454400000E+01, {mass: 1}),
    ton: new Quantity(9.07184740000000E+02, {mass: 1}),
    uk_ton: new Quantity(1.01604690880000E+03, {mass: 1}),
    slug: new Quantity(1.45939029372064E+01, {mass: 1}),
    // Length Units
    m: new Quantity(1, {length: 1}),
    ang: new Quantity(1.00000000000000E-10, {length: 1}),
    picapt: new Quantity(3.52777777777778E-04, {length: 1}),
    pica: new Quantity(4.23333333333333E-03, {length: 1}),
    "in": new Quantity(2.54000000000000E-02, {length: 1}),
    ft: new Quantity(3.04800000000000E-01, {length: 1}),
    yd: new Quantity(9.14400000000000E-01, {length: 1}),
    ell: new Quantity(1.14300000000000E+00, {length: 1}),
    mi: new Quantity(1.60934400000000E+03, {length: 1}),
    survey_mi: new Quantity((1200/3937)*5280, {length: 1}),
    Nmi: new Quantity(1.85200000000000E+03, {length: 1}),
    league: new Quantity(5.55600000000000E+03, {length: 1}),
    ly: new Quantity(9.46073047258080E+15, {length: 1}),
    parsec: new Quantity(3.08567758128155E+16, {length: 1}),
    survey_ft: new Quantity(1200/3937, {length: 1}),
    au: new Quantity(1.49597870700000E+11, {length: 1}),
    // Time units
    sec: new Quantity(1, {time: 1}),
    s: new Quantity(1, {time: 1}),
    min: new Quantity(6.00000000000000E+01, {time: 1}),
    hr: new Quantity(3.60000000000000E+03, {time: 1}),
    day: new Quantity(8.64000000000000E+04, {time: 1}),
    yr: new Quantity(3.15576000000000E+07, {time: 1}),
    stellar_day: new Quantity(8.637641003520000E+04, {time: 1}),
    // Temperature units
    K: new Quantity(1, {temperature: 1}),
    deltaF: new Quantity(5.55555555555543E-01, {temperature: 1}),
    degF: new Quantity(5.55555555555543E-01, {temperature: 1}, 2.55372222222222E+02),
    deltaC: new Quantity(1, {temperature: 1}),
    degC: new Quantity(1, {temperature: 1}, 2.73150000000000E+02),
    Rank: new Quantity(5.55555555555543E-01, {temperature: 1}),
    Reau: new Quantity(1.25000000000000E+00, {temperature: 1}, 2.73150000000000E+02),
    deltaReau: new Quantity(1.25000000000000E+00, {temperature: 1}),
    // Velocity Units
    mph: new Quantity(4.47040000000000E-01, {length: 1, time: -1}),
    kn: new Quantity(5.14444444444444E-01, {length: 1, time: -1}),
    admkn: new Quantity(5.14773333333333E-01, {length: 1, time: -1}),
    c: new Quantity(2.99792458000000E+8, {length: 1, time: -1}),
    // Acceleration Units
    grav: new Quantity(9.80665000000000E+00, {length: 1, time: -2}),
    // Pressure Units
    Pa: new Quantity(1, {mass: 1, length: -1, time: -2}),
    mmHg: new Quantity(1.33322000000000E+02, {mass: 1, length: -1, time: -2}),
    Torr: new Quantity(1.33322368421053E+02, {mass: 1, length: -1, time: -2}),
    psi: new Quantity(6.89475729316836E+03, {mass: 1, length: -1, time: -2}),
    atm: new Quantity(1.01325000000000E+05, {mass: 1, length: -1, time: -2}),
    bar: new Quantity(1.00000e5, {mass: 1, length: -1, time: -2}),
    inHg: new Quantity(3.38638866666670E+03, {mass: 1, length: -1, time: -2}),
    // Force Units
    N: new Quantity(1, {mass: 1, length: 1, time: -2}),
    dyn: new Quantity(1.00000000000000E-05, {mass: 1, length: 1, time: -2}),
    pond: new Quantity(9.80665000000000E-03, {mass: 1, length: 1, time: -2}),
    lbf: new Quantity(4.44822161526050E+00, {mass: 1, length: 1, time: -2}),
    ozf: new Quantity(2.78013850953781E-01, {mass: 1, length: 1, time: -2}),
    // Energy Units
    J: new Quantity(1, {mass: 1, length: 2, time: -2}),
    eV: new Quantity(1.60217648700000E-19, {mass: 1, length: 2, time: -2}),
    erg: new Quantity(1.00000000000000E-07, {mass: 1, length: 2, time: -2}),
    Cal: new Quantity(4.18680000000000E+00, {mass: 1, length: 2, time: -2}),
    BTU: new Quantity(1.05505585262000E+03, {mass: 1, length: 2, time: -2}),
    Wh: new Quantity(3.60000000000000E+03, {mass: 1, length: 2, time: -2}),
    HPh: new Quantity(2.68451953769617E+06, {mass: 1, length: 2, time: -2}),
    // Torque Units (same dimensions as energy)
    "ft-lb": new Quantity(1.35581794833140E+00, {mass: 1, length: 2, time: -2}),
    // Power Units
    W: new Quantity(1, {mass: 1, length: 2, time: -3}),
    PS: new Quantity(7.35498750000000E+02, {mass: 1, length: 2, time: -3}),
    HP: new Quantity(7.45699871582270E+02, {mass: 1, length: 2, time: -3}),
    // Volume units
    L: new Quantity(1.00000000000000E-03, {length: 3}),
    tsp: new Quantity(4.92892159375000E-06, {length: 3}),
    tspm: new Quantity(5.00000000000000E-06, {length: 3}),
    tbs: new Quantity(1.47867647812500E-05, {length: 3}),
    fl_oz: new Quantity(2.95735295625000E-05, {length: 3}),
    cup: new Quantity(2.36588236500000E-04, {length: 3}),
    pt: new Quantity(4.73176473000000E-04, {length: 3}),
    uk_pt: new Quantity(5.68261250000000E-04, {length: 3}),
    qt: new Quantity(9.46352946000000E-04, {length: 3}),
    uk_qt: new Quantity(1.13652250000000E-03, {length: 3}),
    gal: new Quantity(3.78541178400000E-03, {length: 3}),
    uk_gal: new Quantity(4.54609000000000E-03, {length: 3}),
    bushel: new Quantity(3.52390701668800E-02, {length: 3}),
    barrel: new Quantity(1.58987294928000E-01, {length: 3}),
    MTON: new Quantity(1.13267386368000E+00, {length: 3}),
    GRT: new Quantity(2.83168465920000E+00, {length: 3}),
    // Area units
    ar: new Quantity(1.00000000000000E+02, {length: 2}),
    Morgen: new Quantity(2.50000000000000E+03, {length: 2}),
    acre: new Quantity(4.04687260987425E+03, {length: 2}),
    us_acre: new Quantity(4.04687260987425E+03, {length: 2}),
    uk_acre: new Quantity(4.04685642240000E+03, {length: 2}),
    ha: new Quantity(1.00000000000000E+04, {length: 2}),
    // Information units
    bit: new Quantity(1, {information: 1}),
    b: new Quantity(1, {information: 1}),
    byte: new Quantity(8, {information: 1}),
    B: new Quantity(8, {information: 1}),
    word: new Quantity(16, {information: 1}),
    baud: new Quantity(1, {information:  1, time: -1}),
    // Electro-magnetism units
    A: new Quantity(1, {current: 1}),
    C: new Quantity(1, {current: 1, time: 1}),
    e: new Quantity(1.60217663400000E-19, {current: 1, time: 1}),
    V: new Quantity(1, {mass: 1, length: 2, current: -1, time: -3}),
    ohm: new Quantity(1, {mass: 1, length: 2, time: -3, current: -2}),
    F: new Quantity(1, {time: 4, current: 2, length: -2, mass: -1}),
    H: new Quantity(1, {length: 2, mass: 1, time: -2, current: -2}),
    S: new Quantity(1, {time: 3, current: 2, length: -2, mass: -1}),
    Wb: new Quantity(1, {mass: 1, length:2, time: -2, current: -1}),
    Mx: new Quantity(1.0E-8, {mass: 1, length: 2, time: -2, current: -1}),
    T: new Quantity(1, {mass: 1, current: -1, time: -2}),
    Gs: new Quantity(1.00000000000000E-04, {mass: 1, current: -1, time: -2}),
    ga: new Quantity(1.00000000000000E-04, {mass: 1, current: -1, time: -2}),
    // Substance Units
    mol: new Quantity(1, {substance: 1}),
    // Luminosity Units
    cd: new Quantity(1, {luminosity: 1}),
    // Rotational units
    rad: new Quantity(1),
    rev: new Quantity(2*Math.PI),
    deg: new Quantity(Math.PI/180),
    // Frequency Units
    Hz: new Quantity(2*Math.PI, {time: -1}),
    rpm: new Quantity(2*Math.PI/60, {time: -1}),
  };

  const prefixes = {
    y: 1e-24, // yocto
    z: 1e-21, // zepto
    a: 1e-18, // atto
    f: 1e-15, // femto
    p: 1e-12, // pico
    n: 1e-9, // nano
    u: 1e-6, // micro
    m: 1e-3, // milli
    c: 1e-2, // centi
    d: 1e-1, // deci
    da: 1e1, // deca
    h: 1e2, // hecto
    k: 1e3, // kilo
    M: 1e6, // mega
    G: 1e9, // giga
    T: 1e12, // tera
    P: 1e15, // peta
    E: 1e18, // exa
    Z: 1e21, // zetta
    Y: 1e24, // yotta
    Ki: Math.pow(2, 10), // Kilo(byte)
    Mi: Math.pow(2, 20),
    Gi: Math.pow(2, 30),
    Ti: Math.pow(2, 40),
    Pi: Math.pow(2, 50),
    Ei: Math.pow(2, 60),
    Zi: Math.pow(2, 70),
    Yi: Math.pow(2, 80)
  };

  /**
  * Parse a string to get it's representation as a physical quantity.
  * 
  * @param {Number} magnitude Magnitude of the quantity to return
  * @param {string} unitString String representation of the desired unit. This
  *                            can be compound (e.g. "ft lb / s"), can include
  *                            powers with "^" (e.g. "in^2 / s^2"), and can also
  *                            include standard prefixes using brackets "[]" 
  *                            (e.g. "[k]g / [m]m"). It cannot include 
  *                            parenthesis "()", any values the follow a "/" 
  *                            will be inverted in the returned unit (e.g. 
  *                            "1 / s m" == "s^-1 m^-1")
  * @return {Quantity} The unit of measurement as  
  */
  function quantity(magnitude, unitString) {
    const unitRegex = /^(?:\[(\D+)\])?(1|\D+)(?:\^([\-\d]+))?$/;
    let returnQuantity = new Quantity(1);
    if (unitString) {
      let sections = unitString.split("/");
      if (sections.length > 2) {
        throw "Cannot parse unit with 2 or more '/' symbols";
      }
      for (let si=0; si<sections.length; si++) {
        let unitSyms = sections[si].trim().split(/\s+/g);
        for (let ui=0; ui<unitSyms.length; ui++) {
          let matches = unitRegex.exec(unitSyms[ui]);
          if (!matches) {
            throw "Cannot convert \"" + unitSyms[ui] + "\" to a valid unit";
          }
          // Get the prefix and make sure that is an actual prefix
          let prefix = matches[1];
          let prefixValue;
          if (prefix) {
            prefixValue = prefixes[prefix];
            if (!prefixValue) {
              throw prefix + " is not a valid prefix";
            }
          } else {
            prefixValue = 1;
          }
          if (si == 1) {
            prefixValue = 1 / prefixValue;
          }
          // Match the unit and get it's value
          let unitStr = matches[2];
          if (!unitStr) {
            throw "Error parsing unit: \"" + unitString + "\"";
          }
          let unitQuantity = units[unitStr];
          if (unitQuantity) {
            unitQuantity = unitQuantity.copy();
          } else {
            throw "\"" + unitStr + "\" is not a valid unit";
          }
          if (si == 1) {
            unitQuantity = unitQuantity.invert();
          }
          // Get the power of the unit and invert it if in section 1 (si==1)
          let power = matches[3];
          let powerValue;
          if (power) {
            powerValue = parseInt(power);
            if (!powerValue) {
              throw power + " is not a valid unit power";
            }
          } else {
            powerValue = 1;
          }
          // Multiply through the prefixes and powers to get the appropriate
          // quantity
          if (unitQuantity.offset == 0) {
            unitQuantity = unitQuantity.multiply(prefixValue);
            unitQuantity = unitQuantity.power(powerValue);
            returnQuantity = returnQuantity.multiply(unitQuantity);
          } else if (prefixValue != 1) {
            throw "Cannot add prefix to non 0 offset unit " + unitSyms[ui];
          } else if (!(sections.length == 1 && unitSyms.length == 1)) {
            throw ("Cannot create a compound unit with non-zero offset " +
                   "unit \"" + unitSyms[ui] + "\"");
          } else {
            returnQuantity = units[unitSyms[ui]];
          }
        }
      }
    }
    // Multiply through by magnitude and return
    returnQuantity.magnitude *= magnitude;
    return returnQuantity;
  };

  /**
   * Compare the equality of two floats using an optional user supplied 
   * tolerance.
   *
   * @param {Number} num1 First number to compare
   * @param {Number} num2 Second number to compare
   * @param {Number} tolerance Maximum difference between values that can be 
   *                           considered equal. default=0
   * @returns {Boolean} If the numbers are equal or not
   */
  function floatEq(num1, num2, tolerance) {
    if (typeof(tolerance) == "undefined") {
      tolerance = 0;
    }
    return Math.abs(num2 - num1) <= tolerance;
  }

  return {
    quantity: quantity,
    units: units,
  };

})();

export default pqm;
