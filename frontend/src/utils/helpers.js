/**
 * General-purpose utility functions.
 * Keep this file small — if a category of helpers grows, extract it.
 */

/**
 * Capitalise the first letter of every word.
 * @param {string} str
 * @returns {string}
 */
export function titleCase(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Clamp a number between a min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

