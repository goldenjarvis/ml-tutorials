const { ensureFiniteNumber, ensureNonZero } = require('../utils/guards');

/**
 * @typedef {(value: number) => number} NumericTransform
 */

/**
 * @returns {NumericTransform}
 */
const createLogWarp = () => (value) => {
  ensureFiniteNumber(value, 'value');

  if (value <= 0) {
    throw new RangeError('createLogWarp: value must be > 0.');
  }

  return Math.log(value);
};

/**
 * @returns {NumericTransform}
 */
const createSigmoidWarp = () => (value) => {
  ensureFiniteNumber(value, 'value');
  return 1 / (1 + Math.exp(-value));
};

/**
 * @returns {NumericTransform}
 */
const createTanhWarp = () => (value) => {
  ensureFiniteNumber(value, 'value');
  return Math.tanh(value);
};

/**
 * @param {number} exponent
 * @returns {NumericTransform}
 */
const createPowerWarp = (exponent) => {
  ensureFiniteNumber(exponent, 'exponent');
  return (value) => {
    ensureFiniteNumber(value, 'value');
    return value ** exponent;
  };
};

/**
 * Creates a reciprocal warp f(x) = scale / x.
 * @param {number} [scale=1]
 * @returns {NumericTransform}
 */
const createReciprocalWarp = (scale = 1) => {
  ensureFiniteNumber(scale, 'scale');

  return (value) => {
    ensureFiniteNumber(value, 'value');
    ensureNonZero(value, 'value');
    return scale / value;
  };
};

module.exports = {
  createLogWarp,
  createSigmoidWarp,
  createTanhWarp,
  createPowerWarp,
  createReciprocalWarp,
};
