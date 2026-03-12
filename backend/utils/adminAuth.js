const ADMIN_ID = process.env.ADMIN_ID || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "100910admin";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "ksaoffice-admin-token";

function getAdminId() {
  return ADMIN_ID;
}

function getAdminToken() {
  return ADMIN_TOKEN;
}

function validateAdminCredentials(id, password) {
  return id === ADMIN_ID && password === ADMIN_PASSWORD;
}

function requireAdminAuth(req, res, next) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  if (token !== getAdminToken()) {
    return res
      .status(401)
      .json({ message: "\uad00\ub9ac\uc790 \ub85c\uadf8\uc778\uc774 \ud544\uc694\ud569\ub2c8\ub2e4." });
  }

  next();
}

module.exports = {
  getAdminId,
  getAdminToken,
  validateAdminCredentials,
  requireAdminAuth
};
