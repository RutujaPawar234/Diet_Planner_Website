/** Escapes user input before it is used inside a MongoDB $regex. */
export const escapeRegex = (text = '') => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const round = (value, decimals = 0) => {
  const factor = 10 ** decimals;
  return Math.round((Number(value) || 0) * factor) / factor;
};

/** Picks only the listed keys that are present on the object. */
export const pick = (obj, keys) =>
  keys.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {});

/** Uniform success envelope: { success: true, data, message? } */
export const sendSuccess = (res, data, statusCode = 200, message) =>
  res.status(statusCode).json({ success: true, ...(message && { message }), data });
