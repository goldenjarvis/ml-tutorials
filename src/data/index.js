const { ensureFiniteNumber } = require('../utils/guards');

/**
 * Generates random samples in [offset, offset + span).
 * @param {{ count: number, offset?: number, span?: number }} options
 * @returns {number[]}
 */
const randomSamples = ({ count, offset = 0, span = 1 }) => {
  ensureFiniteNumber(count, 'count');
  ensureFiniteNumber(offset, 'offset');
  ensureFiniteNumber(span, 'span');

  if (!Number.isInteger(count) || count <= 0) {
    throw new RangeError('randomSamples: count must be a positive integer.');
  }

  if (span <= 0) {
    throw new RangeError('randomSamples: span must be > 0.');
  }

  return Array.from({ length: count }, () => offset + Math.random() * span);
};

module.exports = {
  randomSamples,
};
