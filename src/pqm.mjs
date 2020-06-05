/*******************************************************************************
* Library for dealing with physical quantities (numbers with units) in with 
* functions for parsing units from strings, converting, adding, subtracting, 
* multiplying and dividing by numbers with units attached.
*******************************************************************************/
const pqm = (function () {

  // Allowed dimensions in the 'dimensions' input
  const dimensionTypes = [
    "mass",
    "length",
    "time",
    "temperature",
    "current",
    "substance",
    "luminosity",
    "information",
    "rotation"
  ];
  const numDimensionTypes = dimensionTypes.length;

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
    // Fill in member values
    this.magnitude = magnitude;
    this.dimensions = new Array(numDimensionTypes);
    for (let ii=0; ii<numDimensionTypes; ii++) {
      this.dimensions[ii] = 0;
    }
    if (dimensions) {
      if (Array.isArray(dimensions)) {
        this.dimensions = dimensions;
      } else {
        for (let dim in dimensions) {
          let dimensionIdx = dimensionTypes.indexOf(dim);
          // Check for valid user input
          if (dimensionIdx == -1) { // not a valid dimension type
            throw "Cannot create physical quantity with dimension '" + dim + "'";
          }
          if (!Number.isInteger(this.dimensions[dimensionIdx])) {
            throw "Units may only be raised to integer powers";
          }
          this.dimensions[dimensionIdx] = dimensions[dim];
        }
      }
    }
    // Finally, set the offset
    if (offset) {
      this.offset = offset;
    } else {
      this.offset = 0;
    }
  };

  /**
   * Get the dimensionality of the quantity (total number of dimensions of 
   * all types)
   * 
   * @returns {number} Dimensionality of the physical quantity
   */
  Quantity.prototype.dimensionality = function() {
    let total = 0;
    for (let ii=0; ii<numDimensionTypes; ii++) {
      if (this.dimensions[ii] != 0) {
        total += Math.abs(this.dimensions[ii]);
      }
    }
    return total;
  }

  /**
   * Make a copy of the this unit's dimensions
   * 
   * @returns {Array} Copy of this array's dimensions
   */
  Quantity.prototype.copyDimensions = function() {
    let dimCopy = new Array(numDimensionTypes);
    for (let ii=0; ii<numDimensionTypes; ii++) {
      dimCopy[ii] = this.dimensions[ii];
    }
    return dimCopy;
  };

  /**
  * Make a copy of this physical quantity
  * 
  * @returns {Quantity} Copy of the Quantity
  */
  Quantity.prototype.copy = function() {
    return new Quantity(this.magnitude, this.copyDimensions(), this.offset);
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
    for (let ii=0; ii<numDimensionTypes; ii++) {
      if (this.dimensions[ii] != other.dimensions[ii]) {
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
    if (other.offset != 0) {
      throw ("A unit with a zero offset (such as degC or degF) cannot be " +
             "added to another unit");
    }
    // Adding a value treats the second input value as a delta, in the case of 
    // units with offsets
    let newMagnitude = this.magnitude + other.magnitude;
    return new Quantity(newMagnitude, this.copyDimensions(), this.offset);
  };

  /**
  * Subtract physical quantities
  *
  * @param {Quantity} other Value to subtract
  * @return {Quantity} Result of the subtraction
  */
  Quantity.prototype.sub = function(other) {
    // Convert to a quantity if a number is supplied as input
    if (typeof(other) === "number") {
      other = new Quantity(other);
    }
    if (!this.sameDimensions(other)) {
      throw "Cannot subtract units that are not alike";
    }
    let newMagnitude =   (this.magnitude + this.offset) 
                       - (other.magnitude + other.offset);
    let newOffset = 0;
    if (other.offset != 0) {
      // Subtracting a unit with an zero offset, result should be a 'delta'
      // Unit with no offset
      newOffset = 0;
    } else {
      // Subtracting a unit with no zero offset, this unit's offset is 
      // preserved
      newOffset = this.offset;
      newMagnitude -= newOffset;
    }
    // Same as addition, treat the second unit as a delta if has an offset
    return new Quantity(newMagnitude, this.copyDimensions(), newOffset);
  };

  /**
  * Multiply a physical quantity by a scalar or another physical quantity. 
  *
  * @param {number|Quantity} other Value to multiply the physical quantity by
  * @return {Quantity} New Quantity object representing the new value
  */
  Quantity.prototype.mul = function(other) {
    // Convert to a quantity if a number is supplied as input
    if (typeof(other) === "number") {
      other = new Quantity(other);
    }
    // Check if the offsets are compatible
    if (this.offset != 0 || other.offset != 0) {
      throw ("Cannot multiply dimensions with an offset, if using " +
             "temperatures consider using 'deltaC' or 'deltaF' instead");
    }
    // Multiply the magnitude
    let newMagnitude = this.magnitude;
    newMagnitude *= other.magnitude;
    let newDimensions = new Array(numDimensionTypes);
    for (let ii=0; ii<numDimensionTypes; ii++) {
      newDimensions[ii] = this.dimensions[ii] + other.dimensions[ii];
    }
    return new Quantity(newMagnitude, newDimensions);
  };

  /**
  * Invert a physical quantity as 1/(old_quantity). this allows division by 
  * using the multiplication function. this operation also loses offset 
  * information.
  *
  * @return {Quantity} Inverted physical quantity
  */
  Quantity.prototype.inv = function() {
    if (this.offset != 0) {
      throw ("Cannot invert dimensions with an offset, if using " +
             "temperatures consider using 'deltaC' or 'deltaF' instead");
    }
    let newMagnitude = 1.0 / this.magnitude;
    let newDimensions = this.copyDimensions();
    for (let ii=0; ii<numDimensionTypes; ii++) {
      newDimensions[ii] = -newDimensions[ii];
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
  Quantity.prototype.div = function(other) {
    // Convert to a quantity if a number is supplied as input
    if (typeof(other) === "number") {
      other = new Quantity(other);
    }
    if (this.offset != 0 || other.offset != 0) {
      throw ("Cannot divide dimensions with an offset, if using " +
             "temperatures consider using 'deltaC' or 'deltaF' instead");
    }
    let inverseValue = other.inv();
    return this.mul(inverseValue);
  };

  /**
  * Raise the unit to the provided power
  * 
  * @param {number} n Integer power to raise the physical quantity to
  * @returns {Quantity} Physical quantity raised to provided power
  */
  Quantity.prototype.pow = function(n) {
    if (!Number.isInteger(n)) {
      throw "Quantities don't support dimensions with fractional powers";
    }
    if (this.offset != 0 && n > 1) {
      throw "Cannot raise units with zero offsets to powers > 1";
    }
    if (n == 0) {
      return new Quantity(1);
    }
    let newMagnitude = Math.pow(this.magnitude, n);
    let newDimensions = this.copyDimensions();
    for (let ii=0; ii<numDimensionTypes; ii++) {
      newDimensions[ii] *= n;
    }
    return new Quantity(newMagnitude, newDimensions, this.offset); 
  };

  /**
   * Get the Nth root of a quantity, equivalent to x^(1/N)
   * 
   * @param {number} n Integer root to take of the quantity
   * @returns {Quantity} nth root of the calling quantity
   */
  Quantity.prototype.root = function(n) {
    // Check user input
    if (!Number.isInteger(n) || (n < 1)) {
      throw "Root may only be a positive integer greater than or equal to 1";
    }
    if (this.offset != 0 && n > 1) {
      throw "Cannot take root of units with zero offset";
    }
    // Check that quantity does not have a negative magnitude
    if (this.magnitude < 0) {
      throw ("Root function not supported for magnitudes with negative " +
             "magnitudes");
    }
    let newDimensions = this.copyDimensions();
    for (let ii=0; ii<numDimensionTypes; ii++) {
      let update = newDimensions[ii] / n;
      if (!Number.isInteger(n)) {
        throw ("Root operation would result in a fractional dimensional " +
               "power. This is not supported"); 
      }
      newDimensions[ii] = update;
    }
    let newMagnitude = Math.pow(this.magnitude, 1/n);
    // Return the new quantity
    return new Quantity(newMagnitude, newDimensions, this.offset);
  };

  /**
   * Compare physical quantity to another and return their relative magnitudes
   * 
   * @param {Quantity|number} other Other quantity to compare to
   * @param {Quantity|number} tolerance Maximum difference between the two 
   *                                    quantities that is still considered 
   *                                    equal. Can be provided as an absolute 
   *                                    quantity, or as a fraction of this 
   *                                    quantity. default=0
   * 
   * @return {number} Number indicating the result of the comparison.
   *                    -1: other is greater than this quantity
   *                     0: other is equal to this quantity within 
   *                        the provided tolerance
   *                     1: other is less than this quantity
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
    // default value for tolerance
    if (typeof(tolerance) === "undefined") {
      tolerance = 0;
    }
    let absoluteTolerance = 0;
    // If the user input is a quantity, check that the units are compatible
    // and if they are the magnitude of the tolerance will be the absolute
    // tolerance
    if (typeof(tolerance) === "object") {
      if(!this.sameDimensions(tolerance)) {
        throw "tolerance dimensions are not compatible with this quantity";
      }
      if (tolerance.offset != 0) {
        throw "Absolute tolerance in units with a zero offset is not allowed";
      }
      absoluteTolerance = tolerance.magnitude;
    } else {
      if (this.offset != 0 && tolerance != 0) {
        throw "Fractional tolerances not allowed for quantities with a " +
               "zero offset. Use an absolute tolerance instead";
      }
      absoluteTolerance = this.magnitude * tolerance;
    }
    // Do the comparison and return the result
    let thisMag = this.magnitude + this.offset;
    let otherMag = other.magnitude + other.offset;
    if (otherMag - thisMag < -absoluteTolerance) {
      return 1;
    } else if (otherMag - thisMag > absoluteTolerance) {
      return -1;
    } else {
      return 0;
    }
  };

  /**
   * Check for equality with another quantity
   *
   * @param {Quantity|number} other Other quantity to check for equality with
   * @param {Quantity|number} tolerance Maximum difference between the two 
   *                                    quantities that is still considered 
   *                                    equal. Can be provided as an absolute 
   *                                    quantity, or as a fraction of this 
   *                                    quantity. default=0
   * 
   * @return {boolean} Returns true if quantities are equal, false if not
   */
  Quantity.prototype.eq = function(other, tolerance) {
    return (this.compare(other, tolerance) == 0);
  }

  /**
   * Check if this quantity is less than another quantity
   * 
   * @param {Quantity|number} other Other quantity to check against
   * @param {Quantity|number} tolerance Maximum difference between the two 
   *                                    quantities that is still considered 
   *                                    equal. Can be provided as an absolute 
   *                                    quantity, or as a fraction of this 
   *                                    quantity. default=0
   * 
   * @return {boolean} Returns true if the other quantity is less than this 
   *                   quantity.
   */
  Quantity.prototype.lt = function(other, tolerance) {
    return (this.compare(other, tolerance) < 0);
  }

  /**
   * Check if this quantity is less than or equal to another quantity
   * 
   * @param {Quantity|number} other Other quantity to check against
   * @param {Quantity|number} tolerance Maximum difference between the two 
   *                                    quantities that is still considered 
   *                                    equal. Can be provided as an absolute 
   *                                    quantity, or as a fraction of this 
   *                                    quantity. default=0
   * 
   * @return {boolean} Returns true if the other quantity is less than or equal
   *                   to this quantity.
   */
  Quantity.prototype.lte = function(other, tolerance) {
    return (this.compare(other, tolerance) <= 0);
  }

  /**
   * Check if this quantity is greater than another quantity
   * 
   * @param {Quantity|number} other Other quantity to check against
   * @param {Quantity|number} tolerance Maximum difference between the two 
   *                                    quantities that is still considered 
   *                                    equal. Can be provided as an absolute 
   *                                    quantity, or as a fraction of this 
   *                                    quantity. default=0
   * 
   * @returns {boolean} Returns true if the other quantity is greater than 
   *                    this quantity.
   */
  Quantity.prototype.gt = function(other, tolerance) {
    return (this.compare(other, tolerance) > 0);
  }

  /**
   * Check if this quantity is greater than or equal to another quantity
   * 
   * @param {Quantity|number} other Other quantity to check against
   * @param {Quantity|number} tolerance Maximum difference between the two 
   *                                    quantities that is still considered 
   *                                    equal. Can be provided as an absolute 
   *                                    quantity, or as a fraction of this 
   *                                    quantity. default=0
   * 
   * @returns {boolean} Returns true if the other quantity is greater than or  
   *                    equal to this quantity.
   */
  Quantity.prototype.gte = function(other, tolerance) {
    return (this.compare(other, tolerance) >= 0);
  }

  /**
  * Get the magnitude of the physical quantity with the supplied unit
  *
  * @param {string} unitString Unit to get the magnitude of the Quantity in 
  * 
  * @return {number} Magnitude of the quantity in the new unit
  */
  Quantity.prototype.in = function(unitString) {

    let convertQuantity = quantity(1, unitString);
    // Check for consistent units
    if (!this.sameDimensions(convertQuantity)) {
      throw "Cannot convert units that are not alike";
    }
    // Get the current magnitude without the offset
    var currentMagnitude = this.magnitude + this.offset;
    // Subtract off the offset of the new unit
    var newMagnitude = currentMagnitude - convertQuantity.offset;
    // Finally, divide by the magnitude of the new unit
    var newMagnitude = newMagnitude / convertQuantity.magnitude;
    return newMagnitude;
  };

  /**
   * Get the value of the quantity in terms of a compact combination of the
   * supplied unit list
   * 
   * @param {string[]} unitList List of units to return the quantity in terms of
   * 
   * @returns {[number, string]} Array with magnitude and the units the 
   *                             magnitude is in terms of as a string.
   */
  Quantity.prototype.with = function(unitList) {
    
    // Convert unitList to a dimension Array
    let unitArray = new Array(unitList.length);
    for (let ii = 0; ii<unitList.length; ii++) {
      let unitQuantity = getUnitQuantity(unitList[ii]);
      unitArray[ii] = unitQuantity.dimensions;
    }
    // Loop through each dimension and create a list of unit list indexes that
    // are the best match for the dimension
    let useUnits = new Array();
    let useUnitsPower = new Array();
    let remainder = this.dimensionality();
    let remainderArray = this.dimensions.slice();
    while (remainder > 0) {
      let bestIdx = -1;
      let bestInv = 0;
      let bestRemainder = remainder;
      let bestRemainderArray = new Array(dimensionTypes.length);
      for (let unitIdx=0; unitIdx<unitList.length; unitIdx++) {
        for (let isInv=-1; isInv<=1; isInv += 2) {
          let newRemainder = 0;
          let newRemainderArray = new Array(dimensionTypes.length);
          for (let dimIdx=0; dimIdx<dimensionTypes.length; dimIdx++) {
            newRemainderArray[dimIdx] = (
              remainderArray[dimIdx] - (isInv * unitArray[unitIdx][dimIdx])
            );
            newRemainder += Math.abs(newRemainderArray[dimIdx]);
          }
          if (newRemainder < bestRemainder) {
            bestIdx = unitIdx;
            bestInv = isInv;
            bestRemainder = newRemainder;
            bestRemainderArray = newRemainderArray;
          }
        }
      }
      // Check to make sure that progress is being made towards remainder = 0
      // if no more progress is being made then the provided units don't span
      // this unit, throw an error.
      if (bestRemainder >= remainder) {
        throw "Cannot represent this quantity with the supplied units";
      }
      // Check if the new best unit already in the set of numerator or
      // denominator units. If it is, increase the power of that unit, if it
      // is not, then add it.
      let existingIdx = useUnits.indexOf(bestIdx);
      if (existingIdx == -1) {
        useUnits.push(bestIdx);
        useUnitsPower.push(bestInv);
      } else {
        useUnitsPower[existingIdx] += bestInv;
      }
      remainder = bestRemainder;
      remainderArray = bestRemainderArray;
    }

    // At this point the units to be used are in useUnits, clean
    // them up and create a unit system to return to the caller.
    let numerator = "";
    let denominator = "";
    for (let ii=0; ii<useUnits.length; ii++) {
      if (useUnitsPower[ii] > 0) {
        numerator += unitList[useUnits[ii]];
        if (useUnitsPower[ii] > 1) {
          numerator += ("^" + useUnitsPower[ii] + " ");
        } else {
          numerator += " ";
        }
      } else {
        denominator += unitList[useUnits[ii]];
        if (useUnitsPower[ii] < -1) {
          denominator += ("^" + -useUnitsPower[ii] + " ");
        } else {
          denominator += " ";
        }
      }
    }
    let fullUnits = "";
    if (numerator.length == 0 && denominator.length == 0) {
      fullUnits = "1";
    } else if (denominator.length == 0) {
      fullUnits = numerator.trim();
    } else {
      if (numerator.length == 0) {
        numerator = "1 ";
      }
      fullUnits = (numerator + "/ " + denominator).trim();
    }
    return [this.in(fullUnits), fullUnits];
  }

  /**
   * Look for the most compact SI representation for the quantity and return
   * it. This function is capable of representing any unit.
   * 
   * @returns {[number, string]} Index 0: Magnitude of the quantity
   *                             Index 1: String representation of the units
   */
  Quantity.prototype.inSI = function() {
    return this.with([
      "[k]g", "m", "s", "K", "A", "mol", "cd", "bit", "rad", //Base Units
      "Hz", "N", "Pa", "J", "W", "C", "V", "F", "ohm", "S", "Wb", "T", "H",
      "lm", "lx", "Bq", "Gy", "Sv"
    ]);
  }

  /**
   * Look for the most compact CGS representation for the quantity and return
   * it. This function is not able to represent all quantities.
   * 
   * @returns {[number, string]} Index 0: Magnitude of the quantity
   *                             Index 1: String representation of the units
   */
  Quantity.prototype.inCGS = function() {
    return this.with([
      "g", "[c]m", "s", "deltaC", "dyn", "erg", "Ba", "P", "St"
    ]);
  }

  /**
   * Look for the most compact US Customary representation for the quantity 
   * and return it. This function is not able to represent all quantities.
   * 
   * @returns {[number, string]} Index 0: Magnitude of the quantity
   *                             Index 1: String representation of the units
   */
  Quantity.prototype.inUS = function() {
    return this.with([
      "lbm", "ft", "s", "deltaF", "gal", "lbf", "BTU", "HP"
    ])
  }

  /**
   * Display the Quantity as a string
   * 
   * @returns {string} Quantity displayed as a string
   */
  Quantity.prototype.toString = function() {
    let asSI = this.inSI();
    return asSI[0].toString() + " " + asSI[1];
  }

  /**
   * Combined list of all units, conversion factors and unit descriptions
   */
  let units = {
    // Non dimensional units
    "1": new Quantity(1),
    "%": new Quantity(0.01),
    // Mass units
    g: new Quantity(1e-3, {mass: 1}),
    u: new Quantity(1.66053878200000E-27, {mass: 1}),
    AMU: new Quantity(1.66053878200000E-27, {mass: 1}),
    grain: new Quantity(6.47989100000000E-05, {mass: 1}),
    ozm: new Quantity(2.83495231250000E-02, {mass: 1}),
    lbm: new Quantity(4.53592370000000E-01, {mass: 1}),
    stone: new Quantity(6.35029318000000E+00, {mass: 1}),
    sg: new Quantity(1.45939029372064E+01, {mass: 1}),
    cwt: new Quantity(4.53592370000000E+01, {mass: 1}),
    dwt: new Quantity(1.55517384E-03, {mass: 1}),
    uk_cwt: new Quantity(5.08023454400000E+01, {mass: 1}),
    ton: new Quantity(9.07184740000000E+02, {mass: 1}),
    uk_ton: new Quantity(1.01604690880000E+03, {mass: 1}),
    metric_ton: new Quantity(1.0E+3, {mass: 1}),
    slug: new Quantity(1.45939029372064E+01, {mass: 1}),
    carat: new Quantity(2.0E-4, {mass: 1}),
    assay_ton: new Quantity(2.9166666666666667E-02, {mass: 1}),
    denier: new Quantity(1.1111111111111112E-07, {mass: 1, length: -1}),
    tex: new Quantity(1.0E-06, {mass: 1, length: -1}),
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
    survey_ft: new Quantity(1200.0/3937.0, {length: 1}),
    au: new Quantity(1.49597870700000E+11, {length: 1}),
    chain: new Quantity(2.0116840233680467E+01, {length: 1}),
    link: new Quantity(2.0116840233680467E-01, {length: 1}),
    rod: new Quantity(5.029210058420117E+0, {length: 1}),
    furlong: new Quantity(2.0116840233680466E+2, {length: 1}),
    fathom: new Quantity(1.8288E+00, {length: 1}),
    us_fathom: new Quantity(1.828804E+00, {length: 1}),
    fermi: new Quantity(1.0E-15, {length: 1}),
    kayser: new Quantity(1.0E+02, {length: -1}),
    // Time units
    sec: new Quantity(1, {time: 1}),
    s: new Quantity(1, {time: 1}),
    min: new Quantity(6.00000000000000E+01, {time: 1}),
    hr: new Quantity(3.60000000000000E+03, {time: 1}),
    day: new Quantity(8.64000000000000E+04, {time: 1}),
    yr: new Quantity(3.1536E+07, {time: 1}),
    shake: new Quantity(1.0E-08, {time: 1}),
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
    knot: new Quantity(5.14444444444444E-01, {length: 1, time: -1}),
    admkn: new Quantity(5.14773333333333E-01, {length: 1, time: -1}),
    c: new Quantity(2.99792458000000E+8, {length: 1, time: -1}),
    // Acceleration Units
    grav: new Quantity(9.80665000000000E+00, {length: 1, time: -2}),
    galileo: new Quantity(1.0E-02, {length: 1, time: -2}),
    // Pressure Units
    Pa: new Quantity(1, {mass: 1, length: -1, time: -2}),
    mHg: new Quantity(1.33322390000000E+05, {mass: 1, length: -1, time: -2}),
    mH2O: new Quantity(9.80665E+03, {mass: 1, length: -1, time: -2}),
    Torr: new Quantity(1.33322368421053E+02, {mass: 1, length: -1, time: -2}),
    psi: new Quantity(6.89475729316836E+03, {mass: 1, length: -1, time: -2}),
    atm: new Quantity(1.01325000000000E+05, {mass: 1, length: -1, time: -2}),
    bar: new Quantity(1.00000e5, {mass: 1, length: -1, time: -2}),
    inHg: new Quantity(3.38638866666670E+03, {mass: 1, length: -1, time: -2}),
    inH2O: new Quantity(2.4908891E+02, {mass: 1, length: -1, time: -2}),
    ftHg: new Quantity(4.0636664E+04, {mass: 1, length: -1, time: -2}),
    ftH2O: new Quantity(2.98906692E+03, {mass: 1, length: -1, time: -2}),
    Ba: new Quantity(1.0E-01, {mass: 1, length: -1, time: -2}),
    // Gauge Pressures
    "Pa-g": new Quantity(1.0, {mass: 1, length: -1, time: -2}, 1.01325E+05),
    "kPa-g": new Quantity(1.0E+03, {mass: 1, length: -1, time: -2}, 1.01325E+05),
    "bar-g": new Quantity(1.00000e5, 
      {mass: 1, length: -1, time: -2}, 1.01325E+05
    ),
    "psi-g": new Quantity(6.89475729316836E+03, 
      {mass: 1, length: -1, time: -2}, 1.01325E+05
    ),
    // Force Units
    N: new Quantity(1, {mass: 1, length: 1, time: -2}),
    dyn: new Quantity(1.00000000000000E-05, {mass: 1, length: 1, time: -2}),
    gf: new Quantity(9.80665E-03, {mass: 1, length: 1, time: -2}),
    pond: new Quantity(9.80665000000000E-03, {mass: 1, length: 1, time: -2}),
    lbf: new Quantity(4.44822161526050E+00, {mass: 1, length: 1, time: -2}),
    ozf: new Quantity(2.78013850953781E-01, {mass: 1, length: 1, time: -2}),
    pdl: new Quantity(1.38254954376E-01, {mass: 1, length: 1, time: -2}),
    "ton-force": new Quantity(8.896443230521E+03, {mass: 1, length: 1, time: -2}),
    // Energy Units
    J: new Quantity(1, {mass: 1, length: 2, time: -2}),
    eV: new Quantity(1.60217648700000E-19, {mass: 1, length: 2, time: -2}),
    erg: new Quantity(1.00000000000000E-07, {mass: 1, length: 2, time: -2}),
    cal: new Quantity(4.18680000000000E+00, {mass: 1, length: 2, time: -2}),
    BTU: new Quantity(1.05505585262000E+03, {mass: 1, length: 2, time: -2}),
    Wh: new Quantity(3.60000000000000E+03, {mass: 1, length: 2, time: -2}),
    HPh: new Quantity(2.68451953769617E+06, {mass: 1, length: 2, time: -2}),
    // Torque Units (same dimensions as energy)
    "ft-lb": new Quantity(1.35581794833140E+00, {mass: 1, length: 2, time: -2}),
    // Insulation Units
    RSI: new Quantity(1.0, {mass: -1, time: 3, temperature: 1}),
    RIP: new Quantity(1.7611018368230189E-01, {mass: -1, time: 3, temperature: 1}),
    clo: new Quantity(1.55E-01, {mass: -1, time: 3, temperature: 1}),
    tog: new Quantity(1.0E-01, {mass: -1, time: 3, temperature: 1}),
    // Power Units
    W: new Quantity(1, {mass: 1, length: 2, time: -3}),
    PS: new Quantity(7.35498750000000E+02, {mass: 1, length: 2, time: -3}),
    HP: new Quantity(7.45699871582270E+02, {mass: 1, length: 2, time: -3}),
    // Dynamic Viscosity
    P: new Quantity(1.0E-01, {mass: 1, length: -1, time: -1}),
    rhe: new Quantity(1.0E+01, {mass: -1, length: 1, time: 1}),
    // Kinematic Viscosity
    St: new Quantity(1.0E-04, {length: 2, time: -1}),
    // Volume units
    L: new Quantity(1.00000000000000E-03, {length: 3}),
    tsp: new Quantity(4.92892159375000E-06, {length: 3}),
    tspm: new Quantity(5.00000000000000E-06, {length: 3}),
    tbs: new Quantity(1.47867647812500E-05, {length: 3}),
    fl_oz: new Quantity(2.95735295625000E-05, {length: 3}),
    uk_fl_oz: new Quantity(2.84130625E-05, {length: 3}),
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
    gill: new Quantity(1.1829411825E-04, {length: 3}),
    uk_gill: new Quantity(1.420653125E-04, {length: 3}),
    peck: new Quantity(8.80976754172E-03, {length: 3}),
    dry_gal: new Quantity(4.40488377086E-03, {length: 3}),
    dry_qt: new Quantity(1.101220942715E-03, {length: 3}),
    dry_pt: new Quantity(5.506104713575E-04, {length: 3}),
    stere: new Quantity(1.0, {length: 3}),
    // Area units
    ar: new Quantity(1.00000000000000E+02, {length: 2}),
    Morgen: new Quantity(2.50000000000000E+03, {length: 2}),
    acre: new Quantity(4.04687260987425E+03, {length: 2}),
    us_acre: new Quantity(4.04687260987425E+03, {length: 2}),
    uk_acre: new Quantity(4.04685642240000E+03, {length: 2}),
    ha: new Quantity(1.00000000000000E+04, {length: 2}),
    barn: new Quantity(1.0E-28, {length: 2}),
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
    mho: new Quantity(1, {time: 3, current: 2, length: -2, mass: -1}),
    Wb: new Quantity(1, {mass: 1, length:2, time: -2, current: -1}),
    Mx: new Quantity(1.0E-8, {mass: 1, length: 2, time: -2, current: -1}),
    T: new Quantity(1, {mass: 1, current: -1, time: -2}),
    Gs: new Quantity(1.00000000000000E-04, {mass: 1, current: -1, time: -2}),
    ga: new Quantity(1.00000000000000E-04, {mass: 1, current: -1, time: -2}),
    Fr: new Quantity(3.3356409519815207E-10, {current: 1, time: 1}),
    Gi: new Quantity(7.957747E-01, {current: 1}),
    Oe: new Quantity(1000.0 / (4 * Math.PI), {current: 1, length: -1}),
    // Substance Units
    mol: new Quantity(1, {substance: 1}),
    // Luminosity Units
    cd: new Quantity(1, {luminosity: 1}),
    lm: new Quantity(1, {luminosity: 1, rotation: 2}),
    lx: new Quantity(1, {luminosity: 1, rotation: 2, length: -2}),
    footcandle: new Quantity(
      1.07639104167097201525393757037818431854248046875e+1,
      {luminosity: 1, rotation: 2, length: -2}),
    footlambert: new Quantity(
      3.426259099635390104054977200576104223728179931640625e+0,
      {luminosity: 1, length: -2}),
    lambert: new Quantity(
      3.183098861837906952132470905780792236328125e+3,
      {luminosity: 1, length: -2}),
    phot: new Quantity(1.0e4, {luminosity: 1, rotation: 2, length: -2}),
    stilb: new Quantity(1.0e4, {luminosity: 1, length: -2}),
    // Rotational units
    rad: new Quantity(1, {rotation: 1}),
    sr: new Quantity(1, {rotation: 2}),
    rev: new Quantity(2*Math.PI, {rotation: 1}),
    deg: new Quantity(Math.PI/180, {rotation: 1}),
    arcmin: new Quantity(Math.PI/10800, {rotation: 1}),
    arcsec: new Quantity(Math.PI/648000, {rotation: 1}),
    rpm: new Quantity(2*Math.PI/60, {rotation: 1, time: -1}),
    // Frequency Units
    Hz: new Quantity(1, {time: -1}),
    // Radiology Units
    Bq: new Quantity(1.0, {time: -1}),
    Gy: new Quantity(1.0, {length: 2, time: -2}),
    Sv: new Quantity(1.0, {length: 2, time: -2}),
    R: new Quantity(2.58E-04, {current: 1, time: 1, mass: -1}),
    RAD: new Quantity(1.0E-2, {length: 2, time: -2}),
    rem: new Quantity(1.0E-02, {length: 2, time: -2}),
    Ci: new Quantity(3.7E+10, {time: -1})
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
   * Convert the provided unit string to a quantity or throw and error if
   * it does not exist.
   * 
   * @param {string} unitName Name of the unit as a string. May have an 
   *                          optional prefix or raised power (e.g. [c]m^2)
   * 
   * @returns {Quantity} Quantity represented by the unit string 
   */
  function getUnitQuantity(unitName) {
    // The variable unit parts is [prefix, unit, exponent]
    let unitParts = ["", "", ""];
    let appendIdx = 1;
    for (let ii=0; ii<unitName.length; ii++) {
      if (unitName[ii] == "[") {
        appendIdx = 0;
        continue;
      } else if (unitName[ii] == "]") {
        appendIdx = 1;
        continue;
      } else if (unitName[ii] == "^") {
        appendIdx = 2;
        continue;
      }
      unitParts[appendIdx] += unitName[ii];
    }
    // Try to find the specified parts of the unit
    // Prefix
    let prefixValue;
    if (unitParts[0]) {
      prefixValue = prefixes[unitParts[0]];
      if (!prefixValue) {
        throw unitParts[0] + " is not a valid prefix";
      }
    } else {
      prefixValue = 1;
    }
    // Unit
    if (!unitParts[1]) {
      throw "Error parsing unit: \"" + unitName + "\"";
    }
    if (!units.hasOwnProperty(unitParts[1])) {
      throw (unitParts[1] + "is not a valid unit");
    }
    let unitQuantity = units[unitParts[1]].copy();
    // Exponent
    // Get the power of the unit and invert it if in section 1 (si==1)
    let powerValue;
    if (unitParts[2]) {
      powerValue = parseInt(unitParts[2]);
      if (!powerValue) {
        throw power + " is not a valid unit power";
      }
    } else {
      powerValue = 1;
    }
    // Put together the parts and return
    if (prefixValue != 1) {
      unitQuantity = unitQuantity.mul(prefixValue);
    }
    if (powerValue != 1) {
      unitQuantity = unitQuantity.pow(powerValue);
    }
    return unitQuantity;
  }

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
    let returnQuantity = new Quantity(1);
    if (unitString) {
      let sections = unitString.split("/");
      if (sections.length > 2) {
        throw "Cannot parse unit with 2 or more '/' symbols";
      }
      for (let si=0; si<sections.length; si++) {
        let unitSyms = sections[si].trim().split(/\s+/g);
        for (let ui=0; ui<unitSyms.length; ui++) {
          let unitQuantity = getUnitQuantity(unitSyms[ui]);
          if (si > 0) {
            unitQuantity = unitQuantity.inv();
          }
          // Multiply through the prefixes and powers to get the appropriate
          // quantity
          if (unitQuantity.offset == 0) {
            returnQuantity = returnQuantity.mul(unitQuantity);
          } else if (sections.length == 1 && unitSyms.length == 1) {
            // This is the only circumstance where a unit with a zero offset
            // may be returned. (Non-compound unit)
            returnQuantity = unitQuantity;
          } else {
            throw "Cannot create compound units from units with zero offsets";
          }
        }
      }
    }
    // Multiply through by magnitude and return
    returnQuantity.magnitude *= magnitude;
    return returnQuantity;
  };

  /**
   * Define an arbitrary unit symbol that can be used in calculations
   * 
   * @param {string} symbol Symbol that is used to represent the unit
   * @param {number} magnitude Magnitude of the new unit relative to the 
   *                           provided unitStr (default=1)
   * @param {string} unitStr String defining the base units to base the new 
   *                         unit off of (default="1" non-dimensional scalar)
   * @param {number} offset Zero offset of the new unit, scaled by itself
   *                        e.g. degF has an offset of 459.67 not 255.37 
   *                        (default = 0)
   */
  function define(symbol, magnitude, unitStr, offset) {
    // Check user input
    if (units.hasOwnProperty(symbol)) {
      throw "The unit " + symbol + " is already defined";
    }
    if (typeof(magnitude) === "undefined") {
      magnitude = 1;
    }
    // Create new unit and it to the global list of units
    let newUnit = pqm.quantity(magnitude, unitStr);
    if (offset) {
      // Offset must be scaled to nominal (SI) units from user input
      newUnit.offset = (offset / newUnit.magnitude);
    }
    units[symbol] = newUnit;
  }

  // Return the interface to this module
  return {
    quantity: quantity,
    define: define
  };

})();

export default pqm;
