const { ensureFiniteNumber } = require('../utils/guards');

/**
 * @template T
 * @param {T} x
 * @returns {T}
 */
const identity = (x) => x;

/**
 * @template T
 * @param {T} value
 * @returns {() => T}
 */
const constant = (value) => () => value;

/**
 * @param {...Function} fns
 * @returns {(value: unknown) => unknown}
 */
const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);

/**
 * @param {...Function} fns
 * @returns {(value: unknown) => unknown}
 */
const compose = (...fns) => (value) =>
  fns.reduceRight((acc, fn) => fn(acc), value);

/**
 * @template T,U
 * @param {(value: T, index: number) => U} fn
 * @returns {(values: T[]) => U[]}
 */
const mapWith = (fn) => (values) => values.map(fn);

/**
 * @template T,U
 * @param {(acc: U, value: T, index: number) => U} fn
 * @param {U} initialValue
 * @returns {(values: T[]) => U}
 */
const reduceWith = (fn, initialValue) => (values) =>
  values.reduce(fn, initialValue);

/**
 * @param {number} min
 * @param {number} max
 * @returns {(value: number) => number}
 */
const clamp = (min, max) => {
  ensureFiniteNumber(min, 'min');
  ensureFiniteNumber(max, 'max');

  if (min > max) {
    throw new RangeError('clamp: min must be <= max.');
  }

  return (value) => {
    ensureFiniteNumber(value, 'value');
    return Math.min(max, Math.max(min, value));
  };
};

module.exports = {
  identity,
  constant,
  pipe,
  compose,
  mapWith,
  reduceWith,
  clamp,
};
