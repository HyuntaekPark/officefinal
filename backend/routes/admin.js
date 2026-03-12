const express = require("express");
const { login } = require("../controllers/adminController");
const { adminLoginLimiter } = require("../utils/security");

const router = express.Router();

router.post("/login", adminLoginLimiter, login);

module.exports = router;
