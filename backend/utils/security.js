const rateLimit = require("express-rate-limit");

const SAFE_DAY_VALUES = new Set(["Mon", "Tue", "Wed", "Thu", "Fri"]);

function setSecurityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
}

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "\ub85c\uadf8\uc778 \uc2dc\ub3c4\uac00 \ub108\ubb34 \ub9ce\uc2b5\ub2c8\ub2e4. \uc7a0\uc2dc \ud6c4 \ub2e4\uc2dc \uc2dc\ub3c4\ud558\uc138\uc694."
  }
});

function escapeLikePattern(value) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function normalizeTeacherSearchName(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, 50);
}

function validateDay(day) {
  return SAFE_DAY_VALUES.has(day);
}

function validatePeriod(period) {
  const parsed = Number(period);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 8;
}

function sanitizeTeacherInput(value, maxLength = 100) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

module.exports = {
  adminLoginLimiter,
  escapeLikePattern,
  normalizeTeacherSearchName,
  sanitizeTeacherInput,
  setSecurityHeaders,
  validateDay,
  validatePeriod
};
