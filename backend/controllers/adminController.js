const { getAdminId, getAdminToken, validateAdminCredentials } = require("../utils/adminAuth");

function login(req, res) {
  const { id, password } = req.body || {};

  if (!validateAdminCredentials(id, password)) {
    return res
      .status(401)
      .json({ message: "\uc544\uc774\ub514 \ub610\ub294 \ube44\ubc00\ubc88\ud638\uac00 \uc62c\ubc14\ub974\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4." });
  }

  res.json({
    token: getAdminToken(),
    adminId: getAdminId()
  });
}

module.exports = {
  login
};
