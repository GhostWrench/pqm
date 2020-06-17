/*******************************************************************************
* Library for dealing with physical quantities (numbers with units) in with 
* functions for parsing units from strings, converting, adding, subtracting, 
* multiplying and dividing by numbers with units attached.
*******************************************************************************/

// Import unit definitions
import {units, prefixes, dimensionTypes} from "./unitdefs.mjs";

// Constants
const numDimensionTypes = dimensionTypes.length;

/**
 * Class representing a physical quantity, that can be used in various 
 * forms of arithmetic such as addition and multiplication.
 * 
 * @param {number} magnitude Relative magnitude from reference unit
 * @param {number[]} dimensions Base dimensions of the unit
 * @param {number} offsets Base offsets from nominal of the unit (temperature 
 *                 scales only valid for units that do not have compound 
 *                 dimensions
 */
function Quantity(magnitude, dimensions, offset) {
  // Fill in member values
  this.magnitude = magnitude;
  //this.dimensions = new Array(numDimensionTypes);
  if (dimensions) {
    this.dimensions = dimensions;
  } else {
    this.dimensions = new Array(numDimensionTypes);
    for (let dimIdx=0; dimIdx<numDimensionTypes; dimIdx++) {
      this.dimensions[dimIdx] = 0;
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
};

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
    "lm", "lx", "Bq", "Gy"
  ]);
};

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
};

/**
 * Look for the most compact US Customary representation for the quantity 
 * and return it. This function is not able to represent all quantities.
 * 
 * @returns {[number, string]} Index 0: Magnitude of the quantity
 *                             Index 1: String representation of the units
 */
Quantity.prototype.inUS = function() {
  return this.with([
    "lbm", "ft", "s", "Ra", "gal", "lbf", "BTU", "HP"
  ])
};

/**
 * Display the Quantity as a string
 * 
 * @returns {string} Quantity displayed as a string
 */
Quantity.prototype.toString = function() {
  let asSI = this.inSI();
  return asSI[0].toString() + " " + asSI[1];
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
    throw (unitParts[1] + " is not a valid unit");
  }
  let unitStructure = units[unitParts[1]];
  let scale = unitStructure.s;
  let dims = new Array(numDimensionTypes);
  for (let ii=0; ii<numDimensionTypes; ii++) {
    dims[ii] = unitStructure.d[ii];
  }
  let offset;
  if (unitStructure.hasOwnProperty("o")) {
    offset = unitStructure.o;
  } else {
    offset = 0;
  }
  let unitQuantity = new Quantity(scale, dims, offset);
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
    unitQuantity.magnitude = unitQuantity.magnitude * prefixValue;
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
  let newQuantity = quantity(magnitude, unitStr);
  let newDimensions = new Array(numDimensionTypes);
  for (let ii=0; ii<numDimensionTypes; ii++) {
    newDimensions[ii] = newQuantity.dimensions[ii];
  }
  units[symbol] = {
    s: newQuantity.magnitude,
    d: newDimensions,
  };
  if (offset) {
    // Offset must be scaled to nominal (SI) units from user input
    offset = (offset / newQuantity.magnitude);
    units[symbol].o = offset;
  }
}

export default {
  quantity: quantity,
  define: define,
};
