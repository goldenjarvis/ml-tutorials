const { ensureFiniteNumber, ensureNumberList, ensureNonZero } = require('../utils/guards');

/**
 * @param {{ x: number, y: number }} pointA
 * @param {{ x: number, y: number }} pointB
 * @returns {number}
 */
const slopeBetween = (pointA, pointB) => {
  ensureFiniteNumber(pointA?.x, 'pointA.x');
  ensureFiniteNumber(pointA?.y, 'pointA.y');
  ensureFiniteNumber(pointB?.x, 'pointB.x');
  ensureFiniteNumber(pointB?.y, 'pointB.y');

  const deltaX = pointB.x - pointA.x;
  ensureNonZero(deltaX, 'pointB.x - pointA.x');

  return (pointB.y - pointA.y) / deltaX;
};

/**
 * First-order discrete derivative where x step is 1.
 * @param {number[]} values
 * @returns {number[]}
 */
const derivative = (values) => {
  const safeValues = ensureNumberList(values, 'derivative');

  if (safeValues.length < 2) {
    throw new RangeError('derivative: expected at least 2 values.');
  }

  return safeValues.slice(0, -1).map((value, index) => safeValues[index + 1] - value);
};

/**
 * n-th discrete derivative.
 * @param {number} order
 * @returns {(values: number[]) => number[]}
 */
const derivativeN = (order) => {
  ensureFiniteNumber(order, 'order');

  if (!Number.isInteger(order) || order < 1) {
    throw new RangeError('derivativeN: order must be a positive integer.');
  }

  return (values) => {
    let result = ensureNumberList(values, 'derivativeN(values)');

    for (let i = 0; i < order; i += 1) {
      if (result.length < 2) {
        throw new RangeError('derivativeN: insufficient values for requested order.');
      }

      result = derivative(result);
    }

    return result;
  };
};

module.exports = {
  slopeBetween,
  derivative,
  derivativeN,
};
