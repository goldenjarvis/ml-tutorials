const {
  isFiniteNumber,
  isNumberList,
  ensureFiniteNumber,
  ensureNumberList,
  ensureNonZero,
} = require('../utils/guards');

module.exports = {
  isFiniteNumber,
  isNumberList,
  assertFiniteNumber: ensureFiniteNumber,
  assertNumberList: ensureNumberList,
  assertNonZero: ensureNonZero,
  ensureFiniteNumber,
  ensureNumberList,
  ensureNonZero,
};
