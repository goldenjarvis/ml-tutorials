/**
 * @typedef {number[]} NumberList
 */

/**
 * @param {unknown} value
 * @returns {value is number}
 */
const isFiniteNumber = (value) =>
  typeof value === 'number' && Number.isFinite(value);

/**
 * @param {unknown} values
 * @returns {values is NumberList}
 */
const isNumberList = (values) =>
  Array.isArray(values) && values.length > 0 && values.every(isFiniteNumber);

/**
 * @param {unknown} value
 * @param {string} name
 * @returns {number}
 */
const ensureFiniteNumber = (value, name) => {
  if (!isFiniteNumber(value)) {
    throw new TypeError(`${name}: expected a finite number.`);
  }

  return value;
};

/**
 * @param {unknown} values
 * @param {string} name
 * @returns {NumberList}
 */
const ensureNumberList = (values, name) => {
  if (!isNumberList(values)) {
    throw new TypeError(`${name}: expected a non-empty array of finite numbers.`);
  }

  return values;
};

/**
 * @param {number} value
 * @param {string} name
 * @returns {number}
 */
const ensureNonZero = (value, name) => {
  if (value === 0) {
    throw new RangeError(`${name}: expected non-zero value.`);
  }

  return value;
};

module.exports = {
  isFiniteNumber,
  isNumberList,
  ensureFiniteNumber,
  ensureNumberList,
  ensureNonZero,
};
