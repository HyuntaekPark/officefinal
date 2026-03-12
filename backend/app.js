require("dotenv").config();

const express = require("express");
const cors = require("cors");
const teachersRouter = require("./routes/teachers");
const adminRouter = require("./routes/admin");
const { verifyConnection } = require("./database/db");
const { setSecurityHeaders } = require("./utils/security");

const app = express();

app.use(cors());
app.use(setSecurityHeaders);
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", async (req, res, next) => {
  try {
    await verifyConnection();
    res.json({ status: "ok" });
  } catch (error) {
    next(error);
  }
});

app.use("/api/admin", adminRouter);
app.use("/api/teachers", teachersRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: "\uc11c\ubc84 \ub0b4\ubd80 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4."
  });
});

module.exports = app;
