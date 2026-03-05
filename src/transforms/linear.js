const { ensureFiniteNumber, ensureNonZero } = require('../utils/guards');

/**
 * @typedef {(value: number) => number} NumericTransform
 */

/**
 * @param {number} start
 * @param {number} end
 * @returns {(t: number) => number}
 */
const lerp = (start, end) => {
  ensureFiniteNumber(start, 'start');
  ensureFiniteNumber(end, 'end');

  return (t) => {
    ensureFiniteNumber(t, 't');
    return start + t * (end - start);
  };
};

/**
 * @param {{ inMin: number, inMax: number, outMin: number, outMax: number }} ranges
 * @returns {NumericTransform}
 */
const createRangeMapper = (ranges) => {
  ensureFiniteNumber(ranges?.inMin, 'ranges.inMin');
  ensureFiniteNumber(ranges?.inMax, 'ranges.inMax');
  ensureFiniteNumber(ranges?.outMin, 'ranges.outMin');
  ensureFiniteNumber(ranges?.outMax, 'ranges.outMax');

  const inputSpan = ranges.inMax - ranges.inMin;
  ensureNonZero(inputSpan, 'ranges.inMax - ranges.inMin');

  const toOutput = lerp(ranges.outMin, ranges.outMax);

  return (value) => {
    ensureFiniteNumber(value, 'value');
    return toOutput((value - ranges.inMin) / inputSpan);
  };
};

/**
 * @param {number} offset
 * @returns {NumericTransform}
 */
const createShift = (offset) => {
  ensureFiniteNumber(offset, 'offset');
  return (value) => {
    ensureFiniteNumber(value, 'value');
    return value + offset;
  };
};

/**
 * @param {number} factor
 * @returns {NumericTransform}
 */
const createScale = (factor) => {
  ensureFiniteNumber(factor, 'factor');
  return (value) => {
    ensureFiniteNumber(value, 'value');
    return factor * value;
  };
};

/**
 * Affine transform f(x) = scale * x + shift.
 * @param {{ scale?: number, shift?: number }} [config]
 * @returns {NumericTransform}
 */
const createAffine = ({ scale = 1, shift = 0 } = {}) => {
  const scaleFn = createScale(scale);
  const shiftFn = createShift(shift);
  return (value) => shiftFn(scaleFn(value));
};

module.exports = {
  lerp,
  createRangeMapper,
  createShift,
  createScale,
  createAffine,
};
