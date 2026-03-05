const { ensureFiniteNumber, ensureNumberList, ensureNonZero } = require('../utils/guards');

/**
 * @param {number[]} values
 * @returns {number}
 */
const mean = (values) => {
  const safeValues = ensureNumberList(values, 'mean');
  return safeValues.reduce((sum, value) => sum + value, 0) / safeValues.length;
};

/**
 * @param {number[]} values
 * @returns {number}
 */
const variance = (values) => {
  const safeValues = ensureNumberList(values, 'variance');
  const avg = mean(safeValues);

  return (
    safeValues.reduce((sum, value) => {
      const diff = value - avg;
      return sum + diff * diff;
    }, 0) / safeValues.length
  );
};

/**
 * @param {number[]} values
 * @returns {number}
 */
const standardDeviation = (values) => Math.sqrt(variance(values));

/**
 * @param {number[]} values
 * @returns {{ min: number, max: number }}
 */
const minMax = (values) => {
  const safeValues = ensureNumberList(values, 'minMax');

  return safeValues.reduce(
    (acc, value) => ({
      min: Math.min(acc.min, value),
      max: Math.max(acc.max, value),
    }),
    { min: safeValues[0], max: safeValues[0] },
  );
};

/**
 * Creates a z-score normalizer for a given dataset.
 * @param {number[]} values
 * @returns {(x: number) => number}
 */
const createZScoreNormalizer = (values) => {
  const avg = mean(values);
  const sd = standardDeviation(values);
  ensureNonZero(sd, 'standardDeviation');

  return (x) => {
    ensureFiniteNumber(x, 'x');
    return (x - avg) / sd;
  };
};

/**
 * Creates a [0, 1] normalizer for a given dataset.
 * @param {number[]} values
 * @returns {(x: number) => number}
 */
const createMinMaxNormalizer = (values) => {
  const { min, max } = minMax(values);
  const span = max - min;
  ensureNonZero(span, 'max - min');

  return (x) => {
    ensureFiniteNumber(x, 'x');
    return (x - min) / span;
  };
};

module.exports = {
  mean,
  variance,
  standardDeviation,
  minMax,
  createZScoreNormalizer,
  createMinMaxNormalizer,
};
