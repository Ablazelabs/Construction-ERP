const express = require("express");
const router = express.Router();
const { sign } = require("jsonwebtoken");

const { sequelizer, error, confirmCredential } = require("../../config/config");
const { sequelize, QueryTypes } = sequelizer();

const inputFilter = require("../../validation/inputFilter");

router.post("/account/sendcode", async (req, res, next) => {
  try {
    inputFilter(
      { code: "number" },
      { phone_number: "string", email: "string" },
      req.body
    );
  } catch (e) {
    error(e.key, e.message, next, 400);
    return;
  }
  if (!req.body.phone_number && !req.body.email) {
    error("identifier", "email or phone must be provided", next);
    return;
  }
  const identifier = req.body.phone_number
    ? { key: "phone_number", value: req.body.phone_number }
    : { key: "email", value: req.body.email };
  try {
    sequelize.authenticate();
    const codeData = await sequelize.query(
      `SELECT code, id FROM account WHERE ${identifier.key}=:value`,
      {
        replacements: { ...identifier },
        type: QueryTypes.SELECT,
      }
    );
    if (codeData.length == 0) {
      error(identifier.key, "doesn't exit", next);
      return;
    }
    const code = codeData[0].code;
    if (code !== req.body.code) {
      error("code", "doesn't match", next);
      return;
    }
    const tempAccessToken = sign(
      {
        tempId: codeData[0].id,
      },
      process.env.ACCESS_KEY,
      { expiresIn: "1h" }
    );
    res.send({ tempAccessToken });
  } catch (e) {
    error("database", "error", next, 500);
  }
});

module.exports = router;
